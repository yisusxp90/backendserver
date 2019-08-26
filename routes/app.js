var express = require('express');

var app = express();

// el next se usa cuando llamamos un middleware
app.get('/', (req, res, next) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Peticion realizada correctaente'
    });
});

module.exports = app;