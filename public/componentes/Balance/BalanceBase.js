import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";

class BalanceBase extends HTMLElement {
  constructor() {
    super();
    this.ListDeCuentas = [];
  }

  connectedCallback() {
    this.RegistroAccess = new RegistroAccess();
    this.render();
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

export default BalanceBase;