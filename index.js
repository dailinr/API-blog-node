const { conexion } = require("./database/conexion"); // importar archivo de conexion
const express = require("express"); // importo el paq express de mis dependencias
const cors = require("cors");

console.log("App node arrancada");


// conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors()); // se ejecuta el cors antes de que se ejecute cualquier ruta

// Convertir body a objeto js
app.use(express.json());  // parsea automaticamente los datos enviados por POST a objetos javascript

// Crear Rutas

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => { // se pasa un puerto como parametro y funcion verifique q el servidor corra
    console.log("Servidor corriendo en el puerto: "+puerto);
});