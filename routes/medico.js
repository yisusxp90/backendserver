var express = require('express');

var app = express();

var Medico = require('../models/medico');

var mdAutenticacion = require('../middleware/autenticacion');

// =============================================
//  Obtenemos todos los medicos
// =============================================
// el next se usa cuando llamamos un middleware
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre img')
        .skip(desde) // salta la cantidad de registros
        .limit(15)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
        (err, medicos) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });


        });

});


// =============================================
//  Crear nuevo medico
// =============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // esto solo funciona con el bodyparser
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

// =============================================
//  actualizar medico
// =============================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medicoEncontrado) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar medico',
                errors: err
            });
        }

        if( !medicoEncontrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID'}
            });
        }

        medicoEncontrado.nombre = body.nombre;
        medicoEncontrado.usuario = req.usuario._id;
        medicoEncontrado.hospital = body.hospital;
        medicoEncontrado.save( (err, medicoGuardado) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });


});

// =============================================
//  borrar medico
// =============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove( id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + ' no existe',
                errors: {message: 'No existe un medico con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});


module.exports = app;