// NODE NATIVO, SIN EXPRESS

const http = require("http"); // MÓDULO NATIVO DE NODE
const url = require("url") // MÓDULO NATIVO DE NODE
const { v4: uuidv4 } = require('uuid');
const { readFileSync, writeFileSync } = require("fs") // MÓDULO NATIVO DE NODE, SE UTILIZA PARA TRABAJAR EN LA PERSISTENCIA
const puerto = 3_000;   

const dataAnimales = `${__dirname}/data/animales.txt`

// USAMOS EL MODULO HTTP CON LA FUNCION CREATESERVER
http.createServer((req, res) => {
    // CON ESTAS 3 LINEAS PODEMOS SABER QUE METODO Y QUE PATH NOS ESTÁN LLAMANDO
    const metodo = req.method;
    const urlParsed = url.parse(req.url, true)
    const pathName = urlParsed.pathname

    // console.log({ urlParsed });
    // PATH DE ANIMALES, GET, POST, PUT, DELETE
    if (pathName == "/animales") {
        if (metodo == "GET") {
            const parametros = urlParsed.query
            // console.log(parametros.especie);
            res.end("Listado de Animales:")
        } else if (metodo == "POST") {
            // RECEPCIÓN DEL BODY QUE ARMA LA DATA QUE RECIBIMOS
            let body = ""; // SE CREA UN BODY TIPO STRING
            // RECIBE TODA LA DATA QUE ESTÁN ENVIANDO
            req.on("data", (chunk) => { // CHUNK ES UN PEDAZO DE INFORMACIÓN, "PARTICIONAMIENTO"
                body += chunk.toString() // AL BODY LO CONCADENO CON EL CHUNK Y LO TRANSFORMO A CADENA DE CARACTERES
            })
            // DESPUÉS DE ARMAR EJECUTA LO SIGUIENTE:
            // EL END SE EJECUTA CUANDO TERMINA DATA
            req.on("end", () => {
                // RECIBIMOS LOS VALORES A TRAVES DEL CUERPO DE LA PETICIÓN
                body = JSON.parse(body) // EL BODY QUE RECIBE LOO TRANSFORMA EN UN OBJETO PARA TRABAJAR Y PODER MANIPULAR
                const contentString = readFileSync(dataAnimales, "utf-8"); // ARCHIVO DONDE ALMACENAMOS LA INFO
                const contentJS = JSON.parse(contentString);

                // ARMAMOS OBJETO, TODA LA DATA DEL ANIMAL A REGISTRAR
                const animal = {
                    id: uuidv4(),
                    nombre: body.nombre,
                    edad: body.edad,
                    especie: body.especie,
                    habitat: body.habitat
                }
                // console.log(animal);

                // PUSH PARA INGRESAR ESE OBJETO DENTRO DE UN ARREGLO QUE ESTÁ DEFINIDO EN EL ARCHIVO
                contentJS.push(animal);
                // ESCRIBIMOS EL CONTENIDO DE TODO EL ARREGLO Y LO CONVERTIMOS EN TEXTO
                writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8");

                // console.log({body});
                // ESA INFORMACIÓN QUE ESTOY RECIBIENDO HAY QUE SETEARLAS EN LA CABECERA
                // CON QUE CONTENT TYPE ESTAMOS RESPONDIENDO, AQUI ESPECIFICAMOS JSON
                res.setHeader("Content-Type", "application/json"); // SIN ESTA LINEA NO VISUALIZAMOS CORRECTAMENTE LA INFORMACIÓN EN FORMATO JSON
                // OBJETO DE PETICION CON LA FUNCION WRITEHEAD PARA ESPECIFICAR CODIGO DE RESPUESTA QUE DEVUELVO
                res.writeHead(201)
                // RESPUESTA POST PARA EL REGISTRO
                res.end(JSON.stringify({message: "Registro exitoso", data: animal}));
                // res.end("Registro de Animales")
            })
        } else if (metodo == "PUT") {
            res.end("Editar Animales:")
        } else if (metodo == "DELETE") {
            res.end("Eliminar Animales:")
        }
    }

    // res.end("Llamando a nuestra API... "+metodo)

}).listen(puerto, () => {
    console.log(`Aplicación ejecutandose por el puerto ${puerto}`);
})