var express = require('express');
// encriptacion de contrasena
const bcrypt = require('bcrypt');

var app = express();

var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middleware/autenticacion');

// =============================================
//  Obtenemos todos los usuarios
// =============================================
// el next se usa cuando llamamos un middleware
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error cargando usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });

        });

});


// =============================================
//  Crear nuevo usuario
// =============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // esto solo funciona con el bodyparser
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario // usuario del token verificado en el middleware
        });
    });

});

// =============================================
//  actualizar usuario
// =============================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuarioEncontrado) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }

        if( !usuarioEncontrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuarioEncontrado.nombre = body.nombre;
        usuarioEncontrado.email = body.email;
        usuarioEncontrado.role = body.role;
        usuarioEncontrado.save( (err, usuarioGuardado) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });


});

// =============================================
//  borrar usuario
// =============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});


module.exports = app;