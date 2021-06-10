const express = require('express');
const router = require('./routes/routes');
const path = require('path');
const helpers = require('./helpers/helpers');
const flash = require('connect-flash');
const session = require('express-session');
const coockiParser = require('cookie-parser');
const passport = require('./passport');
require('dotenv').config({ path: 'environments.env' });

//create db conection
const db = require('./database');

//Para crear las tablas a partir de los modelos, impor model y llamar a sync en lugar de authenticate
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(() => console.log('Conectado al Servidor'))
    .catch(err => console.log(err));

const app = express();

//enable body
app.use(express.urlencoded({ extended: true }));

//load static files
app.use(express.static(__dirname + '/public'));

//enable engine template
app.set('view engine', 'pug');

//add view folder
app.set('views', path.join(__dirname, './views'));

//flash
app.use(flash());

//sesiones nos permiten navergar en distintas paginas sin autenticarnos
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//pasar helper
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = { ...req.user || null };
    next();
});

//routes
app.use('/', router());

const host = process.env.HOST || '0.0.0.0';

app.listen(process.env.PORT || 3000, host, () => console.log('El servidor esta funcionando'));

module.exports = () => app;