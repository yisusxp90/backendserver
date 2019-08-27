var express = require('express');

var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');
app.use(fileUpload());
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// el next se usa cuando llamamos un middleware
app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }

    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono imagen',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;

    var extension = archivo.name.split('.')[1];

    // extensiones permitidas
    var extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension invalida',
            errors: { message: 'Las extensiones validas son ' + extensionesPermitidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    // mover el temporal a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv( path, err => {
        if (err) {
            return res.status(200).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById( id, (err, usuario) => {
            if ( !usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe usuario con el id proporcionado',
                    errors: err
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: error
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;
            usuario.save( ( err, usuarioActualizado) => {
                usuarioActualizado.password = '';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById( id, (err, medico) => {
            if ( !medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe medico con el id proporcionado',
                    errors: err
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: error
                        });
                    }
                });
            }

            medico.img = nombreArchivo;
            medico.save( ( err, medicoActualizado) => {
                medicoActualizado.password = '';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById( id, (err, hospital) => {
            if ( !hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe hospital con el id proporcionado',
                    errors: err
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // si existe elimina la imagen anterior
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: error
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;
            hospital.save( ( err, hospitalActualizado) => {
                hospitalActualizado.password = '';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;