var express = require('express');
const bcrypt = require('bcrypt');
var app = express();
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }

        if( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //crear token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {expiresIn: 14400});

        usuarioDB.password = '';
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB.id,
            token: token
        });
    });

});

module.exports = app;