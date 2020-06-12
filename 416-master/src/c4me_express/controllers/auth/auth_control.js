
import {Student} from '../../database/schemas/Student.js';
import {SALTROUNDS, SUCCESS, ERROR} from '../../constants/constants.js'

//import {updateStudent} from '../students/students_control.js'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { College } from '../../database/schemas/College.js';
import { Questionable } from '../../database/schemas/Questionable.js';
import { detect_Questionable_Decision} from '../admin/questionable.js'
import { highschool_list_name,highschool_list_url,scrap_highschool} from '../highschools/highschool_control.js'
import { HighSchool } from '../../database/schemas/HighSchool.js';

export async function registerUser(req,res,next)
{
    try
    {
        const { username,password } = req.body;
     
        if(username == null || username == '')
        {
            res.status(500).send({"status":"Error","error_msg":"Please enter a username."});
            return;
        }
        else if(password == null || password == '')
        {
            res.status(500).send({"status":"Error","error_msg":"Please enter a username."});
            return;
        }

        let user_exists = await Student.findOne({ userid: username});

        if(user_exists != null)
        {
            res.status(500).send({"status":"Error","error_msg":"Username already exists."});
            return;
        }

        //generate salt

        //const salt = await bcrypt.genSalt(SALTROUNDS);
        //hash password

        const hashedPass = await bcrypt.hash(password,SALTROUNDS);
        //console.log(hashedPass)


        //insert into Student collection

        var new_student = new Student({userid: username,password : hashedPass});
        await new_student.save();

        res.status(200).send({"status":"OK"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Register request failed. Try again."})
    }
}

export async function loginUser(req,res,next)
{
    try
    {  

        const { username,password } = req.body;
     
        if(username == null || username == '')
        {
            res.status(500).send({"status":"Error","error_msg":"Please enter a username."});
            return;
        }
        else if(password == null || password == '')
        {
            res.status(500).send({"status":"Error","error_msg":"Please enter a username."});
            return;
        }

        let user = await Student.findOne({ userid: username});

        if(user == null)
        {
            res.status(500).send({"status":"Error","error_msg":"Username does not exists."});
            return;
        }
        // hash the input passord with the salt stored in db
        //const hashedPass = await bcrypt.hash(password,user.salt);

        //compare input password and database password

    
       // console.log(typeof(username));
       // console.log(typeof(password))
        const match = await bcrypt.compare(password,user.password);

        //console.log(hashedPass);
        //console.log(user.password)

        if(match == false)
        {
            res.status(500).send({"status":"Error","error_msg":"Password does not match."});
            return;
        }
        
        //password is a match

        //create jwt token
        var token = jwt.sign({"data":user.userid},'secret');

        // set cookie

        let options = {https :false,
        secure: false, sameSite: false,
        maxAge : 60 * 60 * 10000000000 }

        res.cookie('id',token,options)

        //console.log("OK");

        res.status(200).send({"status":"OK"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Login request failed. Try again."})
    }
}

export async function logoutUser(req,res,next)
{
    try
    {
        //console.log(req.cookies);

        //let result = jwt.verify(req.cookies.id,'secret');
        //console.log(result);
        let options = {https :false,
            secure: false, sameSite: false,
            maxAge : 60 * 60 * 10000000000 }
    
        
        res.clearCookie('id',options);
        res.status(200).send({"status":"OK"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Logout request failed. Try again."})
    }
}

// routes to verify authentication for client
export async function verifyAuth(req,res){
    try
    {
        //console.log(req);
        //console.log(req.cookies);
        //console.log(req.signedCookies)
        let result = jwt.verify(req.cookies.id,'secret');

        /*
        let authUser = await Student.findOne({userid: result.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Authentication failed. Unable to find username"});
            return;
        }
        */

        res.status(200).send({"status":"OK"});
        
    }
    catch(err)
    {
        //console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Authentication failed. Please login"});
    }
}

export async function verifyAdminAuth(req,res){
    try
    {
        let result = jwt.verify(req.cookies.id,'secret');

        if(result.data != "admin")
        {
            res.status(500).send({"status":"Error","error_msg":"Authentication failed. Not an admin account."});
            return;
        }

        res.status(200).send({"status":"OK"});
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Authentication failed. Please login"});
    }
}

export async function getProfile(req,res){
    try
    {
        let result = jwt.verify(req.cookies.id,'secret');

        
        let authUser = await Student.findOne({userid: result.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Unable to find username"});
            return;
        }
        
        //console.log(authUser);
        res.status(200).send({"status":"OK","student":authUser});
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"getProfile failed."});
    }
}
export async function updateProfile(req,res){
    try
    {
        let token_result = jwt.verify(req.cookies.id,'secret');
        
        let id = token_result.data;

        const { residence_state,high_school_name,high_school_city,high_school_state,college_class,
            major_1,major_2,SAT_math,SAT_EBRW,ACT_English,ACT_math,ACT_reading,ACT_science,ACT_composite,
            SAT_literature,SAT_US_hist,SAT_world_hist,SAT_math_I,SAT_math_II,SAT_eco_bio,SAT_mol_bio,
            SAT_chemistry,SAT_physics,num_AP_passed,gpa
        } = req.body;

        if(isNaN(college_class))
        {
            res.status(500).send({"status":"Error","error_msg":"Invalid Graduation year input: allowed ranges 2000-2100"});
            return;
        }
        if(isNaN(SAT_EBRW) || isNaN(SAT_math) || isNaN(SAT_math_I) || isNaN(SAT_math_II) || isNaN(SAT_eco_bio)
            || isNaN(SAT_mol_bio) || isNaN(SAT_chemistry) || isNaN(SAT_physics) || isNaN(SAT_US_hist,SAT_world_hist) )
            {
                res.status(500).send({"status":"Error","error_msg":"SAT scores must be a number"});
                return;
            }
        if(isNaN(ACT_composite) || isNaN(ACT_English) || isNaN(ACT_math) || isNaN(ACT_reading) || isNaN(ACT_science))
        {
            res.status(500).send({"status":"Error","error_msg":"ACT scores must be a number"});
            return;
        }
        if(isNaN(num_AP_passed))
        {
            res.status(500).send({"status":"Error","error_msg":"Number of ap passed must be a number"});
            return;
        }
        if(isNaN(gpa))
        {
            res.status(500).send({"status":"Error","error_msg":"gpa must be a number"});
            return;
        }
        // check for hs for scrap
        //onsole.log("")
        if(high_school_name != "" && highschool_list_name.includes(high_school_name) == true)
        {
            //check for scrap
            //console.log("hs 1")
            let hsRet =await HighSchool.findOne({name : high_school_name,scrapped: true})
            //console.log(hsRet)
            if(hsRet == null)
            {
                //scrap the hs
                //console.log("hs 2")
                for(let i = 0 ; i < highschool_list_name.length ; i++)
                {
                    if(highschool_list_name[i] == high_school_name)
                    {
                        //console.log("hs 3")
                        await scrap_highschool(highschool_list_url[i],high_school_name);
                        break;
                    }
                }
            }
        }
        else if(high_school_name != "")
        {
            let potentialhs = []
            for(let i = 0 ; i < highschool_list_name.length; i++)
            {
                if(highschool_list_name[i].includes(high_school_name) == true)
                    potentialhs.push(highschool_list_name[i]);
            }
            res.status(500).send({"status":"Error","error_msg":"Highschool did not exactly match any names. Here are potential highschools: "+potentialhs});
            return;
        }
        
        let query = { userid: id};

        let update = 
        {
            residence_state,high_school_name,high_school_city,high_school_state,
            college_class, major_1, major_2,SAT_math,SAT_EBRW,ACT_English,
            ACT_math, ACT_reading,ACT_science,ACT_composite,SAT_literature,
            SAT_US_hist,SAT_world_hist,SAT_math_I,SAT_math_II,SAT_eco_bio,
            SAT_mol_bio,SAT_chemistry,SAT_physics,num_AP_passed,gpa
        };
        //let options = {upsert: true, setDefaultsOnInsert: true};
        let result = await Student.updateOne(query, update);
        
        if(result.n != 1 || result.ok != 1)
        {
            console.log("Warning: did not update\add student profile\n");
            res.status(500).send({"status":"Error","error_msg":"update profile failed"+err});
            return;
        } 
    
        res.status(200).send({"status":"OK"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"update profile failed"});
    }
}

export async function addApplication(req,res,next)
{
    try
    {
        let result = jwt.verify(req.cookies.id,'secret');

        let authUser = await Student.findOne({userid: result.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Unable to find username "});
            return;
        }
        const {collegeName , status } = req.body;

        if(status == "Accepted" || status == "Denied" || status == "Pending" || status == "Deferred" || status == "Wait-listed" || status == "Withdrawn")
        {

        }
        else
        {
            res.status(500).send({"status":"Error","error_msg":"Invalid status. Valid is [Accepted,Denied,Pending,Deferred,Wait-listed,Widthdrawn]"});
            return;
        }

        let collegeRet = await College.findOne({collegeName : collegeName});
        let lower_status = status.toLowerCase();

        if(collegeRet == null)
        {
            res.status(500).send({"status":"ERROR","error_msg":"Invalid college name for application"});
            return;
        }

        if(collegeRet.applications.includes(result.data) == true)
        {
            res.status(500).send({"status":"ERROR","error_msg":"You already have an application to the college"});
            return;
        }
        let questionable = false;
        if(lower_status == "accepted" || lower_status == "denied")
        {
            questionable = await detect_Questionable_Decision({college:collegeRet,status:lower_status},authUser,1);
            if(questionable == true)
            {
                let newquestionable = new Questionable({userid : result.data,college : collegeName,status : lower_status})
                newquestionable.save()
            }
        }   
        authUser.applications.push({collegeName : collegeName,status:lower_status})
        collegeRet.applications.push({userid: result.data,status : lower_status,questionable : questionable})

        await authUser.save();
        await collegeRet.save();
        res.status(200).send({"status":"OK"});
    }
    catch(err)
    {
        res.status(500).send({"status":"ERROR","error_msg":"Error in adding application "+err});
        return;
    }
}

export async function updateApplicationStatus(req,res,next)
{
    try
    {

        const {_id,collegeName,status} = req.body;
        let result = jwt.verify(req.cookies.id,'secret');

        if(_id == null)
        {
            res.status(500).send({"status":"Error","error_msg":"Missing _id to request"});
            return;
        }
        if(status == "Accepted" || status == "Denied" || status == "Pending" || status == "Deferred" || status == "Wait-listed" || status == "Withdrawn")
        {

        }
        else
        {
            res.status(500).send({"status":"Error","error_msg":"Invalid status. Valid is [Accepted,Denied,Pending,Deferred,Wait-listed,Widthdrawn]"});
            return;
        }

        let authUser = await Student.findOne({userid: result.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Unable to find username "});
            return;
        }
        let userapp = authUser.applications;
        let i = 0;
        //console.log(_id);
        for(i = 0 ; i < userapp.length ; i++)
        {
            //console.log(userapp[i])
            if(userapp[i]._id == _id)
            {
                if(userapp[i].status == status)
                {
                    res.status(200).send({"status":"OK"});
                    return;
                }
                //console.log("here"+i);
                break;
            }
        }
        //console.log("i value after"+i);

        let collegeRet = await College.findOne({collegeName : collegeName});
        let lower_status = status.toLowerCase();

        if(collegeRet == null)
        {
            res.status(500).send({"status":"ERROR","error_msg":"Invalid college name for application"});
            return;
        }

        let questionable = false;
        if(lower_status == "accepted" || lower_status == "denied")
        {
            questionable = await detect_Questionable_Decision({college:collegeRet,status:lower_status},authUser,1);
            if(questionable == true)
            {
                let newquestionable = new Questionable({userid : result.data,college : collegeName,status : lower_status})
                newquestionable.save()
            }
        } 
        //console.log(userapp,i)  
        userapp[i].status = lower_status;
        authUser.applications = userapp;
        await authUser.save();

        for(i = 0 ; i < collegeRet.applications.length ; i++)
        {
            if(collegeRet.applications[i].userid == result.data)
                break;
        }
        collegeRet.applications[i].status = lower_status;
        collegeRet.applications[i].questionable = questionable;
        await collegeRet.save();
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"ERROR","error_msg":"Error in updating application "+err});
        return;
    }
}

// internal server authentication routes
export async function userServerAuth(req,res){
    try
    {
       
        let result = jwt.verify(req.cookies.id,'secret');

        /*
        let authUser = await Student.findOne({userid: result.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Authentication failed. Unable to find username"});
            return ERROR;
        }
        */


        return SUCCESS;
        
    }
    catch(err)
    {
    
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Authentication failed. Please login"});
        return ERROR;
    }
}

export async function adminServerAuth(req,res){
    try
    {
        let result = jwt.verify(req.cookies.id,'secret');

        if(result.data != "admin")
            return ERROR;
        
        /*
        let authUser = await Student.findOne({userid: result.data,status: 1})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Authentication failed. Unable to find admin"});
            return ERROR;
        }
        */
    
        return SUCCESS;
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"Error","error_msg":"Authentication failed. Please login"});
        return ERROR;
    }
}