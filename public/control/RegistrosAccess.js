export default class RegistroAccess {
    constructor(baseURL = "/api/registros") {
        this.baseURL = baseURL;
    }

    // Crear un registro
    createData(datos) {
        return fetch(this.baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
    }

    // Obtener registro por idRegistro
    getDataById(id) {
        return fetch(`${this.baseURL}/${id}`);
    }

    // Obtener registro por idCuentaContable y año
    getDataByNombreAndAnio(idcuenta, anio) {
        return fetch(`${this.baseURL}/buscar?idcuenta=${idcuenta}&anio=${anio}`);
    }

    getDataCuentasDeBalance(anio) {

        return fetch(`${this.baseURL}/balance?anio=${anio}`);
    }

    getDataCuentasDeEstadoDeResultados(anio) {

        return fetch(`${this.baseURL}/estadoResultado?anio=${anio}`);
    }

    getRegistrosBalanceComparativo(anioPrincipal, anioSecundario) {
        return fetch(`${this.baseURL}/balanceComparativo?anio1=${anioPrincipal}&anio2=${anioSecundario}`);
    }

    getDataCuentasDeEstadoDeResultadosComprativo(anioPrincipal, anioSecundario) {
        return fetch(`${this.baseURL}/estadoResultadoComparativo?anio1=${anioPrincipal}&anio2=${anioSecundario}`);
    }

    // Actualizar registro por id
    async updateData(datos, id) {
        console.log("📤 Enviando PUT:", `${this.baseURL}/${id}`, datos);
        const response = await fetch(`${this.baseURL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        return response;
    }

    // Eliminar registro por id
    deleteData(id) {
        return fetch(`${this.baseURL}/${id}`, {
            method: "DELETE"
        });
    }
}
