const {JsonDB} = require("node-json-db");
const {Config} = require("node-json-db/dist/lib/JsonDBConfig");
const uuid = require("uuid");
const HelperUser = require("./helperUser");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = new JsonDB(new Config("MyDB", true, false, "/"))

exports.ping = function (req, res) {
    res.json({
        message: "API in Air! Welcone to 2FA for Cássio"
    })
};

exports.test = function (req, res) {
    res.render("2fa")
};
exports.captcha = function (req, res) {
    res.render("captcha")
};
exports.twofa = function (req, res) {
    res.render("twofa")
};
exports.list = function (req, res) {
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
};
exports.register = function (req, res) {
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
}
exports.verify = function (req, res) {
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
            token: token,
            window: 6
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
}
exports.validate = function (req, res) {
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
}
exports.qrcode = function (req, res) {
    try {
        const path = `/user/` + req.params.id
        console.log(path)
        const user = db.getData(path)
        console.log(user.temp_secret.otpauth_url)
        /*   const imageQRCode = async () => {
               return QRcode.toDataURL(user.temp_secret.otpauth_url)
           }*/
        // With promises
        QRCode.toDataURL(user.temp_secret.otpauth_url)
            .then(url => {
                res.send(`<!DOCTYPE html>
                 <html>
                    <head>
                        <style>
                            body {
                                background-color: white;
                            }
                            h1 {
                                color: #312d2d;
                                padding: 60px;
                            } 
                             .center {
                                display: block;
                                margin-left: auto;
                                margin-right: auto;
                                width: 50%  
                            }
                       </style>
                    </head>
                    <body>
                        <h1> QRCode</h1>
                        <img class="center" src=" `  + url + `"></img>
                    </body>
                </html>
                `)
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
}
exports.home = function (req, res) {
    res.render("index")
}

/*
app.post("/api/qrcode", (req, res) => {
    const {token, userID} = req.body
    try {
        const path = `/user/${userID}`
        console.log({token, userID})
        const user = db.getData(path)
        console.log(user.temp_secret.otpauth_url)
        /!*   const imageQRCode = async () => {
               return QRcode.toDataURL(user.temp_secret.otpauth_url)
           }*!/
        // With promises
        QRCode.toDataURL(user.temp_secret.otpauth_url)
            .then(url => {
                res.send('<html>'
                 + '<body>'
                + '<h1> QRCode</h1>'
                + "<img src='" + url + "'></img>"
                + '</html>'+ '</body>');
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
*/
