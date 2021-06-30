const express = require("express")
const speakeasy = require("speakeasy")
const uuid = require("uuid")
const QRCode = require('qrcode');
const captcha = require("nodejs-captcha");
const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig');
const HelperUser = require('./helperUser')
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');


const app = express();
app.use(express.json())
app.set('view engine', 'ejs')
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SERVER STARTED AT ${PORT}`)
})

const db = new JsonDB(new Config("MyDB", true, false, "/"))

// INDEX APPLICATION
app.get('/', function (req, res) {
    res.render('index');
});

// PING API
app.get("/api", (req, res) => {
    res.json({
        message: "Welcone to 2FA for Cássio"
    })
})

//REGISTER USER & create temp secret
app.post("/api/register", (req, res) => {
    const id = uuid.v4()
    const {name, senha} = req.body
    try {
        let v = HelperUser.validatePassword(senha)
        const password = HelperUser.gerarSenha(senha)
        const path = `/user/${id}`
        const temp_secret = speakeasy.generateSecret()

        db.push(path, {
            id,
            name,
            password,
            temp_secret,

        })
        res.json({
            id,
            name,
            secret: temp_secret.base32

        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error,
        })
    }

})

//LIST USERS
app.get("/api/list", (req, res) => {
    let data;
    try {
        users = db.getData("/user");

        res.json({
            users
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error,
        })
    }
})

//VERIFY TOKEN AND  MAKE SECRET PERMANENT
app.post("/api/verify", (req, res) => {
    const {token, userID} = req.body
    console.log({token, userID})
    try {
        const path = `/user/${userID}`
        const user = db.getData(path)
        console.log(user.temp_secret)
        const {base32: secret} = user.temp_secret
        // Use verify() to check the token against the secret
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            db.push(path, {
                id: userID,
                secret: user.temp_secret
            })
            res.json({
                verified: true
            })
        } else {
            res.json({
                verified: false
            })
        }

    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err,
        })
    }
})

//VALIDATE TOKEN
app.post("/api/validate", (req, res) => {
    const {token, userID} = req.body
    console.log({token, userID})
    try {
        const path = `/user/${userID}`
        const user = db.getData(path)
        const {base32: secret} = user.secret
        // Use verify() to check the token against the secret
        const tokenValidate = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (tokenValidate) {

            res.json({
                validate: true
            })
        } else {
            res.json({
                validate: false
            })
        }

    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err,
        })
        console.log(err)
    }
})

//GENERATE QRCODE
app.get("/api/qrcode", (req, res) => {
    const id = "29f9ad19-279e-45ff-a49b-b40a66427034"
    try {
        const path = `/user/${id}`
        const user = db.getData(path)
        console.log(user.temp_secret.otpauth_url)
        /*   const imageQRCode = async () => {
               return QRcode.toDataURL(user.temp_secret.otpauth_url)
           }*/
        // With promises
        QRCode.toDataURL(user.temp_secret.otpauth_url)
            .then(url => {
                res.write('<html>');
                res.write('<body>');
                res.write('<h1> QRCode</h1>');
                res.write(
                    "<img src='" + url + "'></img>"
                )
                res.write('</html>');
                res.write('</body>');
            })
            .catch(err => {
                console.error(err)
            })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "ERRO " + error,
        })
    }
})


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



