const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const config = require('../email');

let transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: {
        user: config.user,
        pass: config.pass
    }
});

const generarHTML = (archivo, opciones = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
    return juice(html);
}

exports.sendMail = async (opciones) => {
    const html = generarHTML(opciones.archivo, opciones);
    const text = htmlToText.htmlToText(html);
    let emailOp = {
        from: 'UpTask <no-reply@uptask.com>', // sender address
        to: opciones.usuario.email, // list of receivers
        subject: opciones.subject, // Subject line
        text, // plain text body
        html, // html body
    };

    const enviarEmail = util.promisify(transport.sendMail, transport);
    return enviarEmail.call(transport, emailOp)
}