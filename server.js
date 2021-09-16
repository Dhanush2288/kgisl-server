let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let mongoose = require("mongoose");
let dbDetails = require("./config/db");
let app = express();
var http = require("http").createServer(app);
mongoose.connect(
  dbDetails.dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, success) => {
    if (err) {
      console.log("error occured");
      console.log(err);
    } else {
      console.log("db connected successfully");
    }
  }
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/", require("./routes/appointment"));
app.use("/", require("./routes/signup"));

http.listen(dbDetails.port, (err, success) => {
    if (err) throw err;
    else console.log("server is running in port 9999");
  });
  