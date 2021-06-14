const Usuarios = require('../models/Usuarios');
const envarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
    return res.render('crearCuenta', {
        nombrePagina: 'Crear Cuenta en Uptask'
    });
}

exports.formIniciarSesion = (req, res) => {
    const { error } = res.locals.mensajes;

    return res.render('iniciarSesion', {
        nombrePagina: 'Iniciar sesion en Uptask',
        error
    });
}


exports.crearCuenta = async (req, res) => {
    const { email, password } = req.body;

    try {
        await Usuarios.create({
            email,
            password
        });

        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        const usuario = {
            email
        };

        await envarEmail.sendMail({
            usuario,
            subject: 'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        });

        req.flash('correcto', 'Enviamos un correo para confirmar tu cuenta');
        return res.redirect('/iniciar-sesion');
    } catch (err) {
        req.flash('error', err.errors.map(error => err.message));

        return res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear Cuenta en Uptask',
            email,
            password
        })
    }
}

exports.formRestablecerPassword = (req, res) => {
    return res.render('restablecer', {
        nombrePagina: 'Restablecer Contraseña'
    });
}

exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    if (!usuario) {
        req.flash('error', 'No valido');
        return res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente');
    return res.redirect('/iniciar-sesion');
}