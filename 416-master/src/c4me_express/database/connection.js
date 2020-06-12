import mongoose from 'mongoose';
import {c4me_url,database_url,database_name} from '.././constants/databaseconst.js'

import mongodb from 'mongodb'
var MongoClient = mongodb.MongoClient;
var client = new MongoClient(database_url,{useUnifiedTopology:true});

client.connect(function(err,db){
  if(err != null){
      console.log(err);
      return;
  }
  var c4medb = db.db(database_name);
  connect_mongoose();
});

async function connect_mongoose(){
  try
  {
    await mongoose.connect(c4me_url,{useNewUrlParser:true,useUnifiedTopology:true});
    //mongoose.set('useFindAndModify', false);
    console.log("Connected to c4me database\nServer is ready!\n");
  }
  catch(err){
    console.log("Unable to connect to database");
  }
}
