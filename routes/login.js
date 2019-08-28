var express = require('express');
const bcrypt = require('bcrypt');
var app = express();
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

// google login
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
var CLIENT_ID = require('../config/config').CLIENT_ID;


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



// ================================================
// ================ login google ==================
// ================================================


// async espera hasta q se resuelva la promeda, y cuando resuelva lo q retorne lo va a grabar en ticket
async function verify(token) {

    // await retorna una promeesa, para poder usar el await la funcion debe ser async
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch( error => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token invalido'
            });
        });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if ( usuarioDB.google === false ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {expiresIn: 14400});

                usuarioDB.password = '';
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    token: token
                });
            }
        } else {
            // el usuario no existe.. hay q crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '123';

            usuario.save( (err, usuarioDB) => {
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error creando usuario',
                        error: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {expiresIn: 14400});

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    token: token
                });
            });
        }
    });
    /*return res.status(200).json({
        ok: true,
        mensaje: 'login google',
        googleUser: googleUser
    });*/
});

module.exports = app;