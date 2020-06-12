import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var CollegeSchema = new Schema({
    collegeName:        { type: String},                //Import
    admissionRate:      { type: Number,default: -1},    //Import
    stateAbbr:          { type: String,default: ''},    //Import
    region:             { type: String,default: ''},
    size:               { type: Number,default: -1},    //Import
    institution_type:   { type: String,default: ''},    //import
    grad_debt_median:   { type: Number,default: -1},    //import GRAD_DEBT_MDN
    similarScore:       {type:Number,default : -1},
    ranking:            { type: Number,default: -1},    //Scrape 

    completionRate:     { type: Number,default: -1},    //scrap field "students graduating within 4 years"
    costInState:        { type: Number,default: -1},    //Scrape
    costOutState:       { type: Number,default: -1},    //Scrape
    avgGpa:             { type: Number,default: -1},    //Scrape
    SAT_math:           { type: Number,default: -1},    //Scrape
    SAT_EBRW:           { type: Number,default: -1},    //Scrape
    ACT_Composite:      { type: Number,default: -1},    //Scrape
    majors:             { type: [String],default: []},  //Scrape
    applications:       { type: [{userid:String,status:String,questionable: false}], default:[]}, 
});

CollegeSchema.index({collegeName : 'text'})

export var College = mongoose.model('College',CollegeSchema);