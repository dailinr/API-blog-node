const { Schema, model } = require("mongoose"); // importamos estos metodos para personalizar el esquema de nuestra base de datos


// Definimos la estructura que tendrá nuestro modelo
const ArticulosSchema = Schema({ // parametro: esquema de la db (todos los docs de articulos)
    titulo: {
        type: String,
        required: true, // es obligatorio 
    },
    contenido:  {
        type: String,
        required: true, 
    },
    fecha: {
        type: Date,
        default: Date.now, // por defecto será la fecha actual
        // no le especificamos si es requerida porque por defecto tendrá ya una
    },
    imagen: {
        type: String,
        default: "default.png",
    },
});  

// Exportamos el modelo 
// parametros del metodo model: le definimos un nombre y el esquema que tendrá el modelo, la coleccion db a usar
module.exports = model("Articulo", ArticulosSchema, "articulos");