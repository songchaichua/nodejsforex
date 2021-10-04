const express = require("express");
const app = express();
var Tesseract = require("tesseract.js");
var mysql = require("mysql");
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send(
    "Send a POST request to /read-image. For more information, read the readme.md file at this project. =)"
  );
});

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "forex",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Mysql Connected!");
});

app.post("/ocr-add", (req, res) => {
  //console.log(req.body);
  var result = req.body;
  var sql = "";
  //inset

  result["data"].forEach((signal) => {
    if (signal["status"] == "buy" || signal["status"] == "sell") {
      sql =
        "SELECT COUNT(currency) as count FROM tbl_signal WHERE currency = '" +
        signal["currency"] +
        "' and status='" +
        signal["status"] +
        "' and stopLose = '" +
        signal["stopLose"] +
        "'";
      con.query(sql, function (err, result, fields) {
        if (err) console.log("error : ", err);

        var res = JSON.parse(JSON.stringify(result));
        //console.log(res[0].count);
        if (res[0].count == 0) {
          sql =
            "INSERT INTO tbl_signal (currency, price, takeProfit, stopLose, status) VALUES ('" +
            signal["currency"] +
            "','" +
            signal["price"] +
            "','0.0','" +
            signal["stopLose"] +
            "','" +
            signal["status"] +
            "')";
          //console.log(sql);
          con.query(sql, function (err, result) {
            if (err) console.log("error : ", err);
            // console.log("1 record inserted");
            //con.end();
            //console.log(result);
          });
        }
      });
    } else {
      sql =
        "SELECT COUNT(currency) as count FROM tbl_signal WHERE currency = '" +
        signal["currency"] +
        "' and status='" +
        signal["status"] +
        "' and stopLose = '" +
        signal["stopLose"] +
        "'";
      con.query(sql, function (err, result, fields) {
        if (err) console.log("error : ", err);

        var res = JSON.parse(JSON.stringify(result));
        //console.log(res[0].count);
        if (res[0].count == 0) {
          sql =
            "INSERT INTO tbl_signal (currency, price, takeProfit, stopLose, status) VALUES ('" +
            signal["currency"] +
            "','" +
            signal["price"] +
            "','0.0','" +
            signal["stopLose"] +
            "','" +
            signal["status"] +
            "')";
          //console.log(sql);
          con.query(sql, function (err, result) {
            if (err) console.log("error : ", err);
            // console.log("1 record inserted");
            //con.end();
            //console.log(result);
          });
        }
      });
    }
  });
});

app.post("/ocr", (req, res) => {
  //console.log("Body: ", req.body);
  console.log("ocr");
  let base64 = req.body.base64;
  let imageBuffer = Buffer.from(base64, "base64");

  Tesseract.recognize(imageBuffer, "eng", {
    logger: (m) => {
      //console.log(m);
    },
  })
    .then(({ data: { text } }) => {
      var result = text.replace(/(\r\n|\n|\r)/gm, "");
      result = result.trim();
      //console.log(result);
      res.send({
        code: 200,
        data: result,
      });
    })
    .catch(() => {
      res.send({
        code: 400,
        massage: "ocr error",
      });
    });
});

const port = process.env.PORT || 8888;
app.listen(port, () => console.log(`Listening on port:${port}...`));
