import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    userid:             { type: String}, 
    password:           { type: String},
    residence_state:    { type: String,default: ''},
    high_school_name:   { type: String,default: ''},
    high_school_city:   { type: String,default: ''},
    high_school_state:  { type: String,default: ''},
    gpa:                { type: Number,default: -1}, 
    college_class:      { type: Number,default: -1},
    major_1:            { type: String,default: ''},
    major_2:            { type: String,default: ''}, 
    SAT_math:           { type: Number,default: -1}, 
    SAT_EBRW:           { type: Number,default: -1}, 
    ACT_English:        { type: Number,default: -1}, 
    ACT_math:           { type: Number,default: -1}, 
    ACT_reading:        { type: Number,default: -1}, 
    ACT_science:        { type: Number,default: -1}, 
    ACT_composite:      { type: Number,default: -1}, 
    SAT_literature:     { type: Number,default: -1}, 
    SAT_US_hist:        { type: Number,default: -1}, 
    SAT_world_hist:     { type: Number,default: -1}, 
    SAT_math_I:         { type: Number,default: -1}, 
    SAT_math_II:        { type: Number,default: -1}, 
    SAT_eco_bio:        { type: Number,default: -1}, 
    SAT_mol_bio:        { type: Number,default: -1}, 
    SAT_chemistry:      { type: Number,default: -1}, 
    SAT_physics:        { type: Number,default: -1},
    num_AP_passed:      { type: Number,default: -1},
    applications:       {type: [{collegeName:String,status:String}], default: []},
});

export var Student = mongoose.model('Student',StudentSchema);