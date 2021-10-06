const crypto = require('crypto');


function gerarSalt(l) {
    return crypto.randomBytes(Math.ceil(l / 2))
        .toString('hex')
        .slice(0, 16);
};

function sha512(senha, salt) {
    let hash = crypto.createHmac('sha512', salt); // Algoritmo de cripto sha512
    hash.update(senha);
    hash = hash.digest('hex');
    return {
        salt,
        hash,
    };
};

//CRYPTO PASSWORD
function gerarSenha(senha) {
    let salt = gerarSalt(32); // Vamos gerar o salt
    let senhaESalt = sha512(senha, salt); // Pegamos a senha e o salt
    // A partir daqui você pode retornar a senha ou já salvar no banco o salt e a senha

    console.log('Senha Hash: ' + senhaESalt.hash);
    console.log('Salt: ' + senhaESalt.salt);
    return senhaESalt;
}

function login(senhaDoLogin, saltNoBanco, hashNoBanco) {
    let senhaESalt = sha512(senhaDoLogin, saltNoBanco)
    return hashNoBanco === senhaESalt.hash;
};

function validatePassword(p) {

        let errors = [];
        let minNumberofChars = 6;
        let maxNumberofChars = 16;
        let regularExpression = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;

        if (p.length < minNumberofChars || p.length > maxNumberofChars) {
            errors.push("password should contain at least 6 characters and 16 at most");
        }
        if (!regularExpression.test(p)) {
            errors.push("password should contain atleast one number and one special character");
        }
        if (p.length < 8) {
            errors.push("Your password must be at least 8 characters");
        }
        if (p.search(/[a-z]/i) < 0) {
            errors.push("Your password must contain at least one letter.");
        }
        if (p.search(/[0-9]/) < 0) {
            errors.push("Your password must contain at least one digit");
        }
        if (errors.length > 0) {
           console.log (errors.join('\n'));
            throw (errors.join('--'));
            // return false
        }
        return true;
};

module.exports.sha512 = gerarSenha;
module.exports.gerarSalt = gerarSenha;
module.exports.gerarSenha = gerarSenha;
module.exports.validatePassword = validatePassword;



