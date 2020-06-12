import express from 'express'

import { 
    getAllHighschools, 
    getAllHighschoolsName, 
    find_similar_highschools 
} from '../controllers/highschools/highschool_control.js'

var router = express.Router();

router.get('/',getAllHighschools);

router.get('/names',getAllHighschoolsName);

router.post('/similar',find_similar_highschools)

export default router;
