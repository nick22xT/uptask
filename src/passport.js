const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Usuarios = require('./models/Usuarios');

//login con credenciales propias
passport.use(
    new LocalStrategy(
        //por default espera un user y password
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: {
                        email: email,
                        activo: 1
                    }
                });

                //El usuario existe pero password incorrecto
                if (!usuario.verificarPassword(password)) {
                    return done(null, false, {
                        message: 'Password Incorrecto'
                    });
                }

                //Email y password correctos
                return done(null, usuario);
            } catch (err) {
                //Ese usuario no existe
                return done(null, false, {
                    message: 'Esa cuenta no existe'
                });
            }
        }
    )
);

//Serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Deserializar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
});

module.exports = passport;