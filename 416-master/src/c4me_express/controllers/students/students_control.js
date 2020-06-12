import {Student} from '../../database/schemas/Student.js';
import {SUCCESS,ERROR} from '../../constants/constants.js'

export async function getAllStudents()
{
    try
    {
        const students = await Student.find();
        //console.log(students);
        return students;
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        return ERROR;
    }
}

export async function getStudent(userid)
{
    try
    {
        const filter = {userid: userid}
        const student = await Student.findOne(filter);
        //console.log(student);
        return student;
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        return ERROR;
    }
}

/*
export async function updateStudent(id,request)
{
    try
    {
        const {
            residence_state,
            high_school_name,
            high_school_city,
            high_school_state,
            college_class,
            major_1,
            major_2,
            SAT_math,
            SAT_EBRW,
            ACT_English,
            ACT_math,
            ACT_reading,
            ACT_science,
            ACT_composite,
            SAT_literature,
            SAT_US_hist,
            SAT_world_hist,
            SAT_math_I,
            SAT_math_II,
            SAT_eco_bio,
            SAT_mol_bio,
            SAT_chemistry,
            SAT_physics,
            num_AP_passed,
            applications,
        } = request.body;

        //if()



        let query = { userid: id};


        let update = 
        {
            residence_state,
            high_school_name,
            high_school_city,
            high_school_state,
            college_class,
            major_1,
            major_2,
            SAT_math,
            SAT_EBRW,
            ACT_English,
            ACT_math,
            ACT_reading,
            ACT_science,
            ACT_composite,
            SAT_literature,
            SAT_US_hist,
            SAT_world_hist,
            SAT_math_I,
            SAT_math_II,
            SAT_eco_bio,
            SAT_mol_bio,
            SAT_chemistry,
            SAT_physics,
            num_AP_passed,
        };
        //let options = {upsert: true, setDefaultsOnInsert: true};
        let result = await Student.updateOne(query, update);
        
        if(result.n != 1 || result.ok != 1)
        {
            //console.log(id)
            //console.log(result);
            console.log("Warning: did not update\add student profile\n");
            return ERROR;
        } 
        return SUCCESS;
    }
    catch(err)
    {
        console.log("Error getting all colleges " + err);
        return ERROR;
    }
}
*/
