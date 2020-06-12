import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'
import cheerio from 'cheerio'
import jwt from 'jsonwebtoken'


import { HighSchool } from "../../database/schemas/HighSchool.js";
import 
{
    highschool_file,
    highschooldata_hostname
} from "../../constants/highschoolconst.js";
import { scrap_collegerank } from '../admin/scraping.js';

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/';

export var highschool_list_name = [];
export var highschool_list_url = [];
async function highschool_list(){
    try
    {
        //console.log(college_file)
        var data = fs.readFileSync(__dirname+highschool_file).toString().split('\n');
        for(let i = 0 ; i < data.length; i++)
        {
            data[i] = data[i].replace("\r","");

            let url = data[i].replace(",","-");
            let splitdata = data[i].split(",");
            let hs_name = splitdata[0].replace(/-/g," ");
            let lastdata = splitdata[1].split("-");
            let size = lastdata.length;
            let hs_state = lastdata[size-1];
            let hs_city = lastdata[0];
            for(let j = 1 ; j < size -1; j++)
            {
                hs_city = hs_city + " " + lastdata[j];
            }
        
            //console.log(hs_name,"      ",hs_city,"         ",hs_state);
            highschool_list_name.push(hs_name);
            highschool_list_url.push(url);
            let hsres = await HighSchool.findOne({ name : hs_name});
            if(hsres == null)
            {
                let newhs = new HighSchool({ name : hs_name,city: hs_city,state : hs_state});
                await newhs.save();
            }
            //await scrap_highschool(url,hs_name);
            
        }

        //await scrap_highschool(highschool_list_url[0],highschool_list_name[0]);
        //return data;
        
    }
    catch(err){
        console.log("Error getting list of colleges for import\scraping: "+err);
        //return null;
    }
}

highschool_list()

export async function getAllHighschools(req,res,next)
{
    try
    {
        jwt.verify(req.cookies.id,'secret');
        const hs = await HighSchool.find({scrapped : true});
        if(hs == null || hs.length == 0)
        {
            res.status(500).send({"status":"ERROR","error_msg":"No highschools in system"});
        }
        res.status(200).send({"status":"OK","highschools":hs});
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        res.status(500).send({"status":"ERROR","error_msg":"Error getting all colleges" + err});
    }
}

export async function getAllHighschoolsName(req,res,next)
{
    try
    {
        jwt.verify(req.cookies.id,'secret');
        let hs_names = [];
        const hs = await HighSchool.find({scrapped : true});
        if(hs == null || hs.length == 0)
        {
            res.status(500).send({"status":"ERROR","error_msg":"No highschools in system"});
            return;
        }
        for(let i = 0 ; i < hs.length ; i++)
        {
            hs_names.push(hs[i].name);
        }
        res.status(200).send({"status":"OK","names":hs_names});
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        res.status(500).send({"status":"ERROR","error_msg":"Error getting all colleges" + err});
    }
}


function convert2num(strings)
{

    if(strings == -1)
        return -1;
    var input = strings.replace("%","");
    if(isNaN(input))
        return -1
    return Number(input);
}


export async function find_similar_highschools(req,res,next)
{
    try
    {
        const { search } = req.body;
        console.log(req.body)

        if(search == null || search == '')
        {
            res.status(500).send({"status":"Error","error_msg":"No highschool was entered for search"})
            return;
        }

        let userhs = await HighSchool.findOne({name : search,scrapped : true });
        if(userhs == null)
        {
            res.status(500).send({"status":"Error","error_msg":"HighSchool does not exist in the system"});
            return;
        }

        let hs_collection = await HighSchool.find({scrapped: true});
        if(hs_collection == null || hs_collection.length == 0 || hs_collection.length == 1)
        {
            res.status(500).send({"status":"Error","error_msg":"No other highschools to determine similiarity"});
            return;
        }

        //let highschools = [];
        let similarRes = compute_similar_HighSchools(hs_collection,userhs);
        console.log(similarRes);
        res.status(200).send({"status":"OK","highschools":similarRes});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"finding similar highschools error"+err})
    }
}



/* 
    Purpose: Remove one of the criteria in the CONSTANTS, and spread the weight value to the rest

    Details:
     - Looks in the CONSTANTS object, deletes the criteria, takes the value, and spreads to rest using loop
*/
function removeAndSpreadWeights(criteria, section) {
    var toAdd = criteria[section]
    delete criteria[section]
    for (var key in criteria) {
        if (criteria.hasOwnProperty(key)) {
            criteria[key] += (toAdd / Object.keys(criteria).length)
        }
    }
}

/* 
    Purpose: Compute a value out of 1.0 of how similar paramater hs1 is to hs2 (Highschools)

    Details:
     - Function uses a CONSTANTS object to control missing data, and to make code cleaner.
*/
function calculate_weighted_score(difference, total, weight) {
    if (Math.abs(difference) > total)
        return 0
    return (1 - Math.abs((difference / total))) * weight
}

function compute_similar_HighSchools(hs_collection, userHs,) {
    var similar_hs_list = []
    for (let i = 0 ; i < hs_collection.length ; i++) {
        let hs = hs_collection[i];
        //scoredHs = hs
        hs.similarScore = Number(determine_similar_HS_value(userHs, hs).toFixed(2));
        console.log(hs.similarScore);
        similar_hs_list.push(hs)
    }
    similar_hs_list.sort((a, b) => (a.similarScore > b.similarScore) ? 1 : -1)
    //similar_hs_list = similar_hs_list.slice(0, numToDisplay)
    return similar_hs_list
}


/* 
    Purpose: Compute a value out of 1.0 of how similar paramater hs1 is to hs2 (Highschools)

    Details:
     - Function uses a CONSTANTS object to control missing data, and to make code cleaner.
     - Similar to all other functions and uses calculate_weighted_score() method to compare criteria
     - Similar to other functions where checks if data is missing and removes that criteia and 
       spread weights if it is, using removeAndSpreadWeights() function
     - Scraped niche grade converted to number using converLetterGrade() method
*/

function determine_similar_HS_value(hs1, hs2) {
    var SIMILAR_HS_CONSTANTS = {
        TOTAL: {
            ACADEMIC_GRADE: 4.0,
            SAT: 1600,
            ACT: 36,
            GRADUATION_RATE: 100,
            STATE_TEST: 100,
        },

        WEIGHTS: {
            ACADEMIC_GRADE: 0.25,
            SAT: 0.25,
            ACT: 0.25,
            GRADUATION_RATE: 0.10,
            STATE_TEST_MATH: 0.0725,
            STATE_TEST_READING: 0.0725,
        },
    }

    //If Both Academic Grade is not -1 (missing data) calculate weighted score, else remove that criteria
    var WeightedHS = 0
    if (hs1.AcademicGrade > -1 && hs2.AcademicGrade > -1) {
        var grade1 = convertLetterGrade(hs1.AcademicGrade)
        var grade2 = convertLetterGrade(hs2.AcademicGrade)
        WeightedHS = calculate_weighted_score(grade1 - grade2, SIMILAR_HS_CONSTANTS.TOTAL.ACADEMIC_GRADE, 1)
    } else {
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "ACADEMIC_GRADE")
    }

    //If Both SAT Grade is not -1 (missing data) calculate weighted score, else remove that criteria
    if (hs1.SAT_Composite > -1 && hs2.SAT_Composite > -1) {
        var WeightedSAT = calculate_weighted_score(hs1.SAT_Composite - hs2.SAT_Composite, SIMILAR_HS_CONSTANTS.TOTAL.SAT, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeightedSAT = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "SAT")
    }

    //If Both ACT Grade is not -1 (missing data) calculate weighted score, else remove that criteria
    if (hs1.ACT_Composite > -1 && hs2.ACT_Composite > -1) {
        var WeightedACT = calculate_weighted_score(hs1.ACT_Composite - hs2.ACT_Composite, SIMILAR_HS_CONSTANTS.TOTAL.ACT, 1)
    } else {
        var WeightedACT = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "ACT")
    }

    //If Both Graduation Rate is not -1 (missing data) calculate weighted score, else remove that criteria
    if (hs1.graduationRate > -1 && hs2.graduationRate > -1) {
        var WeightedGradRate = calculate_weighted_score(hs1.graduationRate - hs2.graduationRate, SIMILAR_HS_CONSTANTS.TOTAL.GRADUATION_RATE, 1)
    } else {
        var WeightedGradRate = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "GRADUATION_RATE")
    }

    //If Both State Math Scores is not -1 (missing data) calculate weighted score, else remove that criteria
    if (hs1.stateMath > -1 && hs2.stateMath > -1) {
        var WeightedStateMath = calculate_weighted_score(hs1.stateMath - hs2.stateMath, SIMILAR_HS_CONSTANTS.TOTAL.STATE_TEST, 1)
    } else {
        var WeightedStateMath = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "STATE_TEST_MATH")
    }

    //If Both State Reading Scores is not -1 (missing data) calculate weighted score, else remove that criteria
    if (hs1.stateReading > -1 && hs2.stateReading > -1) {
        var WeigthedStateReading = calculate_weighted_score(hs1.stateReading - hs2.stateReading, SIMILAR_HS_CONSTANTS.TOTAL.STATE_TEST, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeigthedStateReading = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "STATE_TEST_READING")
    }

    //Compute final scores after all weights have been distributed:
    if (SIMILAR_HS_CONSTANTS.WEIGHTS.ACADEMIC_GRADE != undefined)
        WeightedHS = WeightedHS * SIMILAR_HS_CONSTANTS.WEIGHTS.ACADEMIC_GRADE

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.SAT != undefined)
        WeightedSAT = WeightedSAT * SIMILAR_HS_CONSTANTS.WEIGHTS.SAT

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.ACT != undefined)
        WeightedACT = WeightedACT * SIMILAR_HS_CONSTANTS.WEIGHTS.ACT

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.GRADUATION_RATE != undefined)
        WeightedGradRate = WeightedGradRate * SIMILAR_HS_CONSTANTS.WEIGHTS.GRADUATION_RATE

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_MATH != undefined)
        WeightedStateMath = WeightedStateMath * SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_MATH

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_READING != undefined)
        WeigthedStateReading = WeigthedStateReading * SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_READING

    console.log(hs2.name);
    //console.log(WeightedHS, WeightedSAT, WeightedACT, WeightedGradRate, WeightedStateMath, WeigthedStateReading)

    var similarity = WeightedHS + WeightedSAT + WeightedACT + WeightedGradRate + WeightedStateMath + WeigthedStateReading
    return similarity
}

/* 
    Purpose: Scrape a url for a given high school

    Details:
     - Function uses a axios and cheerio to scrape a url
     - Specifically done for NICE.com or SBU Mirror links
     - Goes through to specific hierchy of tags, (children of divs of children of spans)
*/
export async function scrap_highschool(urlname,name)
{
    try
    {
        //console.log(highschooldata_hostname+urlname);
        let url = highschooldata_hostname + urlname;
        let response = await axios.get(url);
        const html = 0;
        if (response.status === 200) {
            const html = response.data; //Gets html data from url
            const $ = cheerio.load(html); //Converts data (removes $ tags)


            //Create highschool object and set default values
            let hs_info = {
                AcademicGrade: -1, //Scrape
                SAT_Composite: -1, //Scrape
                ACT_Composite: -1, //Scrape
                graduationRate: -1, //Scrape
                stateMath: -1, //Scrape
                stateReading: -1, //Scrape
                APpassRate: -1

            }
            var indexI = -1
            var indexI2 = -1
            var nicheGradeIndex = -1


            $('.blank__bucket').each(function (i, elem) {

                //console.log($(this).text())
                $(this).find('.scalar__label').each(function (j, elem) //For each child in this list
                    {
                        if ($(this).find('span').text().trim() == "Average Graduation Rate") //
                        {
                            indexI = i
                        }
                        if ($(this).find('span').text().trim() == "Percent Proficient - Reading") //
                        {
                            indexI2 = i
                        }
                    });


                if (i == indexI) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            var element_info = $(this)
                                .clone() //clone the element
                                .children() //select all the children
                                .remove() //remove all the children
                                .end() //again go back to selected element
                                .text(); //get the text of element

                            $(this).find('span').each(function (j, elem) //
                                {
                                    element_info = $(this).text()
                                });

                            switch (j) //Scraped in order of website [gradrate, sat, act, ap]
                            {
                                case 0:
                                    hs_info.graduationRate = element_info
                                    break
                                case 1:
                                    hs_info.SAT_Composite = element_info
                                    break
                                case 2:
                                    hs_info.ACT_Composite = element_info
                                    break
                                case 3:
                                    hs_info.APpassRate = element_info
                                    break
                            }
                        });
                }
                if (i == indexI2) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            $(this).find('span').each(function (k, elem) //
                                {
                                    var element_info = $(this).text()
                                    hs_info.stateReading = element_info

                                });                            
                        });
                }
                if (i == indexI2+1) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            $(this).find('span').each(function (k, elem) //
                                {
                                    var element_info = $(this).text()
                                    hs_info.stateMath = element_info
                                });                            
                        });
                }
            });

            $('.profile-grade--two').each(function (i, elem) {

                //console.log($(this).text())
                $(this).find('div').each(function (j, elem) //For each child in this list
                    {
                        if($(this).text().trim() == "Academics") //
                        {
                            nicheGradeIndex = i
                        }
                    });
                if(nicheGradeIndex == i) //If previous div tag was "Academics"
                {
                    $(this).find('div').each(function (j, elem) //For each child in this list
                    {
                        if (j == 1) //
                        {
                            hs_info.AcademicGrade = $(this).text()
                        }
                    });
                }
               
            });

            //console.log(hs_info)
            hs_info.graduationRate = convert2num(hs_info.graduationRate);
            hs_info.SAT_Composite = convert2num(hs_info.SAT_Composite);
            hs_info.ACT_Composite = convert2num(hs_info.ACT_Composite);
            hs_info.APpassRate = convert2num(hs_info.APpassRate);
            hs_info.stateMath = convert2num(hs_info.stateMath);
            hs_info.stateReading = convert2num(hs_info.stateReading);
            let query = {name :name};
            let update = {
                AcademicGrade :     hs_info.AcademicGrade,
                graduationRate:     hs_info.graduationRate,
                SAT_Composite:      hs_info.SAT_Composite,
                ACT_Composite:      hs_info.ACT_Composite,
                stateMath:          hs_info.stateMath,
                stateReading:       hs_info.stateReading,
                APpassRate:         hs_info.APpassRate,
                scrapped:           true,
            }
        
            let hs_update = await HighSchool.updateOne(query,update);
            //console.log(hs_update);
            if(hs_update.n != 1 || hs_update.ok != 1)
            {
                console.log("Warning : did not update\add college in import_scorecard\n");
                //console.log(college_result);
                //continue;
            }
            return {"status":"OK","highschool_info":hs_info};
            
        }
        console.log("response was not 200 by axios hs scraping");
        return {"status":"ERROR","error_msg":"Response was not 200 by axios hs scraping"};
    }
    catch(err)
    {
        console.log("error scraping hs ",err);
        return {"status":"ERROR","error_msg":"error scraping hs scraping " + err};
    }
}


