var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DoctorSignupSchema = new Schema(
    {
        Name: { type: String },
        phonenumber: { type: String , required:true,unique:true},
        Emailaddress: { type: String  },
        ClinicName:{type:String}
    },{ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
    
module.exports = mongoose.model('doctorsignup', DoctorSignupSchema);