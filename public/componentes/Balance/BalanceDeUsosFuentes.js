import { html, render } from "../../js/terceros/lit-html.js";
import BalanceBase from "../Balance/BalanceBase.js";

class BalanceDeUsosFuentes extends BalanceBase {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: "open" });
    }


    async setCuentasDeBalancePorPeriodo(anioPrincipal, anioSecundario) {
        try {
            const response = await this.RegistroAccess.getRegistrosBalanceComparativo(anioPrincipal, anioSecundario);
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
      <h2>Balance de usos y fuentes al 31 de diciembre de ${this.anioPrincipal} y ${this.anioSecundario}</h2>

      <div class="balance-cuerpo">
        ${this.renderActivos()}
        ${this.renderPasivosPatrimonio()}
        ${this.renderSumaTotal()}
      </div>
    `;

        render(plantilla, this._root);
    }

    renderActivos() {
        const cuentasAC = this.getCuentasPorCodigo("1.1");
        const cuentasANC = this.getCuentasPorCodigo("1.2");

        cuentasANC.push({
            nombre_cuenta: "TOTAL ACTIVOS",
            saldo_anio1: this.getTotalAnio1(cuentasAC.concat(...cuentasANC)),
            saldo_anio2: this.getTotalAnio2(cuentasAC.concat(...cuentasANC)),
        })


        return html`
      <div class="activos">
        <h1 class="tittle">Activos</h1>
        ${this.renderTabla("Activo corriente", cuentasAC, true, true)}
        ${this.renderTabla("Activo no corriente", cuentasANC, true, false, true)}
        
      </div>
    `;
    }

    // ---------- Sección: Pasivos y Patrimonio ----------
    renderPasivosPatrimonio() {
        const cuentasPC = this.getCuentasPorCodigo("2.1");
        const cuentasPNC = this.getCuentasPorCodigo("2.2");
        const cuentasCap = this.getCuentasPorCodigo("3.");

        let total = this.getTotal(cuentasPC.concat(...cuentasPNC))

        cuentasPNC.push({
            nombre_cuenta: "TOTAL PASIVOS",
            saldo_anio1: this.getTotalAnio1(cuentasPC
                .concat(cuentasPNC)),

            saldo_anio2: this.getTotalAnio2(cuentasPC
                .concat(cuentasPNC))
        })

        total += this.getTotal(cuentasCap);
        cuentasCap.push({
            nombre_cuenta: "TOTAL PASIVOS y PATRIMONIO",
            saldo_anio1: this.getTotalAnio1(cuentasPC
                .concat(cuentasPNC).concat(cuentasCap)),

            saldo_anio2: this.getTotalAnio2(cuentasPC.concat(cuentasPNC).concat(cuentasCap))

        })


        return html`
      <div class="PasivosPatrimonio">
        <div class="pasivo">
          <h1 class="tittle">Pasivos</h1>
          ${this.renderTabla("Pasivo corriente", cuentasPC)}
          ${this.renderTabla("Pasivo no corriente", cuentasPNC, null, false, true)}
        </div>
        <div class="patrimonio">
          <h1 class="tittle">Patrimonio</h1>
          ${this.renderTabla("Capital", cuentasCap, null, false, true)}
        </div>
      </div>
    `;
    }

    renderSumaTotal() {
        const todasCuentasActivo = [
            ...this.getCuentasPorCodigo("1.1"), // Activo corriente
            ...this.getCuentasPorCodigo("1.2")
        ];
        const todasCuentasPasivoCapital = [
            ...this.getCuentasPorCodigo("2.1"), // Pasivo corriente
            ...this.getCuentasPorCodigo("2.2"), // Pasivo no corriente
            ...this.getCuentasPorCodigo("3.")   // Patrimonio
        ];


        let totalUso = 0;
        let totalFuente = 0;

        todasCuentasActivo.forEach(cuenta => {
            const esTotal = /total/i.test(cuenta.nombre_cuenta);
            if (!esTotal) {
                const uso = this.esUso(cuenta.saldo_anio1, cuenta.saldo_anio2, true);   // activo=true solo para ejemplo
                const fuente = this.esFuente(cuenta.saldo_anio1, cuenta.saldo_anio2, true);
                totalUso += uso === "-" ? 0 : Number(uso.replace(/,/g, ""));
                totalFuente += fuente === "-" ? 0 : Number(fuente.replace(/,/g, ""));
            }
        });

        todasCuentasPasivoCapital.forEach(cuenta => {
            const esTotal = /total/i.test(cuenta.nombre_cuenta);
            if (!esTotal) {
                const uso = this.esUso(cuenta.saldo_anio1, cuenta.saldo_anio2, false);   // activo=true solo para ejemplo
                const fuente = this.esFuente(cuenta.saldo_anio1, cuenta.saldo_anio2, false);
                totalUso += uso === "-" ? 0 : Number(uso.replace(/,/g, ""));
                totalFuente += fuente === "-" ? 0 : Number(fuente.replace(/,/g, ""));
            }
        });

        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return html`
        <div class="suma-total">
            <table class="tabla-balance">
                <tbody>
                    <tr style="font-weight:bold; background:#f0f0f0;">
                        <td style="width:35%;">Suma Total</td>
                        <td colspan="4"></td>
                        <td>$ ${formato.format(totalUso)}</td>
                        <td>$ ${formato.format(totalFuente)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    }


    // ---------- Render tabla simplificada ----------
    renderTabla(titulo, cuentas, esActivo, renderHeaders, renderTotal) {
        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const filaTotal = {
            nombre_cuenta: `Total ${titulo}`,
            saldo_anio1: this.getTotalAnio1(cuentas.slice(0, -1)),
            saldo_anio2: this.getTotalAnio2(cuentas.slice(0, -1)),
        };

        // Si renderTotal es true → insertar antes del último
        // Si no → insertar al final
        if (renderTotal) {
            cuentas.splice(cuentas.length - 1, 0, filaTotal);
        } else {
            cuentas.push(filaTotal);
        }

        return html`
    <table class="tabla-balance">
      ${renderHeaders ? html`
        <thead>
          <tr>
            <th style="width:35%;">Cuenta</th>
            <th>Saldo ${this.anioPrincipal}</th>
            <th>Saldo ${this.anioSecundario}</th>
            <th>variacion</th>
            <th>fuente</th>
            <th>Uso</th>
          </tr>
        </thead>
      ` : null}

      <tbody>
        <tr>
          <td style="width:35%;">${titulo}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>

        ${cuentas.map((cuenta, index) => {
            const esUltimo = index === cuentas.length - 1;
            const esPenultimo = index === cuentas.length - 2;
            const enNegrita = renderTotal ? (esUltimo || esPenultimo) : esUltimo;

            const esTotal = /total/i.test(cuenta.nombre_cuenta); // ← Detecta si es total

            return html`
                <tr style=${enNegrita ? 'font-weight: bold;' : ''}>
                <td style="width:35%;">${cuenta.nombre_cuenta}</td>
                <td>$ ${formato.format(Number(cuenta.saldo_anio1) || 0)}</td>
                <td>$ ${formato.format(Number(cuenta.saldo_anio2) || 0)}</td>
                <td>$ ${formato.format(this.getDiferencia(cuenta.saldo_anio1, cuenta.saldo_anio2))}</td>
                <td>$ ${esTotal ? "-" : this.esFuente(cuenta.saldo_anio1, cuenta.saldo_anio2, esActivo)}</td>
                <td>$ ${esTotal ? "-" : this.esUso(cuenta.saldo_anio1, cuenta.saldo_anio2, esActivo)}</td>
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
    getDiferencia(saldo_anio1, saldo_anio2) {
        return (saldo_anio1 - saldo_anio2);
    }
    esUso(saldo_anio1, saldo_anio2, esActivo) {
        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        saldo_anio1 = Number(saldo_anio1)
        saldo_anio2 = Number(saldo_anio2)

        if (esActivo && (saldo_anio1 > saldo_anio2)) {
            return formato.format(Math.abs(this.getDiferencia(saldo_anio1, saldo_anio2)));
        } else if (!esActivo && ((saldo_anio1 < saldo_anio2))) {
            return formato.format(Math.abs(this.getDiferencia(saldo_anio1, saldo_anio2)));
        }
        return "-"
    }
    esFuente(saldo_anio1, saldo_anio2, esActivo) {
        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        saldo_anio1 = Number(saldo_anio1)
        saldo_anio2 = Number(saldo_anio2)
        if (esActivo && (saldo_anio1 < saldo_anio2)) {
            return formato.format(Math.abs(this.getDiferencia(saldo_anio1, saldo_anio2)));
        } else if (!esActivo && ((saldo_anio1 > saldo_anio2))) {
            return formato.format(Math.abs(this.getDiferencia(saldo_anio1, saldo_anio2)));
        }
        return "-"
    }

    getTotalAnio1(cuentas) {
        return cuentas.map(c => Number(c.saldo_anio1) || 0)
            .reduce((suma, saldo) => suma + saldo, 0)
    }
    getTotalAnio2(cuentas) {
        return cuentas.map(c => Number(c.saldo_anio2) || 0)
            .reduce((suma, saldo) => suma + saldo, 0)
    }



    getCss() {

        return `
         h1,
      h2,
      span,
      th,
      td,
      p {
          color: var(--color--oscuro);
          text-align: center;
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
          order: 4;
      }
            `
    }

}

customElements.define("balance-usos-fuentes", BalanceDeUsosFuentes);
export default BalanceDeUsosFuentes;
