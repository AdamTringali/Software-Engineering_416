
import 
{
    college_file,
    college_scorecard_file,
    scorecard_name_variation,
    applications_file,
    students_file,
    adminuserid,
    adminpassword
} from "../../constants/adminconsts.js";
import {Student} from '../../database/schemas/Student.js';
//import {} from '../../database/connection.js'

import fs from 'fs';
import Papa from 'papaparse';
import { College } from "../../database/schemas/College.js";
import { Questionable} from "../../database/schemas/Questionable"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

//import {} from './generate_data.js'
import { detect_Questionable_Decision} from './questionable.js'

import bcrypt from 'bcrypt'
import { HighSchool } from "../../database/schemas/HighSchool.js";
import { scrap_highschool ,highschool_list_name,highschool_list_url} from "../highschools/highschool_control.js";

//import {} from './hsscraping.js'

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/';


async function addAdminAccount(){
    try
    {
        let adminAccount = await Student.findOne({userid : adminuserid});
        if(adminAccount == null)
        {
            const hashedPass = await bcrypt.hash(adminpassword,10);
            adminAccount = new Student({userid : adminuserid,password : hashedPass});

            await adminAccount.save()
        }
        return 0;
    }
    catch(err){
        console.log("Error creating admin account "+ err);
        return 1;
    }
}

addAdminAccount();

export async function markNonQuestionable(req,res,next)
{
    try
    {
        const {_id,userid,college} = req.body;
        let deleteRes = await  Questionable.deleteOne({_id : _id});
        if(deleteRes.ok == 1 && deleteRes.deletedCount == 1)
        {
            let query = {collegeName : college}
            let collegeupdateApp = await College.findOne(query);
            if(collegeupdateApp != null)
            {
                let apps = collegeupdateApp.applications;
                for(let i = 0 ; i < apps.length ; i++)
                {
                    if(apps[i].userid == userid)
                    {
                        apps[i].questionable = false;
                        collegeupdateApp.applications = apps;
                        await collegeupdateApp.save();
                        break;
                    }

                }
            }
            res.status(200).send({"status":"OK"});
            return;
        }
        res.status(500).send({"status":"ERROR","err_msg":"Error removing questionable decision from collection"});
        
    }
    catch(err)
    {
        console.log("error marking questionable applications not questionable"+ err);
        res.status(500).send({"status":"ERROR","err_msg":"updating questionable decision error "+ err});
    }
}


export async function getAllQuestionable(req,res,next)
{
    try
    {
        let questionableapps = await Questionable.find({});
        if(questionableapps == null)
        {
            res.status(500).send({"status":"ERROR","err_msg":"no questionable apps"});
            return;
        }
        res.status(200).send({"status":"OK","apps":questionableapps});
    }
    catch(err)
    {
        console.log("error getting questionable applications"+ err);
        res.status(500).send({"status":"ERROR","err_msg":"Getting questionable decision error "+ err});
    }
}


export async function delete_students()
{
    try
    {
        await Student.deleteMany({});
        await Questionable.deleteMany({});

        let colleges = await College.find({})
        for(let i = 0 ; i < colleges.length; i++)
        {
            colleges[i].applications = [];
            await colleges[i].save();
        }

        await addAdminAccount();

        return 0;
    }
    catch(err){
        console.log("Error deleting students from database "+ err);
        return 1;
    }
}

export async function reset_database()
{
    try
    {
        await Student.deleteMany({});
        await College.deleteMany({});
        await Questionable.deleteMany({});
        await HighSchool.deleteMany({});

        await addAdminAccount();
        return 0;
    }
    catch(err){
        console.log("Error deleting students from database "+ err);
        return 1;
    }
}

export function college_list(){
    try
    {
        //console.log(college_file)
        var data = fs.readFileSync(__dirname+college_file).toString().split('\n');
        for(let i = 0 ; i < data.length; i++)
            data[i] = data[i].replace("\r","");
        return data;
    }
    catch(err){
        console.log("Error getting list of colleges for import\scraping: "+err);
        return null;
    }
}

function get_number(input){
    if(isNaN(input))
        return -1;
    else
        return Number(input);
}

export async function import_scorecard()
{
    try
    {
        var data = fs.readFileSync(__dirname+college_scorecard_file).toString().split('\n');
        var college_scorecard_data = [];
        var colleges = college_list();
        var colleges_list_copy = college_list();

        //modify some names to handle slight naming variation of colleges
        for(let i = 0; i < colleges.length ; i++)
        {
            if(colleges[i] in  scorecard_name_variation)
            {
                colleges[i] = scorecard_name_variation[colleges[i]];
            }
        }
        
        for(let i = 0 ; i < data.length; i++)
        {
            var parse_response = Papa.parse(data[i]);
            if(parse_response["errors"].length != 0){
                continue;
            }
            
            data[i] = parse_response["data"][0];

           // if(i == 0){
                //for(let k = 0 ; k < data[i].length ; k++){
                    /*
                    admissionRate: Number,//ADM_RATE //col 37 (AK)
                    zip: Number,//Import
                    city: String, //Import
                    stateAbbr: String,//Import
                    size:Number,//College Scorecard field UG or College Scorecard field UGDS
                    institution_type: String, //College Scorecard field CONTROL
                    grad_debt_median: Number, //import GRAD_DEBT_MDN
                    */
                   /*
                    if(data[i][k] == "ADM_RATE")
                        console.log("adm_rate " + k);
                    if(data[i][k] == "GRAD_DEBT_MDN")
                        console.log("grad_debt " + k);
                    if(data[i][k] == "UG")
                        console.log("ug " + k);
                    if(data[i][k] == "UGDS")
                        console.log("ugds " + k);
                    if(data[i][k] == "CONTROL")
                        console.log("control " + k);
                    if(data[i][k] == "STABBR")
                        console.log("stabbr " + k);
                        */
               // }
               // return 0;
            //}
            
            for(let j = 0 ; j < colleges.length ; j++)
            {
                if(colleges[j] == data[i][3])
                {
                    //console.log(i,data[i][3]);
                    data[i][3] = colleges_list_copy[j];
                    college_scorecard_data.push(data[i]);
                    break;
                }
            }

        }
    /*
        console.log(data.length);
        console.log(colleges.length);
        console.log(college_scorecard_data.length);
        */
        // imported all colleges (colleges.txt) data from the csv file.
        for(let i = 0 ; i < college_scorecard_data.length ; i++)
        {
            let college_query = {collegeName: college_scorecard_data[i][3]};
            let college_size = get_number(college_scorecard_data[i][291])
            if(college_size == -1)
                college_size = get_number(college_scorecard_data[i][290]);

            let region = ""
            let state = college_scorecard_data[i][5];
            if(["PA","NJ","NY","CT","RI","MA","VT","NH","ME"].includes(state))
                region = "Northeast"
            else if(["ND","SD","NE","KS","MN","IA","MO","WI","IL","IN","MI","OH"].includes(state))
                region = "Midwest"
            else if(["TX","OK","AR","LA","MS","AL","TN","KY","FL","GA","SC","NC","VA","WV","DC","MD","DE"].includes(state))
                region = "South"
            else if(["WA","OR","MT","ID","WY","CA","NV","UT","CO","AZ","NM","AK","HI"].includes(state))
                region = "West"

            let college_update = 
            {
                collegeName :college_scorecard_data[i][3],
                
                admissionRate:      get_number(college_scorecard_data[i][36]),//ADM_RATE //col 37 (AK)
                stateAbbr:          college_scorecard_data[i][5],//Import
                size:               college_size,//College Scorecard field UG or College Scorecard field UGDS
                institution_type:   college_scorecard_data[i][16], //College Scorecard field CONTROL
                grad_debt_median:   get_number(college_scorecard_data[i][1504]), //import GRAD_DEBT_MDN
                region:             region
                
            };
            let options = {upsert: true, setDefaultsOnInsert: true};
            let college_result = await College.updateOne(college_query, college_update,options);
            if(college_result.n != 1 || college_result.ok != 1)
            {
                console.log("Warning : did not update\add college in import_scorecard\n");
                //console.log(college_result);
                continue;
            }
        }
        return 0;
    }
    catch(err)
    {
        console.log("Error importing college scorecard data "+err);
        return 1;
    }
}

export async function import_studentprofiles()
{
    try
    {
        //console.log(highschool_list_url,highschool_list_name);
        //var retVal = 0;
        var student_data = fs.readFileSync(__dirname+students_file).toString().split('\n');
        var application_data = fs.readFileSync(__dirname+applications_file).toString().split('\n');

        for(let i = 1 ; i < student_data.length ; i++)
        {
            var parse_response = Papa.parse(student_data[i]);
            if(parse_response["errors"].length != 0){
                //console.log("error");
                continue;
            }
            student_data[i] = parse_response["data"][0];

            let input_hs_name = student_data[i][3].toLowerCase();
            //console.log(input_hs_name);
            let studenths = await HighSchool.findOne({name : input_hs_name,scrapped: false});
            if(studenths != null)
            {
                // scrap hs data

                for(let j = 0; j < highschool_list_name.length ; j++)
                {
                    if(highschool_list_name[j] == input_hs_name)
                    {
                        await scrap_highschool(highschool_list_url[j],input_hs_name)
                        break;
                    }
                }

            }

            let hashedpassword = await bcrypt.hash(student_data[i][1],2);

            let query = { userid: student_data[i][0]};
            let update = 
            {
                userid:             student_data[i][0],
                password:           hashedpassword,
                residence_state:    student_data[i][2],
                high_school_name:   student_data[i][3],
                high_school_city:   student_data[i][4],
                high_school_state:  student_data[i][5],
                gpa:                student_data[i][6],
                college_class:      get_number(student_data[i][7]),
                major_1:            student_data[i][8],
                major_2:            student_data[i][9],
                SAT_math:           get_number(student_data[i][10]),
                SAT_EBRW:           get_number(student_data[i][11]),
                ACT_English:        get_number(student_data[i][12]),
                ACT_math:           get_number(student_data[i][13]),
                ACT_reading:        get_number(student_data[i][14]),
                ACT_science:        get_number(student_data[i][15]),
                ACT_composite:      get_number(student_data[i][16]),
                SAT_literature:     get_number(student_data[i][17]),
                SAT_US_hist:        get_number(student_data[i][18]),
                SAT_world_hist:     get_number(student_data[i][19]),
                SAT_math_I:         get_number(student_data[i][20]),
                SAT_math_II:        get_number(student_data[i][21]),
                SAT_eco_bio:        get_number(student_data[i][22]),
                SAT_mol_bio:        get_number(student_data[i][23]),
                SAT_chemistry:      get_number(student_data[i][24]),
                SAT_physics:        get_number(student_data[i][25]),
                num_AP_passed:      get_number(student_data[i][26]),
                //applications:       [],
            };
            let options = {upsert: true, setDefaultsOnInsert: true};
            let result = await Student.updateOne(query, update, options);
            
            if(result.n != 1 || result.ok != 1)
            {
                console.log("Warning: did not update\add student profile\n");
                //console.log(result);
                //retVal = 1;
                continue;
            } 
        }
        for(let i = 1; i < application_data.length ; i++)
        {
            //console.log(application_data.length, i);
            var parse_response = Papa.parse(application_data[i]);
            if(parse_response["errors"].length != 0){
                continue;
            }
            application_data[i] = parse_response["data"][0];

            //check if college in application exist in college database
            
            let college_query = {collegeName : application_data[i][1]};
            var collegeData = await College.findOne(college_query);
            if(collegeData == null){
                console.log("college not found in db "+ application_data[i][1]);
                //retVal = 1;
                continue;
            }
            //console.log(college_result);
            let duplicate_app = false;
            //console.log(collegeData);
            
            for(let j = 0 ; j < collegeData.applications.length ; j++)
            {
                //console.log(collegeData.applications);
                //console.log(application_data[i][1],student_result.applications[j].collegeName)
                if(collegeData.applications[j].userid == application_data[i][0])
                {
                    duplicate_app = true;
                    break;
                }
                //console.log(duplicate_app);
            }
            
            let student_query = { userid: application_data[i][0]};
            var student_result = await Student.findOne(student_query);
            if(student_result == null)
            {
                //retVal = 1;
                console.log("student not found in db "+ application_data[i][0]);
                continue;
            }
            /*
            
            let duplicate_app = false;
            
            for(let j = 0 ; j < student_result.applications.length ; j++)
            {
                //console.log(application_data[i][1],student_result.applications[j].collegeName)
                if(student_result.applications[j].collegeName == application_data[i][1])
                {
                    duplicate_app = true;
                    break;
                }
                //console.log(duplicate_app);
            }
            */
            
            //console.log(duplicate_app);
            if(duplicate_app == false)
            {
                //console.log(college_result);
                //console.log(student_result);
                let questionableRet = false;
                var collegeobj = {"college": collegeData, "status": application_data[i][2]}
                if(application_data[i][2] == "accepted" || application_data[i][2] == "denied")
                {
                    questionableRet =  await detect_Questionable_Decision(collegeobj,student_result,application_data.length);
                    if(questionableRet == true)
                    {
                        let newquestionable = new Questionable({userid : application_data[i][0],college : application_data[i][1],
                            status :application_data[i][2]})
                        newquestionable.save()
                    }
                }
                //console.log(application_data[i][1]);
                //store the application in student and college application array
                let student_update = 
                {
                    $push:{
                        applications: {
                            collegeName: application_data[i][1],
                            status: application_data[i][2],
                        }
                    }
                };
                let college_update = 
                {
                    $push:{
                        applications: {
                            userid: application_data[i][0],
                            status: application_data[i][2],
                            questionable: questionableRet,
                        }
                    }
                };

                student_result = await Student.updateOne(student_query, student_update);
                //console.log(student_result.n,student_result.ok);
                if(student_result.n != 1 || student_result.ok != 1)
                {
                    console.log("Warning: Did not update student application\n");
                    //console.log(student_result);
                    //retVal = 1;
                    continue;
                }

                //detect_Questionable_Decision({college : college},student_result)

                let college_query = {collegeName : application_data[i][1]};
                //console.log("1");
                let college_result = await College.updateOne(college_query, college_update);
                //console.log("2")
                //detect_Questionable_Decision({college : college},student_result)
                //console.log(college_result.n,college_result.ok);
                /*
                if(college_result.n != 1 || college_result.ok != 1)
                {
                    console.log("Warning: Did not update college's application\n");
                    //console.log(college_result);
                    //retVal = 1;
                    continue;
                }
                */

            }
            //return 0;
        }
        //console.log("completed");
        return 0;
    }
    catch(err)
    {
        console.log("Error importing student profile data " + err);
        return 1;
    }
}
/*
const delay = ms => new Promise(res => setTimeout(res, ms));
const yourFunction = async () => {
  await delay(5000);
  console.log("Waited 5s");
  await Student.deleteMany({});
  await College.deleteMany({});

  await delay(5000);
  console.log("Waited an additional 5s");


  await import_scorecard()
//await import_studentprofiles()

Student.find(function (err, students) {
    if (err) return console.error(err);
   console.log(students);
});

College.find(function (err, students) {
    if (err) return console.error(err);
   console.log(students);
});

};


yourFunction()*/