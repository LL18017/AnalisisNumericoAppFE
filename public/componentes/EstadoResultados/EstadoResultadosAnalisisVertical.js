import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";
import EstadoBase from "./EstadoDeResultaldoBase.js";


class EstadoResultado extends EstadoBase {


  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/EstadoResultados/EstadoResultados.css" />
    `;

    const plantilla = html`
      ${link}
      <style>
        h1,
h2,
th,
td {
    color: var(--color--oscuro);
    text-align: left;
    margin: 0;
    padding: 0;
}

h1,
h2 {
    text-align: center;
}


.pdf-container {
    width: 100%;
    text-align: center;
}

.estado-cuerpo {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.tabla-estado {
    border-collapse: collapse;
    width: 80%;
    font-family: sans-serif;
}

.tabla-estado th,
.tabla-estado td {
    padding: 6px 10px;
    border: none;
    /* sin bordes */
}

.tabla-estado th {
    text-align: left;
    font-weight: bold;
    border-bottom: 1px solid var(--color--oscuro);
    /* solo línea separadora del header */
}


tr.negrita td {
    font-weight: bold;
}

tbody tr:not(:last-child) td {
    border-bottom: none;
    /* sin líneas entre filas */
}
      </style>
      <div class="pdf-container">
        <h1>Analisis de Estado de Resultados al 31 de diciembre de ${this.anioPrincipal}</h1>
        <h2>Alutech S.A. de S.V.</h2>
        <div class="estado-cuerpo">
          ${this.renderCuerpo()}
        </div>
      </div>
    `;

    render(plantilla, this._root);
  }

  renderCuerpo() {
    const formato = new Intl.NumberFormat("es-SV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return html`
      <table class="tabla-estado">
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Saldo</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${this.ListDeCuentas.map((cuenta, index) => {
      const esUtilidad = cuenta.nombre_cuenta.toLowerCase().startsWith("utilidad");
      const esUltima = index === this.ListDeCuentas.length - 1;
      const clase = esUtilidad || esUltima ? "negrita" : "";
      const ingresoPorVenta = this.ListDeCuentas.find(c => c.nombre_cuenta === "Ingresos por ventas").saldo;
      return html`
              <tr class=${clase}>
                <td>${cuenta.nombre_cuenta}</td>
                <td>$ ${formato.format(cuenta.saldo ?? 0)}</td>
                <td>${formato.format((Number(cuenta.saldo) / Number(ingresoPorVenta)) * 100 ?? 0)} %</td>
              </tr>
            `;
    })}
        </tbody>
      </table>
    `;
  }



}

customElements.define("estado-resultados-analisis-vertical", EstadoResultado);
