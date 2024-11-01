const { Schema, model } = require("mongoose"); // importamos estos metodos para personalizar el esquema de nuestra base de datos
const mongoosePaginate = require('mongoose-paginate-v2');

// Definimos la estructura que tendrá nuestro modelo
const ArticulosSchema = Schema({ // parametro: esquema de la db (todos los docs de articulos)
    user: {
        type: Schema.ObjectId, // la identificacion de un objeto del modelo usuario
        ref: "User"
    },
    titulo: {
        type: String,
        required: true, // es obligatorio 
    },
    contenido:  {
        type: String,
        required: true, 
    },
    etiqueta: {
        type: String,
        required: true,
    },
    fecha: {
        type: Date,
        default: () => {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        },
        // no le especificamos si es requerida porque por defecto tendrá ya una
    },
    imagen: {
        type: String,
        default: "default.png",
    },
    views: { 
        type: Number, 
        default: 0 
    }
});  

ArticulosSchema.plugin(mongoosePaginate);

// Exportamos el modelo 
// parametros del metodo model: le definimos un nombre y el esquema que tendrá el modelo, la coleccion db a usar
module.exports = model("Articulo", ArticulosSchema, "articulos");