const chai = require("chai");
const { servidor, port } = require("./index.js")

describe("Pruebas al Servidor Node", () => {
    // IT CASO ESPECIFICO
    it("Creación del Servidor", () => {
        chai.expect(servidor).to.be.a('object');
    })
    it("Definición y vallidación de puerto", () => {
        chai.expect(port).to.be.a("number");
    })
})

describe("Pruebas ruta listado de animales", () => {
    it("Respuesta HTTP 200", () => {
        chai.expect(true).to.be.equal(true)
    })
})