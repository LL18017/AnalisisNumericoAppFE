import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";
import EstadoBase from "./EstadoDeResultaldoBase.js";


class EstadoResultadoHorizontal extends EstadoBase {


  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
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
    width: auto;
    font-family: sans-serif;
}

.tabla-estado th,
.tabla-estado td {
    width:auto;
    border: none;
    font-size:12px;
    padding:0 4px;
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
}
      </style>
      <div class="pdf-container">
        <h1>Analisis Horizontalde Estado de Resultados al 31 de diciembre de ${this.anioPrincipal} y ${this.anioSecundario}</h1>
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
            <th>Saldo ${this.anioPrincipal}</th>
            <th>Saldo ${this.anioSecundario}</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${this.ListDeCuentas.map((cuenta, index) => {
      const esUtilidad = cuenta.nombre_cuenta.toLowerCase().startsWith("utilidad");
      const esUltima = index === this.ListDeCuentas.length - 1;
      const clase = esUtilidad || esUltima ? "negrita" : "";
      return html`
              <tr class=${clase}>
                <td>${cuenta.nombre_cuenta}</td>
                <td>$ ${formato.format(cuenta.saldo_anio1 ?? 0)}</td>
                <td>$ ${formato.format(cuenta.saldo_anio2 ?? 0)}</td>
                  <td>${formato.format(this.getVariansa(cuenta.saldo_anio1, cuenta.saldo_anio2))} %</td >
              </tr>
            `;
    })}
        </tbody>
      </table>
    `;
  }

  getVariansa(saldo_anio1, saldo_anio2) {
    saldo_anio1 = Number(saldo_anio1)
    saldo_anio2 = Number(saldo_anio2)
    if (saldo_anio2 == 0) {
      return -100
    }
    return ((saldo_anio1 / saldo_anio2) - 1) * 100

  }

  async setCuentasDeEstadoDeResultadoPorPeriodo(anioPrincipal, anioSecundario) {
    try {
      const response = await this.RegistroAccess.getDataCuentasDeEstadoDeResultadosComprativo(anioPrincipal, anioSecundario);
      if (!response.ok) throw new Error("Error al obtener cuentas de estadoDeResultado");
      const data = await response.json();
      this.ListDeCuentas = data || [];
      this.render();
    } catch (error) {
      this.noticadorHandle(error, "danger")
      this.ListDeCuentas = []
    }
  }


}

customElements.define("estado-resultados-analisis-horizontal", EstadoResultadoHorizontal);
