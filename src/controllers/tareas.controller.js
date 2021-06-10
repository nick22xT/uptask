const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');


exports.agregarTarea = async (req, res, next) => {
    const proyecto = await Proyectos.findOne({
        where: {
            url: req.params.url
        }
    });

    const { tarea } = req.body;
    const estado = 0;
    const proyectoId = proyecto.id;

    const result = await Tareas.create({ tarea, estado, proyectoId });

    if (!result) return next();

    return res.redirect(`/proyectos/${req.params.url}`);
}

exports.cambiarEstadoTarea = async (req, res, next) => {
    const { id } = req.params;

    const tarea = await Tareas.findOne({
        where: {
            id
        }
    });

    let estado = 0;
    if (tarea.estado === 0)
        estado = 1;

    tarea.estado = estado;
    const result = await tarea.save();

    if (!result) return next();

    return res.status(200).send('Acualizado');
}

exports.eliminarTarea = async (req, res, next) => {
    const { id } = req.params;

    const result = await Tareas.destroy({
        where: {
            id
        }
    });

    if (!result) return next();

    return res.status(200).send('Tarea eliminada correctamente');
}