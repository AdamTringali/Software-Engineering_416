import express from 'express'
var router = express.Router();

import {
  getStudent,
  getAllStudents,
} from '../controllers/students/students_control.js'
import {SUCCESS,ERROR} from '../constants/constants.js'

import {
    userServerAuth
} from '../controllers/auth/auth_control.js'

router.get('/', async function(req, res, next) 
{
    try
    {
        let result = await userServerAuth(req,res);
        if(result == ERROR)
            return;

        result = await getAllStudents();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK","students":result});
        }
    }
    catch(err){
        //console.log(err);
        res.status(500).send({"status":"ERROR"});
    }
});


/* Routes are prexied with /students/ */
router.get('/:id', async function(req, res, next) 
{
    try
    {
        let result = await userServerAuth(req,res);
        if(result == ERROR)
            return;
        const {id} = req.params;
        result = await getStudent(id);
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            //console.log(result);
            res.status(200).send({"status":"OK","student":result});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});


//module.exports = router;
export default router;