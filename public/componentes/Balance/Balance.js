import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";

class Balance extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.ListDeCuentas = [];
  }

  connectedCallback() {
    this.RegistroAccess = new RegistroAccess();
    this.render();
  }

  // ⚠️ NO se modifica esta función
  async setCuentasDeBalancePorPeriodo(anio) {
    try {
      const response = await this.RegistroAccess.getDataCuentasDeBalance(anio);
      if (!response.ok) throw new Error("Error al obtener cuentas de balance");
      const data = await response.json();

      this.ListDeCuentas = data || [];
      console.log(data);

      this.render();
    } catch (error) {
      console.error("Error cargando cuentas por periodo:", error);
    }
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/Balance/balanceReporte.css" />
    `;

    const plantilla = html`
      ${link}
       <h1>Balance General</h1>
      <h2>Alutech SA DE SV</h2>
      <h2>Balance al 31 de diciembre de ${this.anio}</h2>

      <div class="balance-cuerpo">
        ${this.renderActivos()}
        ${this.renderPasivosPatrimonio()}
      </div>
    `;

    render(plantilla, this._root);
  }

  // ---------- Sección: Activos ----------
  renderActivos() {
    const cuentasAC = this.getCuentasPorCodigo("1.1");
    const cuentasANC = this.getCuentasPorCodigo("1.2");

    return html`
      <div class="activos">
        <h1 class="tittle">Activos</h1>
        ${this.renderTabla("Activo corriente", cuentasAC, true)}
        ${this.renderTabla("Activo no corriente", cuentasANC)}
      </div>
    `;
  }

  // ---------- Sección: Pasivos y Patrimonio ----------
  renderPasivosPatrimonio() {
    const cuentasPC = this.getCuentasPorCodigo("2.1");
    const cuentasPNC = this.getCuentasPorCodigo("2.2");
    const cuentasCap = this.getCuentasPorCodigo("3.");

    return html`
      <div class="PasivosPatrimonio">
        <div class="pasivo">
          <h1 class="tittle">Pasivos</h1>
          ${this.renderTabla("Pasivo corriente", cuentasPC)}
          ${this.renderTabla("Pasivo no corriente", cuentasPNC)}
        </div>
        <div class="patrimonio">
          <h1 class="tittle">Patrimonio</h1>
          ${this.renderTabla("Capital", cuentasCap)}
        </div>
      </div>
    `;
  }

  // ---------- Render tabla simplificada ----------
  renderTabla(titulo, cuentas, renderHeaders) {
    const formato = new Intl.NumberFormat("es-SV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return html`
    ${titulo ? html`<h2 class="tittle">${titulo}</h2>` : null}
    <table class="tabla-balance">
      ${renderHeaders ? html`
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Saldo</th>
          </tr>
        </thead>
      ` : null}
        <tbody>
          ${cuentas.map(cuenta => html`
            <tr>
              <td>${cuenta.nombre_cuenta}</td>
              <td>$ ${formato.format(cuenta.saldo) ?? "0.00"}</td>
            </tr>
          `)}
          <tr class="total">
            <td><strong>Total ${titulo}</strong></td>
            <td><strong>$ ${formato.format(this.getTotal(cuentas))}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // ---------- Funciones auxiliares ----------
  getCuentasPorCodigo(codigoPrefix) {
    return this.ListDeCuentas.filter(c => c.codigo?.startsWith(codigoPrefix));
  }

  getTotal(cuentas) {
    return cuentas.reduce((suma, cuenta) => {
      const saldoNumerico = parseFloat(cuenta.saldo);
      return suma + (isNaN(saldoNumerico) ? 0 : saldoNumerico);
    }, 0);
  }

}

customElements.define("balance-general", Balance);
export default Balance;
