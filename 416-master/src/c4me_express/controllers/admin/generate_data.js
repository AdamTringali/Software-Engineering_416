import Papa from 'papaparse';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __dirname = dirname(fileURLToPath(import.meta.url)) + '/';

function highschool_list(){
    try
    {
        //console.log(college_file)
        var data = fs.readFileSync(__dirname+"highschools.txt").toString().split('\n');
        for(let i = 0 ; i < data.length; i++)
            data[i] = data[i].replace("\r","");
        return data;
    }
    catch(err){
        console.log("Error getting list of colleges for import\scraping: "+err);
        return null;
    }
}

 function college_list(){
    try
    {
        //console.log(college_file)
        var data = fs.readFileSync(__dirname+"colleges.txt").toString().split('\n');
        for(let i = 0 ; i < data.length; i++)
            data[i] = data[i].replace("\r","");
        return data;
    }
    catch(err){
        console.log("Error getting list of colleges for import\scraping: "+err);
        return null;
    }
}

let colleges = college_list()
let highschools = highschool_list();

function generate_student_profiles()
{
    let data = [];
    let majors = ["","english","math","chemistry","computer science","law","physics","music","history","philosophy"]
    let hs = ["mountain lakes high school","alpharetta high school","otsego high school","island trees high school","glendale high school"]

    for(let i = 0 ; i < 1000 ; i++)
    {
        let college = colleges[Math.floor((Math.random()*colleges.length))]
        let num = (Math.random()*2)+2;
        let gpa = Number(num.toFixed(2));
        let major_1 =  majors[Math.floor((Math.random()*majors.length))]
        let major_2 =  majors[Math.floor((Math.random()*majors.length))]
       
        let SAT_math  = Math.floor( (Math.random() *200) ) + 600  
        let SAT_EBRW      = Math.floor( (Math.random() *200) ) + 600      
        let ACT_English      = Math.floor( (Math.random() *37) ) 
        let ACT_math        = Math.floor( (Math.random() *37) ) 
        let ACT_reading       = Math.floor( (Math.random() *37) ) 
        let ACT_science      = Math.floor( (Math.random() *37) ) 
        let ACT_composite       = Math.floor( (Math.random() *37) ) 
        let SAT_literature     = Math.floor( (Math.random() *200) ) + 600  
        let SAT_US_hist        = Math.floor( (Math.random() *200) ) + 600  
        let SAT_world_hist      = Math.floor( (Math.random() *200) ) + 600  
        let SAT_math_I        = Math.floor( (Math.random() *200) ) + 600  
        let SAT_math_II     = Math.floor( (Math.random() *200) ) + 600  
        let SAT_eco_bio    = Math.floor( (Math.random() *200) ) + 600  
        let SAT_mol_bio     = Math.floor( (Math.random() *200) ) + 600  
        let SAT_chemistry = Math.floor( (Math.random() *200) ) + 600  
        let SAT_physics      = Math.floor( (Math.random() *200) ) + 600  
        let num_AP_passed     = Math.floor( (Math.random() *12) ) 
        let highschool_name =  hs[Math.floor((Math.random()*hs.length))]
        //residence_state, high_school_name, high_school_city, high_school_state,



        let student = {userid : i,password: i,residence_state: "",high_school_name :highschool_name,high_school_city : "",high_school_state: "",
                GPA:gpa,college_class:2017,major_1,major_2, SAT_math, SAT_EBRW, ACT_English, ACT_math, ACT_reading, ACT_science, ACT_composite, SAT_literature, SAT_US_hist, SAT_world_hist, SAT_math_I, SAT_math_II, SAT_eco_bio, SAT_mol_bio, SAT_chemistry, SAT_physics,num_AP_passed}
        
        data.push(student);
    }
    let csv_data = Papa.unparse(data);
   // fs.writeFileSync(__dirname+"test_appfile.csv",csv_data);
    fs.writeFile(__dirname+"test_profile.csv",csv_data,(err) =>{
        if(err)
            console.log(err);
        console.log(err)
    });
}

function generate_student_applications()
{
    let data = [];
    let status = ["pending","accepted","denied","deferred","wait-listed","withdrawn"];
    for(let i = 0 ; i < 10000 ; i++)
    {
        let userid = Math.floor((Math.random()*1000))
        let status_user = status[Math.floor((Math.random()*status.length))]
        let college = colleges[Math.floor((Math.random()*colleges.length))]
        let student = {userid : userid,college:college,status: status_user};
        data.push(student);
    }
    let csv_data = Papa.unparse(data);

    console.log(typeof(csv_data))
    //console.log(csv_data);
    fs.writeFile(__dirname+"test_appfile.csv",csv_data,(err) =>{
        if(err)
            console.log(err);
        console.log(err)
    });
    console.log("ok");
}

generate_student_applications()
generate_student_profiles()