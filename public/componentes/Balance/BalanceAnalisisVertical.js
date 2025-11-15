import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";

class BalanceAnalisisVertical extends HTMLElement {
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

      this.render();
    } catch (error) {
      this.noticadorHandle(error, "danger")
      this.ListDeCuentas = []
    }
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
    `;

    const plantilla = html`

      ${link}
      <style>
             h1,
      h2,
      span,
      th,
      td,
      p {
          color: var(--color--oscuro);
          text-align: center;
      }
      td,th{
         text-align: left;
         padding:0 8px;
      }

      .tittle {
          padding: 20px;
          text-align: start;
      }


      .balance-cuerpo {
          display: flex;
          flex-direction: column;
          gap: 12px;
          /* espacio entre filas y columnas */
          width: 100%;
          margin: 0 auto;
          /* centra horizontalmente */
      }

      .balance-cuerpo>* {
          max-width: 100%;
          box-sizing: border-box;
      }


      .tabla-balance {
          border-collapse: collapse;
          width: auto;
          table-layout: fixed;
          /* asegura que las columnas tengan el mismo ancho */
      }

      .tabla-balance th,
      .tabla-balance td {
          padding: 8px;
          text-align: left;
          width: 100%;
          height: 40px;
          white-space: nowrap;
      }

      .activos {
          order: 1;
      }

      .totalActivos {
          order: 2;
      }

      .PasivosPatrimonio {
          order: 3;
      }

      .totactPasivoPatrimonio {
          order: 4;
      }

      .suma-total {
          order: 5;
      }
      </style>
       <h1>Balance General analisis vertical</h1>
      <h2>Alutech SA DE SV</h2>
      <h2>Balance al 31 de diciembre de ${this.anioPrincipal}</h2>

      <div class="balance-cuerpo">
        <table tabla-balance>
          <thead >
          <tr>
            <th>Cuenta</th>
            <th>Saldo</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${this.renderActivos()}
          ${this.renderPasivosPatrimonio()}
        </tbody>
        </table>
      </div>
    `;

    render(plantilla, this._root);
  }

  // ---------- Sección: Activos ----------
  renderActivos() {
    const cuentasAC = this.getCuentasPorCodigo("1.1");
    cuentasAC.unshift({ "nombre_cuenta": "Activo Corriente" })
    cuentasAC.unshift({ "nombre_cuenta": "Activo" })

    const cuentasANC = this.getCuentasPorCodigo("1.2");

    const total = cuentasAC.concat(...cuentasANC).reduce((p, c) => p + parseFloat(c.saldo || 0), 0);
    cuentasANC.push({
      nombre_cuenta: "TOTAL ACTIVOS",
      saldo: total
    })

    return html`
        ${this.renderTabla("Activo corriente", cuentasAC, true, false, total)}
        ${this.renderTabla("Activo no corriente", cuentasANC, false, true, total)}
    `;
  }

  // ---------- Sección: Pasivos y Patrimonio ----------
  renderPasivosPatrimonio() {
    const cuentasPC = this.getCuentasPorCodigo("2.1");
    const cuentasPNC = this.getCuentasPorCodigo("2.2");
    const cuentasCap = this.getCuentasPorCodigo("3.");
    const total = this.getTotal(cuentasPC
      .concat(cuentasPNC).concat(cuentasCap));

    cuentasPC.unshift({ "nombre_cuenta": "Pasivo Corriente" })
    cuentasPC.unshift({ "nombre_cuenta": "Pasivo" })

    cuentasPNC.unshift({ "nombre_cuenta": "Pasivo No Corriente" })

    cuentasPNC.push({
      nombre_cuenta: "TOTAL PASIVOS",
      saldo: this.getTotal(cuentasPC
        .concat(cuentasPNC))
    })

    cuentasCap.unshift({ "nombre_cuenta": "Patrimonio" })
    cuentasCap.push({
      nombre_cuenta: "TOTAL PASIVOS Y CAPITAL",
      saldo: total
    })


    return html`
          ${this.renderTabla("Pasivo corriente", cuentasPC, false, false, total)}
          ${this.renderTabla("Pasivo no corriente", cuentasPNC, false, true, total)}
          ${this.renderTabla("Capital", cuentasCap, false, true, total)}
    `;
  }

  renderTabla(titulo, cuentas, renderHeaders, renderTotal, total) {
    const formato = new Intl.NumberFormat("es-SV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Crear objeto total
    const TotalTitulo = {
      nombre_cuenta: `TOTAL ${titulo}`
    };

    let saldoTitulo = 0;

    if (renderTotal) {
      // 🔹 Si renderTotal es true → sumar todas menos la última
      saldoTitulo = this.getTotal(cuentas.slice(0, -1));
      TotalTitulo.saldo = saldoTitulo;

      // Insertar antes del último elemento
      cuentas.splice(cuentas.length - 1, 0, TotalTitulo);
    } else {
      // 🔹 Si renderTotal es false → sumar todas las cuentas
      saldoTitulo = this.getTotal(cuentas);
      TotalTitulo.saldo = saldoTitulo;

      // Agregar al final del array
      cuentas.push(TotalTitulo);
    }

    // 🔸 Renderizado
    return html`
        ${cuentas.map((cuenta, index) => {
      // Determinar si va en negrita
      const esNegritaBase = renderHeaders ? index < 2 : index < 1;
      const contieneTotal = cuenta.nombre_cuenta?.toLowerCase().includes("total");
      const estilo = (esNegritaBase || contieneTotal)
        ? "font-weight: bold;"
        : "";

      return html`
            <tr>
              <td style=${estilo}>${cuenta.nombre_cuenta}</td>
              <td style=${estilo}>
                ${cuenta.saldo == null ? "" : `$ ${formato.format(cuenta.saldo_)}`}
              </td>
              <td style=${estilo}>
                 ${cuenta.saldo == null || !total ? "" :
          `${formato.format((Number(cuenta.saldo) / Number(total)) * 100)} %`}
              </td>
            </tr>
          `;
    })}
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

customElements.define("balance-general-analisi-vertical", BalanceAnalisisVertical);
export default BalanceAnalisisVertical;
