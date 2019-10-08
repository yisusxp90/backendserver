var express = require('express');

var app = express();

var Hospital = require('../models/hospital');

var mdAutenticacion = require('../middleware/autenticacion');

// =============================================
//  Obtenemos todos los hospitales
// =============================================
// el next se usa cuando llamamos un middleware
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre usuario img')
        .skip(desde) // salta la cantidad de registros
        .limit(15)
        .populate('usuario', 'nombre email')
        .exec(
        (err, hospitales) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error cargando hospitales',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });

});


// =============================================
//  Obtenemos hospital por id
// =============================================
// el next se usa cuando llamamos un middleware
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec(
            (err, hospital) => {
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al busca hospital',
                        errors: err
                    });
                }
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id' + id + 'no existe',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });
            });

});

// =============================================
//  Crear nuevo hospital
// =============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // esto solo funciona con el bodyparser
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });
    });

});

// =============================================
//  actualizar hospital
// =============================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospitalEncontrado) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar hospital',
                errors: err
            });
        }

        if( !hospitalEncontrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        hospitalEncontrado.nombre = body.nombre;
        hospitalEncontrado.usuario = req.usuario._id;
        hospitalEncontrado.save( (err, hospitalGuardado) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });


});

// =============================================
//  borrar usuario
// =============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove( id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});


module.exports = app;