var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.get('/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var pathImagen = path.resolve( __dirname, `../uploads/${tipo}/${img}`);
    // verificar si el path es valido

    if ( fs.existsSync(pathImagen) ) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;