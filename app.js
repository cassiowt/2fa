const express = require("express")
const speakeasy = require("speakeasy")
const uuid = require("uuid")
const QRCode = require('qrcode');
const captcha = require("nodejs-captcha");
const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig');
const HelperUser = require('./controllers/helperUser')
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const PORT = process.env.PORT || 5000;

const db = new JsonDB(new Config("MyDB", true, false, "/"))

app.use(express.json())
app.set('view engine', 'ejs')
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use('/public/', express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.listen(PORT, () => {
    console.log(`SERVER STARTED AT ${PORT}`)
})

const routes = require("./routes/api");
app.use("/api", routes);

// INDEX APPLICATION
app.get('/', function (req, res) {
    res.render('index');
});

//GENERATE QRCODE
app.post('/api/captcha', function(req, res) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
        return res.json({"responseError" : "something goes to wrong"});
    }
    const secretKey = "xxxx";

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=6Lffc2EbAAAAAPCHDwJ2tPaWGsNuG3I5oMlUYjO1" + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

    request(verificationURL,function(error,response,body) {
        body = JSON.parse(body);

        if(body.success !== undefined && !body.success) {
            return res.json({"responseError" : "Failed captcha verification"});
        }
        res.json({"responseSuccess" : "Sucess"});
    });
});

app.post('/api/captcha1', function(req, res) {
   /* if(req.body['g-recaptcha'] === undefined || req.body['g-recaptcha'] === '' || req.body['g-recaptcha'] === null)
    {
        return res.json({"responseError" : "something goes to wrong"});
    }*/

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=6Lffc2EbAAAAAPCHDwJ2tPaWGsNuG3I5oMlUYjO1" + "&response="  + "&remoteip=" + req.connection.remoteAddress;

    console.log(verificationURL);

    request(verificationURL,function(error,response,body) {
        body = JSON.parse(body);

        if(body.success !== undefined && !body.success) {
            return res.json({"responseError" : "Failed captcha verification"});
        }
        res.json({"responseSuccess" : "Sucess"});
    });
});



