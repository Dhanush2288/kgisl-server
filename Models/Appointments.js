var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TimeSchema = new Schema(
    {
        date:{ type: Date},
        StartTime:{type:String},
        EndTime:{type:String},
        Daytime:{type:String},
        Id: { type: String , required:true },
        AppointmentId:{type:Number},
        PatientId:{ type: String},
        PatientName:{type:String},
        Contact:{type:String},
        ArrivedTime:{type:String},
        Arrivedflag:{type: Boolean,default:false},
        BookingFalg:{type:Boolean, default:false},
        selectionfalg:{type:Boolean, default:false},
        bookingtype:{type:String,default:"Noshow"},
        DoctorID: { type: String , required:true },
        
    }, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } } )
    
module.exports = mongoose.model('Appointments', TimeSchema);