class Interactividad {
    constructor() {}

    ocultarElemento(id) {
        const element = document.getElementById(id);
        element.style.display = element.style.display !== "none" ? "none" : "block";
    }

    cambiarPropiedad(id, property, value1, value2) {
        const element = document.getElementById(id);
        element.style[property] = element.style[property] === value1 ? value2 : value1;
        console.log("hola");
        
    }
}

// Exportación del módulo
export default Interactividad;
