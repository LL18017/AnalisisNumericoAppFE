import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";
import EstadoBase from "./EstadoDeResultaldoBase.js";


class EstadoResultadoHorizontal extends EstadoBase {


  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/EstadoResultados/EstadoResultados.css" />
    `;

    const plantilla = html`
      ${link}
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
                  <td>$ ${formato.format(this.getVariansa(cuenta.saldo_anio1, cuenta.saldo_anio2))} %</td >
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
      console.error("Error cargando cuentas por periodo:", error);
    }
  }


}

customElements.define("estado-resultados-analisis-horizontal", EstadoResultadoHorizontal);
