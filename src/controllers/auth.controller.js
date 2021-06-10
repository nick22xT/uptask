const passport = require('../passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt-nodejs');
const envarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

exports.usuarioAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.redirect('/iniciar-sesion');
    }
}

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        return res.redirect('/iniciar-sesion');
    });
}

exports.enviarToken = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuarios.findOne({
        where: {
            email
        }
    });

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.render('restablecer', {
            nombrePagina: 'Restablecer Contraseña',
            mensajes: req.flash()
        });
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    await usuario.save();

    const resetUrl = `http://${req.headers.host}/restablecer/${usuario.token}`;

    await envarEmail.sendMail({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'restablecer-password'
    });

    req.flash('correcto', 'Se envió un mensaje a tu correo');
    return res.redirect('/iniciar-sesion');
}

exports.validarToken = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuarios.findOne({
        where: {
            token
        }
    });

    if (!usuario) {
        req.flash('error', ' No válido');
        res.redirect('/restablecer');
    }

    return res.render('resetPassword', {
        nombrePagina: 'Restablecer Contraseña'
    });
}

exports.actualizarPassword = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuarios.findOne({
        where: {
            token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

    if (!usuario) {
        req.flash('error', 'No válido');
        return res.redirect('/restablecer');
    }

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    await usuario.save();

    req.flash('correcto', 'Tu contraseña se restableció correctamente')
    return res.redirect('/iniciar-sesion');
}