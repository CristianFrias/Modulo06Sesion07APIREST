// NODE NATIVO, SIN EXPRESS

const http = require("http"); // MÓDULO NATIVO DE NODE
const url = require("url") // MÓDULO NATIVO DE NODE
const { v4: uuidv4 } = require('uuid');
const { readFileSync, writeFileSync } = require("fs"); // MÓDULO NATIVO DE NODE, SE UTILIZA PARA TRABAJAR EN LA PERSISTENCIA
const { sourceMapsEnabled } = require("process");
const puerto = 3_000;   

// UBICACIÓN DEL ARCHIVO DE PERSISTENCIA
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
        if (metodo == "GET") { // ESTE PARAMETRO RECIBE DESDE LA URL 
            res.setHeader("Content-Type", "application/json");
            const parametros = urlParsed.query;
            console.log(parametros);
            const contentString = readFileSync(dataAnimales, "utf-8");
            let contentJS = JSON.parse(contentString);
            contentJS = contentJS.filter( animal => {
                if (parametros.habitat && animal.habitat.toUpperCase() == parametros.habitat.toUpperCase()) {
                    return true
                }
                if (parametros.especie && animal.especie.toUpperCase() == parametros.especie.toUpperCase()) {
                    return true
                }
                if (!parametros.habitat && !parametros.especie){
                    return true
                }
                return false
            })
            // console.log(parametros.especie);
            res.end(JSON.stringify({message: "Listado de Animales", data: contentJS}));
        } else if (metodo == "POST") { // PARAMETRO ES RECIBIDO DEL BODY

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
                body = JSON.parse(body) // EL BODY QUE RECIBE LO TRANSFORMA EN UN OBJETO PARA TRABAJAR Y PODER MANIPULAR
                const contentString = readFileSync(dataAnimales, "utf-8"); // ARCHIVO DONDE ALMACENAMOS LA INFO
                const contentJS = JSON.parse(contentString);

                // SOME HACE UNA BUSQUEDA EN TODO EL ARREGLO Y SI HAY UNA COHINCIDENCIA, DEVUELVE VERDADERO. 
                const encontrado = contentJS.some(animal => { 
                    return String(animal.especie).toLowerCase() == String(body.especie).toLowerCase() && // FORZAMOS PARA QUE SEA UN STRING
                        String(animal.nombre).toLowerCase() == String(body.nombre).toLowerCase()
                })
                if (encontrado) {
                    res.writeHead(409)
                    return res.end(JSON.stringify({message: "No es posible registrar, el animal ya que existe en nuestros registros."}))
                }

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
                
                // OBJETO DE PETICION CON LA FUNCION WRITEHEAD PARA ESPECIFICAR CODIGO DE RESPUESTA QUE DEVUELVO
                res.writeHead(201);
                // RESPUESTA POST PARA EL REGISTRO
                res.end(JSON.stringify({message: "Registro exitoso", data: animal}));
                // res.end("Registro de Animales")
            })
        } else if (metodo == "PUT") { // PARAMETRO ES RECIBIDO DEL BODY
            res.setHeader("Content-Type", "application/json");
            let body = "";
            req.on("data", (parte) => { 
                body += parte.toString() 
            })
            req.on("end", () => {
                body = JSON.parse(body) 
                console.log(body);
                const contentString = readFileSync(dataAnimales, "utf-8"); 
                const contentJS = JSON.parse(contentString);

                let busqueda = contentJS.findIndex(animal => animal.id == body.id)
                if (busqueda != -1) {
                    const encontrado = contentJS.some(animal => {
                        return String(animal.especie).toLowerCase() == String(body.especie).toLowerCase() &&
                        String(animal.nombre).toLowerCase() == String(body.nombre).toLowerCase() &&
                        animal.id != body.id
                    })
                    if (encontrado) {
                        res.writeHead(409);
                        return res.end(JSON.stringify({message: "Ya existe otro animal con este mismo nombre y/o especie."}))
                    }
                    contentJS[busqueda] = {...contentJS[busqueda], ...body}
                    writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8")
                    return res.end(JSON.stringify({message: "Animal modificado con éxito", data : contentJS[busqueda]}))
                }
                res.writeHead(404);
                return res.end(JSON.stringify({message: "ID de animal no encontrado"}))
            })
        } else if (metodo == "DELETE") {
            res.setHeader("Content-Type", "application/json");
            const params = urlParsed.query
            const contentString = readFileSync(dataAnimales, "utf-8");
            let contentJS = JSON.parse(contentString);

            let busqueda = contentJS.findIndex(animal => animal.id == params.id)
            if(busqueda != -1) {
                const eliminado = contentJS.splice(busqueda, 1)
                writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8")
                return res.end(JSON.stringify({ message: "Animal eliminado con éxito", data: eliminado}))
            }
            res.writeHead(404);
                return res.end(JSON.stringify({message: "ID de animal no encontrado"}))
        }
    }

    // res.end("Llamando a nuestra API... "+metodo)
}).listen(puerto, () => {
    console.log(`Aplicación ejecutandose por el puerto ${puerto}`);
})