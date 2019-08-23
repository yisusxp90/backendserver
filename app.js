var express = require('express');
const mongoose = require('mongoose');

var app = express();

// conexion a la bd

mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) {
        throw err;
    }
    console.log('bd online');
});
// rutas

// el next se usa cuando llamamos un middleware
app.get('/', (req, res, next) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Peticion realizada correctaente'
    });
});

// escuchar peticiones

app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000');
});

