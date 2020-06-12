import { College } from "../../database/schemas/College.js";
import {SUCCESS,ERROR} from '../../constants/constants.js'
import { Student } from "../../database/schemas/Student.js";
import jwt from 'jsonwebtoken'
import { HighSchool } from "../../database/schemas/HighSchool.js";
import {percentileAverage } from './percentileAverage.js'


export async function getAllCollegeNames(req,res,next)
{
    try
    {
        let collegenames = []
        let colleges = await College.find({});
        if(colleges == null)
        {
            //console.log("1");
            res.status(500).send({"status":"ERROR","error_msg":"getting all college names returned null"})
            return;
        }
        for(let i = 0 ; i < colleges.length ; i++)
        {
            //console.log("@");
            collegenames.push(colleges[i].collegeName);
        }
        res.status(200).send({"status":"OK","collegenames":collegenames});
    }
    catch(err)
    {
        console.log("getting names of all colleges error "+ err);
        res.status(500).send({"status":"ERROR","error_msg":"Getting names of colleges error + err"})
    }
}
export async function getAllColleges()
{
    try
    {
        const colleges = await College.find();
        //console.log(colleges);
        return colleges;
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        return ERROR;
    }
}

export async function getCollege(collegeName)
{
    try
    {
        const filter = {_id: collegeName}
        const college = await College.findOne(filter);
        //console.log(college);
        return college;
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        return ERROR;
    }
}

export async function searchCollege(req)
{
    try
    {
        const 
        {
            strict, admissionRateMin,admissionRateMax,rankingMin,
            rankingMax, sizeMin,sizeMax,satMathMin,satMathMax,satEBRWMin,
            satEBRWMax ,actCompositeMin, actCompositeMax,maxTuition, 
            name, major1, major2, location,states
        } = req.body;

        //console.log(location);

        let queries = [];

        let stateFilters = [];
        if(location[0] == true && location[1] == true && location[2] == true && location[3] == true){
            // no state filters needed.

        }
        else
        {
             //northeast
            if(location[0] == true)
                stateFilters.push( {region : "Northeast"})
            //midwest
            if(location[1] == true)
                stateFilters.push( {region : "Midwest"})
            //south
            if(location[2] == true)
                stateFilters.push( {region : "South"})
            //west
            if(location[3] == true)
                stateFilters.push( {region : "West"})

            for(let i = 0 ; i < states.length ; i++)
            {
                stateFilters.push({stateAbbr : states[i]});
            }
        }

        //console.log(stateFilters)

        let result = jwt.verify(req.cookies.id,'secret');

        let user = await Student.findOne({userid : result.data});

        if(user == null)
        {
            console.log("Unable to find userid from cookies for search colleges")
            return ERROR;
        }

        //console.log("ok");
        //console.log(user);
        

        if(strict == true)
        {
            // gte = min, lte = max
            // { birth: { $gte: new Date('1940-01-01'), $lte: new Date('1960-01-01') } }
            if(admissionRateMax != 0)
                queries.push( { admissionRate : { $gte : admissionRateMin , $lte : admissionRateMax }})
            if(rankingMax != 0)
                queries.push( { ranking : { $gte : rankingMin, $lte : rankingMax }})
            if(sizeMax != 0)
                queries.push( { size: { $gte : sizeMin, $lte : sizeMax }})
            if(satMathMax != 0)
                queries.push( { SAT_math : { $gte : satMathMin, $lte : satMathMax }})
            if (satEBRWMax != 0)
                queries.push( { SAT_EBRW : { $gte : satEBRWMin, $lte : satEBRWMax }})
            if(actCompositeMax != 0)
                queries.push( { ACT_Composite : { $gte : actCompositeMin, $lte : actCompositeMax }})
            if(stateFilters.length != 0){
                queries.push( { $or : stateFilters})
            }
            //check if stateAbbr is 
            //console.log(user);
            if(user.residence_state != "")
            {
                //console.log("executed1")
                if(maxTuition != 0)
                    queries.push( { $or : [ {$and : [ { costInState : { $lte : maxTuition}},{ institution_type : 2} ] } 
                        ,{ $and : [{stateAbbr : user.residence_state},{institution_type : 1 },{ costInState : {$lte : maxTuition}}]  },
                    {$and : [{stateAbbr : {$not : user.residence_state}},{institution_type : 1 },{ costOutState : {$lte : maxTuition}}]  } ] })
            }
            else
            {
                if(maxTuition != 0)
                    queries.push({costOutState : { $lte : maxTuition}})
            }
            
            let nameregex = new RegExp(".*" + name + ".*","i")
            
            if(name != '')
                queries.push({ collegeName : nameregex})
            let major1regex = new RegExp(".*" + major1 + ".*","i")
            let major2regex = new RegExp(".*" + major2 + ".*","i");
            if(major1 != '' && major2 != '')
                queries.push( { majors : {$all : [major1regex,major2regex] }} );
            else if(major1 != '')
                queries.push({ majors : {$all : [major1regex ] }})
            else if(major2 != '')
                queries.push({ majors : {$all : [major2regex] }})
        }
        else
        {
            if(admissionRateMax != 0)
                queries.push( {$or: [  {admissionRate : { $gte : admissionRateMin , $lte : admissionRateMax }}, {admissionRate : -1}  ]}  )
            if(rankingMax != 0)
                queries.push( {$or : [ { ranking : { $gte : rankingMin, $lte : rankingMax }}, {ranking : -1}  ]})
            if(sizeMax != 0)
                queries.push( {$or : [{ size: { $gte : sizeMin, $lte : sizeMax }} , { size : -1}]})
            if(satMathMax != 0)
                queries.push( {$or : [{ SAT_math : { $gte : satMathMin, $lte : satMathMax }},{ SAT_math : -1} ]})
            if (satEBRWMax != 0)
                queries.push(  {$or : [{ SAT_EBRW : { $gte : satEBRWMin, $lte : satEBRWMax }} ,{SAT_EBRW : -1}]})
            if(actCompositeMax != 0)
                queries.push( {$or : [{ ACT_Composite : { $gte : actCompositeMin, $lte : actCompositeMax }},{ ACT_Composite : -1}]})
            if(stateFilters.length != 0){
                stateFilters.push({region : ""});
                queries.push( { $or : stateFilters})
            }
            //check if stateAbbr is 
            //console.log("ok");
            //console.log(user)
            if(user.residence_state != "")
            {
                if(maxTuition != 0)
                    queries.push( { $or : [ {$and : [ { costInState : { $gte : 0 ,$lte : maxTuition}},{ institution_type : 2} ] } 
                        ,{ $and : [{stateAbbr : user.residence_state},{institution_type : 1 },{ costInState : {$gte : 0, lte : maxTuition}}]  },
                    {$and : [{stateAbbr : {$not : user.residence_state}},{institution_type : 1 },{ costOutState : {$gte : 0, $lte : maxTuition}}]  } ] })
            }
            else
            {
                if(maxTuition != 0)
                    queries.push({costOutState : { $gte : -1 , $lte : maxTuition}})
            }
            let nameregex = new RegExp(".*" + name + ".*","i")
            
            if(name != '')
                queries.push({ collegeName : nameregex})

            let major1regex = new RegExp(".*" + major1 + ".*","i")
            let major2regex = new RegExp(".*" + major2 + ".*","i");
            if(major1 != '' && major2 != '')
                queries.push( {$or : [{ majors : {$all : [major1regex,major2regex] }} ,{majors : []}]});
            else if(major1 != '')
                queries.push( {$or : [{ majors : {$all : [major1regex ] }},{majors : []}]})
            else if(major2 != '')
                queries.push({$or : [{ majors : {$all : [major2regex] }},{majors : []}]})
        }

        let query = {$and : queries}

        if(queries.length == 0)
            query = {}
        
        //console.log(query);
        /*
        console.log(query.$and[0].$or)
        console.log(query.$and[0].$or[0])
        console.log(query.$and[0].$or[1])
        console.log(query.$and[0].$or[2])
        console.log(query.$and[1].$or)
        */
        //console.log(query.$and[0].majors)
        let colleges = await College.find(query);
       // console.log(colleges)
        //console.log(colleges.length)
        return colleges;
        //return SUCCESS;
    }
    catch(err)
    {
        console.log("Error filtering college " + err);
        return ERROR;
    }
};

export async function getNames(req,res,next)
{
    try
    {
        var {id} = req.body;
        const college = await College.findById(id);
        if(college == null)
        {
            //console.log("no colleges");
            res.status(500).send({"status":"ERROR","error_msg":"Unable to find college with id "+ id});
            return;
        }
        let userapps = college.applications;
        let app_hs = [];

        for(let i = 0 ; i < userapps.length ; i++)
        {
            if(userapps[i].questionable == true)
                continue;
            let profile = await Student.findOne({userid : userapps[i].userid});
            if(profile == null)
            {
                console.log("Error unable to find application in Student collection ");
            }
            if(app_hs.includes(profile.high_school_name) == false)
                app_hs.push(profile.high_school_name)
        }

        res.status(200).send({  "status":"OK","names":app_hs });

    }
    catch(err)
    {
        console.log("getapplicationhighschool error "+ err);
        res.status(500).send({"status":"ERROR","error_msg":"Error getting student application highschool data" + err});
    }
}

export async function getStates(req,res,next)
{
    try
    {
        let states = [];
        const colleges = await College.find({});
        if(colleges == null)
        {
            //console.log("ok");
            res.status(500).send({"status":"ERROR","error_msg":"no colleges in system"});
            return;
        }

        for(let i = 0 ; i < colleges.length ; i++)
        {
            if(states.includes(colleges[i].stateAbbr)== false)
                states.push(colleges[i].stateAbbr);
        }
        //console.log(states);
        res.status(200).send({"status":"OK","states":states});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"ERROR","error_msg":"error getting list of states of all colleges"+err});
        return;
    }
}

// matching student application + scatterplot
export async function studentApplication(req,res,next)
{
    try
    {
        var {id,strict,classMin,classMax,status,highschool} = req.body;
        const college = await College.findById(id);
        if(college == null)
        {
            res.status(500).send({"status":"ERROR","error_msg":"Unable to find college with id "+ id});
            return;
        }
        //console.log(status,highschool,classMin,classMax)

        var status_lower = []
        for(let i = 0 ; i < status.length ; i++)
        {
            status_lower.push(status[i].toLowerCase())
        }
        let userapps = college.applications;
        let nonquestionable_apps = [];
        let userprofiles = [];


        for(let i = 0 ; i < userapps.length ; i++)
        {
            if(userapps[i].questionable == true)
                continue;
            let profile = await Student.findOne({userid : userapps[i].userid});
            if(profile == null)
            {
                console.log("Error unable to find application in Student collection ");
            }
            else
            {
                // filter the applications
                //console.log(profile);
                if(status.length > 0)
                {
                    if(strict == true)
                    {
                        if(status_lower.includes(userapps[i].status) == false)
                            continue;
                    }
                    else
                    {
                        if(userapps[i].status != "" && status_lower.includes(userapps[i].status) == false)
                            continue;
                    }
                }
                if(highschool.length > 0)
                {
                    if(strict == true)
                    {
                        if(highschool.includes(profile.high_school_name) == false)
                            continue;
                    }
                    else
                    {
                        if(profile.high_school_name != "" && highschool.includes(profile.high_school_name) == false)
                            continue;
                    }
                }
                if(classMax != -1 && classMin != -1)
                {
                    let user_class = profile.college_class;
                    if(strict == true)
                    {
                        if(user_class < classMin || user_class > classMax)
                            continue;
                    }
                    else
                    {
                        if(user_class < classMin || user_class > classMax)
                            if(user_class != -1)
                                continue;
                    }
                }
                let scatter_sat = profile.SAT_math + profile.SAT_EBRW;
                let scatter_act = profile.ACT_composite;
            

                let scatter_avg = percentileAverage(profile);
                scatter_avg = Number(scatter_avg.toFixed(2));
               
                let detail_app = {_id : userapps[i]._id,userid : userapps[i].userid, status : userapps[i].status,
                    college_class : profile.college_class, high_school_name : profile.high_school_name,
                    scatter_sat : scatter_sat, scatter_act : scatter_act, gpa: profile.gpa, scatter_avg : scatter_avg}

                nonquestionable_apps.push(detail_app);
                userprofiles.push(profile);
            }
        }


        // compute average gpa,average sat math,average sat ebrw,average act composite
        // for all applications and applications = accepted
        let totalApps =nonquestionable_apps.length;
        let totalAccept = 0

        let avg_gpa = 0
        let avg_math = 0
        let avg_ebrw = 0
        let avg_act = 0

        let avg_gpa_accept = 0
        let avg_math_accept = 0
        let avg_ebrw_accept = 0
        let avg_act_accept = 0
        for(let i = 0 ; i < userprofiles.length; i++)
        {
            var accepted = false;
            if(nonquestionable_apps[i].status =="accepted")
            {
                accepted = true;
                totalAccept = totalAccept + 1;
            }
            if(userprofiles[i].gpa != -1)
            {
                avg_gpa = avg_gpa + userprofiles[i].gpa;
                if(accepted)
                    avg_gpa_accept = avg_gpa_accept + userprofiles[i].gpa;
            }
            if(userprofiles[i].SAT_math != -1)
            {
                avg_math = avg_math + userprofiles[i].SAT_math;
                if(accepted)
                    avg_math_accept = avg_math_accept + userprofiles[i].SAT_math;
            }
            if(userprofiles[i].SAT_EBRW != -1)
            {
                avg_ebrw = avg_ebrw + userprofiles[i].SAT_EBRW;
                if(accepted)
                    avg_ebrw_accept = avg_ebrw_accept + userprofiles[i].SAT_EBRW;
            }
            //console.log(userprofiles[i]);
            if(userprofiles[i].ACT_composite != -1)
            {
                avg_act = avg_act + userprofiles[i].ACT_composite;
                if(accepted)
                    avg_act_accept = avg_act_accept + userprofiles[i].ACT_composite;
            }
        }

        avg_gpa = Number((avg_gpa / totalApps).toFixed(2));
        avg_math = Number((avg_math / totalApps).toFixed(2));
        avg_ebrw = Number((avg_ebrw / totalApps).toFixed(2));
        avg_act = Number((avg_act / totalApps).toFixed(2));

        avg_gpa_accept = Number((avg_gpa_accept / totalAccept).toFixed(2));
        avg_math_accept = Number((avg_math_accept / totalAccept).toFixed(2));
        avg_ebrw_accept = Number((avg_ebrw_accept / totalAccept).toFixed(2));
        avg_act_accept = Number((avg_act_accept / totalAccept).toFixed(2));
        
        res.status(200).send({  "status":"OK","applications":nonquestionable_apps,
            "statistics": {avg_gpa,avg_math,avg_ebrw,avg_act,avg_gpa_accept,avg_math_accept,avg_ebrw_accept,avg_act_accept }});
    }
    catch(err)
    {
        console.log("error in getting college's student application "+ err);
        res.status(500).send({"status":"ERROR","error_msg":"Error getting student application data" + err});
    }
}




export async function getRecommendation(req,res,next)
{
    try
    {
        let result = []
        var {colleges} = req.body;
        if(colleges == null)
        {
            res.status(500).send({"status":"Error","error_msg":"colleges is null"});
            return;
        }

        let verifyRet = jwt.verify(req.cookies.id,'secret');
        let authUser = await Student.findOne({userid: verifyRet.data})
        if(authUser == null){
            res.status(500).send({"status":"Error","error_msg":"Unable to find username"});
            return;
        }
        //console.log(authUser);
        //console.log("recommendation");
        //console.log(colleges);
        let college_recommend = await compute_College_Recommendation_Score(colleges,authUser);
        //console.log(college_recommend[0]);
        //console.log(college_recommend)
        for(let i = 0 ; i < college_recommend.length; i++)
        {
            console.log(college_recommend[i].collegeName,college_recommend[i].similarScore);
        }
        res.status(200).send({"status":"OK","colleges":college_recommend});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({"status":"ERROR"});
    }
}


/* 
    Purpose: Convert String ("A+") to numeric value

    Details:
     - Simple switch statement
*/
function convertLetterGrade(g) {
    switch (g) {
        case "A+":
            return 4.0
            break
        case "A":
            return 3.6
            break
        case "A-":
            return 3.3
            break
        case "B+":
            return 3.0
            break
        case "B":
            return 2.7
            break
        case "B-":
            return 2.4
            break
        case "C+":
            return 2.1
            break
        case "C":
            return 1.8
            break
        case "C-":
            return 1.5
            break
        case "D+":
            return 1.2
            break
        case "D":
            return 0.9
            break
        case "D-":
            return 0.6
            break
        case "F":
            return 0.3
            break
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

/* 
    Purpose: Loop through list of colleges, assign a reccomendation score, return a sorted list

    Details:
     - Simple loop calls computeCollegeSimilarityScore() to assign scores
     - Sorts list sorted by similar score and returns that list

*/
async function compute_College_Recommendation_Score(college_collection, userProfile) {
    var new_college_collection = []

    //Loop through Colleges

    for (let i = 0 ; i < college_collection.length ; i++) {
        ////console.log(college_collection);
        let col = college_collection[i];
        //console.log(col.collegeName);
        let recommendationscore = await computeCollegeSimilarityScore(college_collection[i], userProfile)
        //console.log(recommendationscore);
        recommendationscore = Number(recommendationscore.toFixed(2));
        col.similarScore = recommendationscore;
        //console.log(col.similarScore);
        //console.log(college_collection[college]["similarScore"])
        new_college_collection.push(col)
    }
    //console.log(new_college_collection[0])
    //console.log(new_college_collection[0].similarScore);
    //var recommended_Colleges_List = new_college_collection;//.sort((a, b) => (a.similarScore > b.similarScore) ? 1 : -1)

    //Return Sorted List
    return new_college_collection.sort((a, b) => (a.similarScore > b.similarScore) ? 1 : -1)
}


/* 
    Purpose: Compute a value out of 1.0 of how much we can reccomend a college to a student

    Details:
     - Function uses a CONSTANTS object to control missing data, and to make code cleaner.
     - Similar to all other functions and uses calculate_weighted_score() method to compare criteria
     - Similar to other functions where checks if data is missing and removes that criteia and 
       spread weights if it is, using removeAndSpreadWeights() function
*/
async function computeCollegeSimilarityScore(college, userProfile) {
    try
    {
        //console.log(college);
        var SIMILAR_COLLEGE_CONSTANTS = {
            TOTALS: {
                GPA: 1.5, //Played around with these numbers and found optimal one
                SAT: 800, //Played around with these numbers and found optimal one
                ACT: 18, //Played around with these numbers and found optimal one
            },
            WEIGHTS: {
                GPA: 0.2,
                SAT: 0.2,
                ACT: 0.2,
                SIMILAR_STUDENTS: 0.4,
            },

        }

        //If GPA is not -1 (missing data) calculate weighted score, else remove that criteria
        var gpaScore = 0
        if (college.avgGpa > -1 && userProfile.gpa > -1) {
            gpaScore = calculate_weighted_score(college.avgGpa - userProfile.gpa, SIMILAR_COLLEGE_CONSTANTS.TOTALS.GPA, 1)
        } 
        else {
            removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "GPA")
        }

        //If ACT is not -1 (missing data) calculate weighted score, else remove that criteria
        var WeightedACT = 0
        if (college.ACT_Composite > -1 && userProfile.ACT_composite > -1) {
            WeightedACT = calculate_weighted_score(college.ACT_Composite - userProfile.ACT_composite, SIMILAR_COLLEGE_CONSTANTS.TOTALS.ACT, 1)
        } else {
            removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "ACT")
        }

        //If SAT_EBEW AND SAT_math is not -1 (missing data) calculate weighted score, else remove that criteria
        var WeightedSAT = 0
        if (college.SAT_EBRW > -1 && userProfile.SAT_EBRW > -1 && college.SAT_math > -1 && userProfile.SAT_math > -1) {
            let WeightedSATEBRW = calculate_weighted_score(college.SAT_EBRW - userProfile.SAT_EBRW, SIMILAR_COLLEGE_CONSTANTS.TOTALS.SAT / 2, 0.5) //Get full results and multiply by weights later if they change
            let WeightedSATMATH = calculate_weighted_score(college.SAT_math - userProfile.SAT_math, SIMILAR_COLLEGE_CONSTANTS.TOTALS.SAT / 2, 0.5)
            WeightedSAT = WeightedSATMATH + WeightedSATEBRW
        } else {
            removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "SAT")
        }


        //Check how many similar students were accepted to the school
        var SimilarStudentsScore = 0
        var total = 0
        var numSimStudents = 0

        //If there are no applications remove that criteria
        if (college.applications.length < 1) {
            removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "SIMILAR_STUDENTS")
        } else {
            //Loop through all acceptance decisions for the college
            for (let i = 0 ; i < college.applications.length;i++) {
                let app = college.applications[i]
                if(app.status == "accepted") //If status is accepted then we compute
                {
                    //Compare each student to user using determine_Similar_Profiles()
                    //numSimStudents = number of students with 75% or more similar profile to the user
                    let user_info = await Student.findOne({userid : app.userid});
                    let similarScore = await determine_Similar_Profile(user_info, userProfile)
                    if (similarScore > 0.75) {
                        numSimStudents += 1
                    }
                    //total += 1
                }
                total += 1
            }
            SimilarStudentsScore = numSimStudents / total * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS
        }

        //Compute final scores after all weights have been distributed:

        if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.GPA != undefined)
            gpaScore = gpaScore * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.GPA
        if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SAT != undefined)
            WeightedSAT = WeightedSAT * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SAT
        if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.ACT != undefined)
            WeightedACT = WeightedACT * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.ACT
        if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS != undefined)
            SimilarStudentsScore = SimilarStudentsScore * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS

        //console.log(gpaScore, WeightedSAT, WeightedACT, SimilarStudentsScore)

        //Add the individual criteria up and return final score
        let final_score = (gpaScore + WeightedSAT + WeightedACT + SimilarStudentsScore)
     
       
        
        return final_score
    }
    catch(err)
    {
        console.log(err);
    }
}

/* 
    Purpose: Compute a value out of 1.0 of how similar two user profiles are

    Details:
     - Function uses a CONSTANTS object to control missing data, and to make code cleaner.
     - Similar to all other functions and uses calculate_weighted_score() method to compare criteria
     - Similar to other functions where checks if data is missing and removes that criteia and 
       spread weights if it is, using removeAndSpreadWeights() function
*/
async function determine_Similar_Profile(profile1, profile2) {
    try
    {
        var SIMILAR_STUDENT_CONSTANTS = {
            TOTALS: {
                GPA: 1.5, //Played around with these numbers and found optimal one
                SAT: 800, //Played around with these numbers and found optimal one
                ACT: 18, //Played around with these numbers and found optimal one
                HS: 1, //Function returns val out of 1
            },
            WEIGHTS: {
                GPA: 0.4,
                SAT: 0.2,
                ACT: 0.2,
                HS: 0.2,
            },

        }

        //If GPA is not -1 (missing data) calculate weighted score, else remove that criteria
        var gpaScore = 0
        if (profile1.gpa > -1 && profile2.gpa > -1) {
            gpaScore = calculate_weighted_score(profile1.gpa - profile2.gpa, SIMILAR_STUDENT_CONSTANTS.TOTALS.GPA, 1) //Get full results and multiply by weights later if they change

        } else {
            removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "GPA")
        }

        //If ACT is not -1 (missing data) calculate weighted score, else remove that criteria
        var WeightedACT = 0
        if (profile1.ACT_composite > -1 && profile2.ACT_composite > -1) {
            WeightedACT = calculate_weighted_score(profile1.ACT_composite - profile2.ACT_composite, SIMILAR_STUDENT_CONSTANTS.TOTALS.ACT, 1)
        } else {
            removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "ACT")
        }

        //If Both SAT is not -1 (missing data) calculate weighted score, else remove that criteria
        var WeightedSAT = 0
        if (profile1.SAT_EBRW > -1 && profile2.SAT_EBRW > -1 && profile1.SAT_math > -1 && profile2.SAT_math > -1) { //MAKE SURE IF USER ENTERS ONE SAT_EBRW !! IT MSUT ENTER MATH RESTRICT THIS*********************************
            let WeightedSATEBRW = calculate_weighted_score(profile1.SAT_EBRW - profile2.SAT_EBRW, SIMILAR_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5) //Get full results and multiply by weights later if they change
            let WeightedSATMATH = calculate_weighted_score(profile1.SAT_math - profile2.SAT_math, SIMILAR_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5)
            WeightedSAT = WeightedSATMATH + WeightedSATEBRW
        } else {
            removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "SAT")
        }

        //If HS is not missing calculate weighted score, else remove that criteria
        var WeightedHS = 0
        if (profile1.high_school != null && profile2.high_school != null) {
            let hsprofile1 = await HighSchool.findOne({name : profile1.high_school_name,scrapped :true})
            let hsprofile2 = await HighSchool.findOne({name : profile2.high_school_name,scrapped :true})
            if(hsprofile1 != null && hsprofile2 != null)
                WeightedHS = determine_similar_HS_value(profile1.high_school, profile2.high_school)
        } else {
            removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "HS")
        }


        //Compute final scores after all weights have been distributed:
        if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.GPA != undefined)
            gpaScore = gpaScore * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.GPA
        if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.SAT != undefined)
            WeightedSAT = WeightedSAT * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.SAT
        if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.ACT != undefined)
            WeightedACT = WeightedACT * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.ACT
        if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.HS != undefined)
            WeightedHS = WeightedHS * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.HS

        
        //console.log(gpaScore, WeightedSAT, WeightedACT, WeightedHS)
        let final_score = (gpaScore + WeightedSAT + WeightedACT + WeightedHS)

       
        
        return final_score
    }
    catch(err)
    {
        console.log("error in compute recommendation score timeout "+ err);
        return 0;
    }
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

    //console.log(hs2.name);
    //console.log(WeightedHS, WeightedSAT, WeightedACT, WeightedGradRate, WeightedStateMath, WeigthedStateReading)

    var similarity = WeightedHS + WeightedSAT + WeightedACT + WeightedGradRate + WeightedStateMath + WeigthedStateReading
    return similarity
}



