import express from 'express'
var router = express.Router();

import {
    getAllColleges,
    getCollege,
    searchCollege,
    getRecommendation,
    studentApplication,
    getNames,
    getStates,
    getAllCollegeNames
} from '../controllers/colleges/colleges_control.js'
import {
    userServerAuth
} from '../controllers/auth/auth_control.js'
import {SUCCESS,ERROR} from '../constants/constants.js'

/* GET home page. */
router.get('/', async function(req, res, next) 
{
    try
    {
        //console.log("before userServerAuth", req.cookies)
        let result = await userServerAuth(req,res);
        
        if(result == ERROR)
            return;
        result = await getAllColleges();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK","colleges":result});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});


router.get('/college/:id', async function(req, res, next) 
{
    try
    {
        let result = await userServerAuth(req,res);
        if(result == ERROR)
            return;
        const {id} = req.params;
        result = await getCollege(id);
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK","college":result});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});

router.post('/search',async function(req,res,next)
{
    try
    {
        //console.log(req.body);
        let result = await userServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await searchCollege(req);
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK","colleges":result});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});


router.post('/recommendation',getRecommendation);


router.post('/applications',studentApplication);

router.post('/names',getNames);

router.get('/states',getStates);

router.get('/collegeName',getAllCollegeNames);

export default router;
//module.exports = router;
