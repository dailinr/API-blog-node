const { conexion } = require("./database/conexion"); // importar archivo de conexion
const express = require("express"); // importo el paq express de mis dependencias
const cors = require("cors");

console.log("App node arrancada");

14188
// conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();
const puerto = 1024;

// Configurar cors
app.use(cors()); // se ejecuta el cors antes de que se ejecute cualquier ruta

// Convertir body a objeto js
app.use(express.json());  // parsea automaticamente los datos enviados por POST a objetos javascript - recibir datos con content type app/json
app.use(express.urlencoded({extended:true})); // puedo recibir datos en formato form-urlencoded (para formularios)

// RUTAS - para visualizar el resultado en el navegador
const rutas_articulo = require("./rutas/articulo");
const rutas_user = require("./rutas/usuario")

// cargar las rutas
app.use("/api", rutas_articulo); // parametros: todas las rutas se cargaran en /api, /api/ruta-articulo
app.use("/api", rutas_user);

// Rutas prueba hardcodeadas
app.get("/", (req, res) => { // parametros: nombre de la ruta, funcion callback del endpoint (require, respuesta)
    
    console.log("se ha ejecutado el endpoint  / ");

    return res.status(200).send(`
        <h1>Bienvenido</h1>
    `);
});

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => { // se pasa un puerto como parametro y funcion verifique q el servidor corra
    console.log("Servidor corriendo en el puerto: " + puerto);
});