import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import bodyParser from 'body-parser'
//import logger from 'morgan'

//var cookieParser = require('cookie-parser');
var logger = require('morgan');
import indexRouter from './routes/index'
import studentsRouter from './routes/students'
import adminRouter from './routes/admin'
import collegesRouter from './routes/colleges'

import highschoolsRouter from './routes/highschools'
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

import {} from'./database/connection.js'
//const MongoClient = require('mongodb').MongoClient;
//database()

const corsOptions = {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization','Set-Cookie'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin:"http://35.245.145.223",
    //origin: "http://localhost:3000",
    preflightContinue: false,
};

var app = express();
app.use( bodyParser.json( { limit: '50MB' } ) )
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/*
 app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header("Access-Control-Allow-Origin", "localhost:3000"); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next()
})
*/
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/students', studentsRouter);
app.use('/admin',adminRouter);
app.use('/colleges',collegesRouter);
app.use('/hs',highschoolsRouter);

//module.exports = app;
export default app;