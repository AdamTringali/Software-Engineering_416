import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    userid: { type: String},
    college: {type : String},
    status: {type: String}
});


export var Questionable = mongoose.model('Questionable',QuestionSchema);