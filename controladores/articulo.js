// trabajaremos con programacion funcional

const prueba = (req, res) => {

    return res.status(200).json({
        mensaje: "Soy un accion de pruebas en mi controlador de articulos"
    });
};

const curso = (req, res) => { // parametros: nombre de la ruta, funcion callback del endpoint (require, respuesta)
    
    console.log("se ha ejecutado el endpoint  probando");
    
    // se retorna una respuesta de un codigo http: 200(exito) - json() objeto y colecciones JSON - send() para devolver html, JSON, etc
    return res.status(200).json([
        {
            curso: "Master en React",
            autor: "Victor Robles",
            url: "victorroblesweb.es/master-react",
        },
        {
            curso: "Master en PHP",
            autor: "Victor Robles",
            url: "victorroblesweb.es/master-react",
        },
    ]);
};

module.exports = {
    prueba,
    curso,
}