var express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// importar rutas

var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// conexion a la bd

mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) {
        throw err;
    }
    console.log('bd online');
});
// rutas

app.use('/usuario', usuariosRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticiones

app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000');
});

