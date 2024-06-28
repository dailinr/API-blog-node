const { conexion } = require("./database/conexion"); // importar archivo de conexion
const express = require("express"); // importo el paq express de mis dependencias

console.log("App node arrancada");


// conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();

// Configurar cors
app.use(cors()); // se ejecuta el cors antes de que se ejecute cualquier ruta

// Convertir body a objeto js
app.use(express)