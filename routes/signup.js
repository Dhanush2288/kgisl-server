
var express = require('express');
var Router= express();
var OTPsms = require("../Auth/OTPsms");
var DoctorSignup = require('../Models/Doctorsignup');
var client = require("twilio")(OTPsms.accountSID, OTPsms.authToken);

Router.post("/i/doctorsignup", (req, res) => {
	var newdoctorsignup = new DoctorSignup();
	newdoctorsignup.Name = req.body.Name;
	newdoctorsignup.phonenumber = req.body.phonenumber;
	newdoctorsignup.Emailaddress = req.body.Emailaddress;
    newdoctorsignup.ClinicName = req.body.ClinicName;
	newdoctorsignup.save(function (err, success) {
		if (err) {

			if (err.code == "11000") {

				res.send({ success: false, message: "Phone number already taken", error: err });

			}
			else {
				var x = Object.keys(err.errors)[0];
				if (!x) {
					res.send({ success: false, message: "internal error" });

				}
				else {


					res.send({ success: false, message: "" + x + "is required", error: err });
				}

			}
		} else {

			res.send({ success: true, message: "successfully created", data: success });


		}

	});

});

Router.get('/doctorlogin',(req,res)=>{
    console.log(req.query);
    client
        .verify
        .services(OTPsms.serviceID)
        .verifications
        .create({
            to : `+91${req.query.phonenumber}`,
            channel: req.query.channel
        })
          .then((data)=>
          res.status(200).send({success: true,data}))
})

Router.post('/doctorverify',(req,res)=>{
    client
        .verify
        .services(OTPsms.serviceID)
        .verificationChecks
        .create({
           to: `+91${req.query.phonenumber}` ,
           code:req.query.code
        })
        .then((data)=>{
            console.log(data);

            if(data.status=="approved"){
                console.log("otp verified");
                temp_query = {phonenumber:req.query.phonenumber}
            DoctorSignup.find(temp_query, (err, data) => {
            if (err) {
              res.send({ success: false, message: "No user found", err: err })
            } else {
                console.log("phonenumber matched");
                res.send({success:true , data:data})
            } 
            })   
            }
            else(
                res.send("Otp is wrong")
            )
})
})


module.exports = Router;