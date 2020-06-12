import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var HighSchoolSchema = new Schema({
    name:       {type : String, default : ""},
    //All scraped from NICE
    AcademicGrade:          {type : String, default : ""},
    graduationRate:         {type : Number, default : -1},
    city:                   {type : String, default : ""},
    state:                  {type : String, default : ""},
    SAT_Composite:          {type : Number, default : -1},
    ACT_Composite:          {type : Number, default : -1},
    stateMath:              {type : Number, default : -1},
    stateReading:           {type : Number, default : -1},
    APpassRate:             {type : Number, default : -1},
    scrapped:               {type : Boolean, default : false},
    similarScore:           {type : Number, default: null}
});

export var HighSchool = mongoose.model('HighSchool',HighSchoolSchema);