import dataAccess from "./DataAccess.js";

class EstadoResultadoAccess extends dataAccess {
    constructor() {
        super("estadoResultados");
    }


    getDataByDate(fechaInicio, fechaFin) {
        const queryParams = new URLSearchParams();

        if (fechaInicio) queryParams.append("fechaInicio", fechaInicio);
        if (fechaFin) queryParams.append("fechaFin", fechaFin);

        const url = queryParams.toString() ? `${this.URL}?${queryParams.toString()}` : this.URL;

        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

export default EstadoResultadoAccess;
