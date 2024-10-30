// PRUEBAS QUE ESTAN ENFOCADAS EN LO QUE ES EL SERVIDOR, VERIFICAR QUE EL SERVIDOR CREADO ESTÉ DEFINIDO
const chai = require("chai");
const chaiHttp = require("chai-http")
const { servidor, puerto } = require("./index.js");

// CHAI DEBE USAR CHAIHTTP, PARA QUE CHAI TENGA LAS FUNCIONALIDADES DE LAS RUTAS (END POINTS)
chai.use(chaiHttp)

// LINEA 7 A 16 ES LO QUE NOS PIDEN PARA LA PRACTICA DE CONSOLIDACION
describe("Pruebas al Servidor Node", () => {
    // IT CASO ESPECIFICO PARA UNA PRUEBA CON RESPECTO AL SERVIDOR
    it("Creación del Servidor", () => {
        // HAY QUE EXPORTARLO DESDE DONDE LO ESTAMOS UTILIZANDO
        chai.expect(servidor).to.be.a('object');
    })
    it("Definición y Validación del Puerto", () => {
        chai.expect(puerto).to.be.a("number");
    })
})

// DESCRIBE: FUNCIONALIDAD ESPECIFICA
// IT: SON LAS DISTINTAS PRUEBAS QUE PODEMOS HACER EN UNA SOLA FUNCIONALIDAD
describe("Pruebas Ruta Listado de Animales", () => {
    it("Respuesta HTTP 200", () => {
        chai.request(servidor).get("/animales").end((error, respuesta) => {
            chai.expect(respuesta).to.have.status(200); // VERIFICAMOS SI EL STATUS DE ESTA PETICION ES 200
        })
    })
    // it("Propiedad Message en Respuesta", () => {
    //     chai.request(servidor).get("/animales").end((error, respuesta) => {
    //         const data = JSON.parse(respuesta.text);
    //         chai.expect(data.message).to.equal("Listado de Animales");            
    //     })
    // })
    it("Propiedades Correcta de Respuesta", () => {
        chai.request(servidor).get("/animales").end((error, respuesta) => {
            const data = JSON.parse(respuesta.text);
            chai.expect(data.message).to.equal("Listado de Animales"); // COMPROBACIÓN ORACIÓN "LISTADO DE ANIMALES"
            chai.expect(data.data).to.be.a("array"); // COMPROBACIÓN DEL ARREGLO QUE LLEGA          
        })
    })

})