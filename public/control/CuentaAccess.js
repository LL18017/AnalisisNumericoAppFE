// control/CuentaAccess.js
export default class CuentaAccess {
    constructor() {
        this.baseUrl = "http://localhost:4000/api/cuentas";
    }

    // Obtener todos o buscar por texto
    getData(q = "") {
        const url = q ? `${this.baseUrl}?q=${encodeURIComponent(q)}` : this.baseUrl;
        return fetch(url);
    }

    // Crear nueva cuenta
    createData(data) {
        return fetch(this.baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: data.nombre,
                codigo: data.codigo
            })
        });
    }

    // Actualizar cuenta
    updateData(data, id) {
        return fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: data.nombre,
                codigo: data.codigo
            })
        });
    }

    // Eliminar cuenta
    deleteData(id) {
        return fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    }

    // Descargar PDF generado por backend
    getPDF() {
        return fetch(`${this.baseUrl}/pdf`);
    }
}
