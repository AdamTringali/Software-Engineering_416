import express from 'express'

import {
    import_scorecard,
    import_studentprofiles,
    delete_students,
    reset_database,
    getAllQuestionable,
    markNonQuestionable
} from '../controllers/admin/admin_control.js'
import {
    scrap_collegedata, scrap_collegerank
} from '../controllers/admin/scraping.js'

import {
    adminServerAuth
} from '../controllers/auth/auth_control.js'
import {SUCCESS,ERROR} from '../constants/constants.js'
var router = express.Router();

// admin/routes


router.post('/reset', async function(req, res, next) 
{
    try
    {
        //let result = await adminServerAuth(req);
        //if(result == ERROR)
         //   return;
        let result = await reset_database();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});


router.post('/delete_students', async function(req, res, next) 
{
    try
    {
        let result = await adminServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await delete_students();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
    }
    catch(err){
        res.status(500).send({"status":"ERROR"});
    }
});

router.post('/import_scorecard', async function(req, res, next) 
{
    try
    {
        let result = await adminServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await import_scorecard();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
    }
    catch(err)
    {
        res.status(500).send({"status":"ERROR"});
    }
});

router.post('/import_students', async function(req, res, next) 
{
    try
    {
        res.setTimeout(12000000);
        let result = await adminServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await import_studentprofiles();
        //res.status(200).send({"status":"OK"});
        
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
        
    }
    catch(err)
    {
        res.status(500).send({"status":"ERROR"});
    }
});
router.post('/scrap_collegedata', async function(req, res, next) 
{
    try
    {
        let result = await adminServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await scrap_collegedata();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
    }
    catch(err)
    {
        res.status(500).send({"status":"ERROR"});
    }
});


router.post('/scrap_collegerank',async  function(req, res, next) 
{
    try
    {
        let result = await adminServerAuth(req,res);
        if(result == ERROR)
            return;
        result = await scrap_collegerank();
        if(result == ERROR)
        {
            res.status(500).send({"status":"ERROR"});
        }
        else
        {
            res.status(200).send({"status":"OK"});
        }
    }
    catch(err)
    {
        res.status(500).send({"status":"ERROR"});
    }
});

router.get('/questionableapps',getAllQuestionable);

router.post('/updateQuestionable',markNonQuestionable)



//module.exports = router;
export default router;