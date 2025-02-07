const express = require("express"); // importo el paq express de mis dependencias
const cors = require("cors");
const mongoose = require("mongoose");

console.log("App node arrancada");

// Crear servidor Node
const app = express();
const puerto = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
    origin: "*",  // ⚠️ Permite cualquier origen (puedes restringirlo a tu dominio)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
  
app.use(cors(corsOptions));

// Convertir body a objeto js
app.use(express.json());  // parsea automaticamente los datos enviados por POST a objetos javascript - recibir datos con content type app/json
app.use(express.urlencoded({extended:true})); // puedo recibir datos en formato form-urlencoded (para formularios)


// 🔹 Conexión optimizada a MongoDB para Vercel
let isConnected; // Variable global para evitar múltiples conexiones

async function connectDB() {
  if (isConnected) {
    console.log("Usando conexión existente a MongoDB.");
    return;
  }
  try {
    await mongoose.connect('mongodb://dhayromero27:dayromero27@cluster0-shard-00-00.i5sfh.mongodb.net:27017,cluster0-shard-00-01.i5sfh.mongodb.net:27017,cluster0-shard-00-02.i5sfh.mongodb.net:27017/blog?ssl=true&replicaSet=atlas-qmxs04-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0');
    
    isConnected = mongoose.connection.readyState === 1;
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error de conexión a MongoDB", error);
  }
}

// 🔹 Llamar a la conexión antes de usar cualquier ruta
connectDB();

// Rutas de prueba
app.get("/", (req, res) => {
    res.json("Hola");
});

// RUTAS - para visualizar el resultado en el navegador
const rutas_articulo = require("./rutas/articulo");
const rutas_user = require("./rutas/usuario");
const rutas_follow = require("./rutas/follow");
const rutas_notis = require("./rutas/notificacion");

// cargar las rutas
app.use("/api", rutas_articulo); // parametros: todas las rutas se cargaran en /api, /api/ruta-articulo
app.use("/api/usuario", rutas_user);
app.use("/api/follow", rutas_follow);
app.use("/api/notificaciones", rutas_notis);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => { // se pasa un puerto como parametro y funcion verifique q el servidor corra
    console.log("Servidor corriendo en el puerto: " + puerto);
});