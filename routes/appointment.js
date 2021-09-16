var express = require("express");
var Router = express.Router();
var moment = require("moment");
var appointment = require("../Models/Appointments");
const request = require("request");

Router.post("/i/appointment", (req, res) => {
  console.log(req.body);
  var newappointment = new appointment();
  newappointment.Id = req.body.Id;
  newappointment.title = req.body.title;
  var momentDate = moment(new Date().toLocaleString());
  newappointment.date = momentDate.toDate();
  newappointment.StartTime = moment(req.body.date + " " + req.body.StartTime);
  newappointment.EndTime = moment(req.body.date + " " + req.body.EndTime);
  newappointment.DoctorID = req.body.Id;
  newappointment.save(function (err, success) {
    if (err) {
      if (err.code == "11000") {
        res.send({
          success: false,
          message:
            "The AppointmentID is already taken.Use another AppointmentID ",
          error: err,
        });
      } else {
        var x = Object.keys(err.errors)[0];
        if (!x) {
          res.send({ success: false, message: "internal error" });
        } else {
          res.send({
            success: false,
            message: "" + x + "is required",
            error: err,
          });
        }
      }
    } else {
      res.send({
        success: true,
        message: "Appointment created successfully",
        data: success,
      });
      console.log(success);
    }
  });
});

Router.post("/u/appointment",(req,res)=>{
  appointment.updateOne({ _id: req.body.Id},
		{ $set: { BookingFalg: req.body.BookingFalg ,PatientId: req.body.PatientId,PatientName:req.body.PatientName,selectionfalg:true,bookingtype:req.body.bookingtype,Contact:req.body.Contact} },
		function (err, success) {
			if (err) {
				res.send({success:false, message: "internal error occured", error: err })
			} else {
				var x=appointment.nModified;
				if(x==0)
				{
					res.send ({success:false,message:"Booking was not successfully"});
				}
                else{
				res.send({ success: true, message: "Booking was successfully", data: success });
			}
		}
		}
	);
})

Router.post("/u/arrival",(req,res)=>{
  var now =new Date().toISOString()
  console.log(now);
  appointment.updateOne({ _id: req.body.Id},
		{ $set: { ArrivedTime : now ,Arrivedflag: req.body.Arrivedflag,bookingtype:req.body.bookingtype} },
		function (err, success) {
			if (err) {
				res.send({success:false, message: "internal error occured", error: err })
			} else {
				var x=appointment.nModified;
				if(x==0)
				{
					res.send ({success:false,message:"Arrival flagged was not successfully"});
				}
                else{
				res.send({ success: true, message: "Arrival flagged was successfully", data: success });
			}
		}
		}
	);
})

Router.get("/r/appointment", (req, res) => {
  doo = new Date(req.query.Date);
  doo.setHours(0, 0, 0, 0);
  var momentDate = moment(doo);
  console.log(momentDate.toDate());
  now = momentDate.toDate();
  var tmr = new Date(now);
  tmr.setHours(0, 0, 0, 0);
  console.log(tmr);
  appointment.find(
    {
      DoctorID: req.query.DoctorID,
      Daytime:req.query.Daytime,
      date: { $gte: now, $lte: tmr },
    },
    function (err, success) {
      if (err) {
        res.send("error");
      } else if (success.length == 0) {
        res.send({ success: false, message: "schedule not found" });
      } else {
        res.send({ success: true, data: success });
        console.log(success);
      }
    }
  );
});
Router.get("/r/typeofappointment", (req, res) => {
  doo = new Date(req.query.Date);
  doo.setHours(0, 0, 0, 0);
  var momentDate = moment(doo);
  console.log(momentDate.toDate());
  now = momentDate.toDate();
  var tmr = new Date(now);
  tmr.setHours(0, 0, 0, 0);
  console.log(tmr);
  appointment.find(
    {
      DoctorID: req.query.DoctorID,
      BookingFalg:true,
      bookingtype:req.query.bookingtype,
      date: { $gte: now, $lte: tmr },
    },
    function (err, success) {
      if (err) {
        res.send("error");
        console.log(err);
      } else if (success.length == 0) {
        res.send({ success: false, message: "schedule not found" });
        console.log(success);

      } else {
        res.send({ success: true, data: success });
        console.log(success);
      }
    }
  );
});

function time(f) {
  var dateee = new Date(f);
  var Ftime = dateee.getHours();
  var after = "";
  if (Ftime < 12) {
    after = "Morning";
  } else {
    after = "Evening";
  }
  return after;
}
Router.post("/slotcreation", (req, res) => {
  req.body.Id = Math.floor(Math.random() * 90000) + 10000;
  var slotConfig = {
    configSlotHours: "0",
    configSlotMinutes: "30",
    configSlotPreparation: "0",
    timeArr: [{ startTime: req.body.StartTime, endTime: req.body.EndTime }],
  };
  function createSlots(slotConfig) {
    const {
      configSlotHours,
      configSlotMinutes,
      configSlotPreparation,
      timeArr,
    } = slotConfig;
    let defaultDate = new Date(req.body.date).toISOString().substring(0, 10);
    let _timeArrStartTime;
    let _timeArrEndTime;
    let _tempSlotStartTime;
    let _endSlot;
    let _startSlot;
    for (var i = 0; i < timeArr.length; i++) {
      console.log(i);
      _timeArrStartTime = new Date(
        defaultDate + " " + timeArr[i].startTime
      ).getTime();
      _timeArrEndTime = new Date(
        defaultDate + " " + timeArr[i].endTime
      ).getTime();
      _tempSlotStartTime = _timeArrStartTime;

      while (
        new Date(_tempSlotStartTime).getTime() <
        new Date(_timeArrEndTime).getTime()
      ) {
        _endSlot = new Date(_tempSlotStartTime);
        _startSlot = new Date(_tempSlotStartTime);

        _tempSlotStartTime = _endSlot.setHours(
          parseInt(_endSlot.getHours()) + parseInt(configSlotHours)
        );
        _tempSlotStartTime = _endSlot.setMinutes(
          parseInt(_endSlot.getMinutes()) + parseInt(configSlotMinutes)
        );

        if (
          new Date(_tempSlotStartTime).getTime() <=
          new Date(_timeArrEndTime).getTime()
        ) {
          var slot = new appointment();
          slot.Id = req.body.Id;
          var momentDate = moment(new Date(req.body.date).toISOString());
          slot.date = momentDate.startOf("day").toDate();
          (slot.StartTime = new Date(_startSlot).toISOString()),
          (slot.Daytime = time(new Date(_startSlot).toISOString()));
          slot.EndTime = new Date(_endSlot).toISOString();
          var f = new Date();
          var d = Date.parse(f);
          var og = Math.floor(Math.random() * 100000) + 1;
          slot.AppointmentId = og + d;
          slot.DoctorID = req.body.DoctorsID;
          try {
            // let newJsonForWarmer = {
            //   deviceId: "CSC2",
            //   temperature: d.Temp,
            //   latitude: d.latitude,
            //   longitude: d.longitude,
            // };
            // console.log(newJsonForWarmer);
            const options = {
              url: "http://localhost:9999/testing",
              method: "POST",
              body: slot,
              json: true,
            };
            request(options, function (err, response, body) {
              console.log(body);
              let json = body;
              console.log("server response");
              console.log(json);
            });
          } catch (err) {
            console.log("error occured due to invalid data parsing", err);
          }
        }
        _tempSlotStartTime = _endSlot.setMinutes(
          _endSlot.getMinutes() + parseInt(configSlotPreparation)
        );
      }
    }
  }
  createSlots(slotConfig);
  res.send({ success: true, message: "slot divied successfully"})
});

Router.post("/testing",(req,res)=>{
  var slot = new appointment(req.body); 
  var start = new Date(req.body.StartTime).toISOString();
  console.log(new Date(req.body.StartTime));
  var end = new Date(req.body.EndTime).toISOString();
  appointment
  .find({
    DoctorID: slot.DoctorID,
    $or: [
      {
        $and: [{ StartTime: { $gte: start } }, { StartTime: { $lte: end } }],
        $and: [{ StartTime: { $lte: start } }, { EndTime: { $gte: start } }],
      },
    ],
   })
  .exec(  function (err,next) {
    if (err) {
      res.send(err);
    } else if (next.length == 0) {
      slot.save(function (err, success1) {
        if (err) {
          console.log(err);
        } else {
       res.send({ success: true, message: "Patient found successfully", data: success1 })        }
      });
    } else {
      console.log("not working", next);
      res.send({ success: false, message: "time slot over lap", data: next }) 

    }

  });
})
Router.get("/test", (req, res) => {
  console.log(req.query);
  console.log(new Date("2021-06-15T13:00:00.000Z"));

  var start = new Date(req.query.StartTime).toISOString();
  console.log(new Date(req.query.StartTime));
  var end = new Date(req.query.EndTime).toISOString();
  var slot = new appointment(req.query);
  appointment.find(
    {
      DoctorID: req.query.DoctorID,
      $or: [
        {
          $and: [{ StartTime: { $gte: start } }, { StartTime: { $lte: end } }],
          $and: [{ StartTime: { $lte: start } }, { EndTime: { $gte: start } }],
        },
      ],
    },
    function (err, success) {
      if (err) {
        res.send(err);
      } else if (success.length == 0) {
        console.log(success.length);
        slot.save(function (err, success1) {
          if (err) {
            console.log(err);
          } else {
            console.log(success1);
          }
        });
      } else {
        console.log("not working", success);
      }
    }
  );
});
module.exports = Router;
