// conexion a la base de datos
const mongoose = require("mongoose"); // require es como un import en js para importar dependencias

// metodo para la conexion (asincrona por si demora en cargar)
const conexion = async() => {
    
    try{
        // conexion a la base de datos
        await mongoose.connect("mongodb://localhost:27017/mi_blog");
        // parametros
        // useNewUrlParser: true
        // useUnifiedTopology: true
        // useCreateIndex: true
        
        console.log("Conectado correctamente a la base de datos mi_blog"); // mensaje de conexion

    } catch(error){
        console.log(error); // muestra un posible error
        throw new Error("No se ha podido conectar a la base de datos");
    }
}

module.exports = {
    conexion // exporta la conexion para poder usarla en otros archivos
};