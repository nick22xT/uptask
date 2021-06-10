const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.home = async (req, res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({
        where: {
            usuarioId
        }
    });

    return res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({
        where: {
            usuarioId
        }
    });

    return res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    });
}

exports.nuevoProyecto = async (req, res) => {
    const { nombre } = req.body;
    let errores = [];

    if (!nombre)
        errores.push({ texto: 'Agrega un Nombre al proyecto.' });

    if (errores.length > 0) {
        const usuarioId = res.locals.usuario.id;
        const proyectos = await Proyectos.findAll({
            where: {
                usuarioId
            }
        });

        return res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        });
    } else {
        const usuarioId = res.locals.usuario.id;

        await Proyectos.create({ nombre, usuarioId });
        return res.redirect('/');
    }
}

exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({
        where: {
            usuarioId
        }
    });
    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }, includes: [
            { model: Proyectos }
        ]
    });

    if (!proyecto) return next();

    return res.render('tareas', {
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.fomularioEditar = async (req, res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({
        where: {
            usuarioId
        }
    });
    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    return res.render('nuevoProyecto', {
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    })
}

exports.editarProyecto = async (req, res) => {
    const { nombre } = req.body;
    let errores = [];

    if (!nombre)
        errores.push({ texto: 'Agrega un Nombre al proyecto.' });

    if (errores.length > 0) {
        const usuarioId = res.locals.usuario.id;
        const proyectos = await Proyectos.findAll({
            where: {
                usuarioId
            }
        });

        return res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        });
    } else {
        await Proyectos.update({
            nombre: nombre
        }, {
            where: {
                id: req.params.id
            }
        });
        return res.redirect('/');
    }
}

exports.eliminarProyecto = async (req, res, next) => {
    const { urlProyecto } = req.query;

    const result = await Proyectos.destroy({
        where: {
            url: urlProyecto
        }
    });

    if (!result) return next();

    return res.status(200).send('Proyecto eliminado correctamente');
}