import axios from 'axios'
import cheerio from 'cheerio'

import 
{
    collegedata_hostname,
    college_url_exception,
    collegerank_url,
} from "../../constants/adminconsts.js";

import {college_list} from './admin_control.js'

import { College } from "../../database/schemas/College.js";


function parse_score_string(raw_string){
    let split_array = raw_string.split(' ');
    if(raw_string.includes('average'))
    {
        if(isNaN(split_array[0]))
            return -1;
        else
            return Number(split_array[0])

    }
    else
    {
        let rangearray = split_array[0].split('-');
        if(isNaN(rangearray[0]) || isNaN(rangearray[1]) ){
            return -1;
        }
        else
        {
            let high = Number(rangearray[1]);
            let low = Number(rangearray[0]);
            let range = low + ((high-low)/2);
            return range ;
        }
    }
}

export async function scrap_collegerank(){
    try
    {
        let response = await axios.get(collegerank_url);
        //console.log(response);

        //If recived ok response load the html
        if (response.status === 200) 
        {

            const data = response.data.data; //Gets html data from url

            //list of colleges to get ranking of.
            let colleges = college_list();
          
            for(let i = 0 ; i < data.length ; i++)
            {
                if(colleges.includes(data[i].name))
                {
                    //add the ranking to database for college

                    let college_query = {collegeName: data[i].name};
                    let college_update = 
                    {
                        collegeName:    data[i].name,
                        ranking:        Number(data[i].rank_order)
                    };
                
                    let options = {upsert: true, setDefaultsOnInsert: true};
                    let college_result = await College.updateOne(college_query, college_update,options);
                    if(college_result.n != 1 || college_result.ok != 1)
                    {
                        console.log("Warning : did not update or add college in scrap_collegerank\n");
                        continue;
                    }
                }
            }
            return 0;
        }
        else{
            return 1;
        }
    }
    catch(err)
    {
        console.log("Error scraping college rank "+err);
        return 1;
    }
}

export async function scrap_collegedata()
{
    try
    {
        let colleges = college_list();
        let colleges_names = college_list();
        //console.log(colleges);
        for(let i = 0; i < colleges.length ; i++)
        {
            colleges[i] = colleges[i].replace('&','');
            colleges[i] = colleges[i].replace(',','');
            colleges[i] = colleges[i].split(' ').join('-');

            if(colleges[i] in college_url_exception)
                colleges[i] = college_url_exception[colleges[i]]

            //console.log(collegedata_hostname+colleges[i]);
            let response = await axios.get(collegedata_hostname+colleges[i]);
            //console.log(response);

            //If recived ok response load the html
            if (response.status === 200) {
                const html = response.data; //Gets html data from url
                const $ = cheerio.load(html); //Converts data (removes $ tags)
                
                let college_info = {
                    costInState: -1,//Scrape
                    costOutState: -1,//Scrape
                    avgGpa: -1,//Scrape
                    SAT_math: -1, //Scrape
                    SAT_EBRW: -1, //Scrape
                    ACT_Composite: -1, //Scrape
                    completionRate: -1, //Scrape
                    majors: [], //Scrape

                }
                var SATMathIndexI = -1
                var SATMathIndexJ = -1
                var SATEBRWIndexI = -1
                var SATEBRWIndexJ = -1
                var ACTIndexI = -1
                var ACTIndexJ = -1
                var GPAIndexI = -1
                var GPAIndexJ = -1
                var costIndexI = -1
                var costIndexJ = -1

                var majorIndexI = -1
                var majorIndexJ = -1
                var gradRateIndexI = -1
                var gradRateIndexJ = -1

                /*
                $('.row').each(function(i, elem)
                {
                    $(this).children(".col-sm-6").each(function(j, elem) //For each child in this list
                    {
                        //console.log(elem);
                        //console.log($(this).find('ul').html())
                        $(this).find('ul').children().each(function(j, elem)
                        {
                            let major_string = $(this).text();
                            if(major_string.includes(', General')){
                                major_string = major_string.split(', General')[0];
                            }
                            if(major_string.includes(' Language and Literature'))
                            {
                                //console.log(colleges[i],major_string);
                                major_string = major_string.split(' Language and Literature')[0];
                    
                            }
                            college_info.majors.push(major_string)
                        });
                    });
                });*/


                $('.card-body').each(function(i, elem)
                {
                    $(this).children('h3').each(function(j, elem) //For each child in this list
                    {
                        
                        if($(this).text().trim() == "Undergraduate Majors")//Find  a strong that matches Undergraduate Majors
                        {
                            majorIndexI = i
                            majorIndexJ = j+1 //Store indcides of the tag with the corresponding info (j+1)
                        }
                    });
                    
                    if(i == majorIndexI)//When at correct DOM indices store info into collegeinfo dict object
                    {
                        $(this).children().each(function(j, elem)
                        {
                          $(this).children(".col-sm-6").each(function(j, elem) //For each child in this list
                                {               
                                    $(this).find('ul').children().each(function(j, elem)
                                    {
                                        //college_info.majors.push($(this).text())
                                        let major_string = $(this).text();
                                        if(major_string.includes(', General')){
                                            major_string = major_string.split(', General')[0];
                                        }
                                        if(major_string.includes(' Language and Literature'))
                                        {
                                            //console.log(colleges[i],major_string);
                                            major_string = major_string.split(' Language and Literature')[0];
                                
                                        }
                                        college_info.majors.push(major_string)
                                    });
                                });
                        
                        });
                    }
                });
        

                $('.dl-split-sm').each(function(i, elem) { //For each of these classes
                    $(this).children().each(function(j, elem) //For each child in this list
                    {
                        if($(this).find('strong').text().trim() == "SAT Math")//Find  a strong that matches SAT MATH
                        {
                            SATMathIndexI = i
                            SATMathIndexJ = j+1 //Store indcides of the tag with the corresponding info (j+1)
                        }
                        if($(this).find('strong').text().trim() == "SAT EBRW")
                        {
                            SATEBRWIndexI = i
                            SATEBRWIndexJ = j+1
                        }
                    });
                    $(this).children('dt').each(function(j, elem) //For each dt child in this list
                    {
                        if($(this).text().trim() == "ACT Composite")//If dt tag text match "ACT Composite we store those indices"
                        {
                            ACTIndexI = i
                            ACTIndexJ = j+1
                        }
                        if($(this).text().trim() == "Average GPA")
                        {
                            GPAIndexI = i
                            GPAIndexJ = j+1
                        }
                        if($(this).text().trim() == "Cost of Attendance")
                        {
                            costIndexI = i
                            costIndexJ = j+1
                        }
                        if($(this).text().trim() == "Students Graduating Within 4 Years")
                        {
                            gradRateIndexI = i
                            gradRateIndexJ = j+2
                        }
                    });

                    if(i == SATMathIndexI)//When at correct DOM indices store info into collegeinfo dict object
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == SATMathIndexJ)
                            {
                                college_info.SAT_math = $(this).text().trim()
                                college_info.SAT_math = parse_score_string(college_info.SAT_math);
                            }
                        });
                    }
                    if(i == SATEBRWIndexI)
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == SATEBRWIndexJ)
                            {
                                let sat_erbw_string = $(this).text().trim();
                                college_info.SAT_EBRW = parse_score_string(sat_erbw_string);
                            
                            }
                        });
                    }
                    if(i == ACTIndexI)
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == ACTIndexJ)
                            {
                                college_info.ACT_Composite = $(this).text().trim()
                                college_info.ACT_Composite = parse_score_string(college_info.ACT_Composite);
                            }
                        });
                    }
                    if(i == GPAIndexI)
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == GPAIndexJ)
                            {
                                college_info.avgGpa = $(this).text().trim()
                                if(isNaN(college_info.avgGpa))
                                    college_info.avgGpa = -1;
                                else
                                    college_info.avgGpa = Number(college_info.avgGpa);
                            }
                        });
                    }
                    if(i == costIndexI)//When at correct DOM indices store info into collegeinfo dict object
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == costIndexJ)
                            {
                                let cost_string = $(this).text().trim();
                                if(cost_string.includes('In-state'))
                                {
                                    //console.log(cost_string);
                                    cost_string = cost_string.split('$');
                                    cost_string[2] = cost_string[2].replace(',','');
                                    college_info.costOutState = Number(cost_string[2]);

                                    cost_string[1] = cost_string[1].split('Out');
                                    cost_string[1][0] = cost_string[1][0].replace(',','');
                                    //console.log(cost_string);
                                    college_info.costInState = Number(cost_string[1][0]);
                                    //console.log(cost_string);
                                }
                                else
                                {

                                    let cost = cost_string.replace('$','');
                                    cost = cost.replace(',','');
                                    if(!isNaN(cost)){
                                        college_info.costInState = Number(cost);
                                        college_info.costOutState = Number(cost);
                                    }
                                }
                            }
                        });
                    } 
                    if(i == gradRateIndexI)//When at correct DOM indices store info into collegeinfo dict object
                    {
                        $(this).children().each(function(j, elem)
                        {
                            if(j == gradRateIndexJ)
                            {
                                let rate = $(this).text().trim()
                                rate = rate.replace('%','');
                                if(isNaN(rate))
                                    college_info.completionRate = -1;
                                else
                                    college_info.completionRate = Number(rate);
                            }
                        });
                    }                  
                });
                //console.log(colleges_names[i])
                //console.log(college_info.completionRate);

                //yay data is good store it in College database
                let college_query = {collegeName: colleges_names[i]};
                let college_update = 
                {
                    collegeName:    colleges_names[i],
                    costInState:    college_info.costInState,
                    costOutState:   college_info.costOutState,
                    avgGpa:         college_info.avgGpa,
                    SAT_math:       college_info.SAT_math,
                    SAT_EBRW:       college_info.SAT_EBRW,
                    ACT_Composite:  college_info.ACT_Composite,
                    majors:         college_info.majors,
                    completionRate: college_info.completionRate,
                };
                console.log(college_info.SAT_EBRW);
                console.log(college_info.SAT_math);

                
                let options = {upsert: true, setDefaultsOnInsert: true};
                let college_result = await College.updateOne(college_query, college_update,options);
                if(college_result.n != 1 || college_result.ok != 1)
                {
                    console.log("Warning : did not update or add college in scrap_collegedata\n");
                    //console.log(college_result);
                    continue;
                }
                
            }
            else{
                console.log("Error with get request to " + colleges[i] + " status response is not 200(ok)\n");
            }
        }
        return 0;
    }
    catch(err){
        console.log("\nError scraping data from collegedata"+err);
        return 1;
    }
}

//scrap_collegedata()