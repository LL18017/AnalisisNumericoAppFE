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
          font-size: 10px;
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
       <h1>Balance General</h1>
      <h2>Alutech SA DE SV</h2>
      <h2>Balance de usos y fuentes al 31 de diciembre de ${this.anioPrincipal} y ${this.anioSecundario}</h2>
   <div class="balance-cuerpo">
        <table tabla-balance>
          <thead >
          <tr>
            <th>Cuenta</th>
            <th>Saldo ${this.anioPrincipal}</th>
            <th>Saldo ${this.anioSecundario}</th>
            <th>variacion</th>
            <th>fuente</th>
            <th>uso</th>
          </tr>
        </thead>
        <tbody>
          ${this.renderActivos()}
          ${this.renderPasivosPatrimonio()}
          ${this.renderSumaTotal()}
        </tbody>
        </table>
          ${this.firmas()}
    </div>
    `;

        render(plantilla, this._root);
    }

    renderActivos() {
        const cuentasAC = this.getCuentasPorCodigo("1.1");
        cuentasAC.unshift({ "nombre_cuenta": "Activo Corriente" })
        cuentasAC.unshift({ "nombre_cuenta": "Activo" })

        const cuentasANC = this.getCuentasPorCodigo("1.2");
        cuentasANC.unshift({ "nombre_cuenta": "Activo No Corriente" })

        cuentasANC.push({
            nombre_cuenta: "TOTAL ACTIVOS",
            saldo_anio1: this.getTotalAnio1(cuentasAC.concat(...cuentasANC)),
            saldo_anio2: this.getTotalAnio2(cuentasAC.concat(...cuentasANC)),
        })


        return html`
        ${this.renderTabla("Activo corriente", cuentasAC, true, false, true)}
        ${this.renderTabla("Activo no corriente", cuentasANC, false, true, true)}
    `;
    }

    // ---------- Sección: Pasivos y Patrimonio ----------
    renderPasivosPatrimonio() {
        const cuentasPC = this.getCuentasPorCodigo("2.1");
        const cuentasPNC = this.getCuentasPorCodigo("2.2");
        const cuentasCap = this.getCuentasPorCodigo("3.");
        const total1 = this.getTotalAnio1(cuentasPC
            .concat(cuentasPNC).concat(cuentasCap));
        const total2 = this.getTotalAnio2(cuentasPC
            .concat(cuentasPNC).concat(cuentasCap));



        let total = this.getTotal(cuentasPC.concat(...cuentasPNC))


        cuentasPC.unshift({ "nombre_cuenta": "Pasivo Corriente" })
        cuentasPC.unshift({ "nombre_cuenta": "Pasivo" })

        cuentasPNC.unshift({ "nombre_cuenta": "Pasivo No Corriente" })

        cuentasPNC.push({
            nombre_cuenta: "TOTAL PASIVOS",
            saldo_anio1: this.getTotalAnio1(cuentasPC
                .concat(cuentasPNC)),

            saldo_anio2: this.getTotalAnio2(cuentasPC
                .concat(cuentasPNC))
        })

        cuentasCap.unshift({ "nombre_cuenta": "Patrimonio" })
        cuentasCap.push({
            nombre_cuenta: "TOTAL PASIVOS y PATRIMONIO",
            saldo_anio1: total1,
            saldo_anio2: total2
        })

        return html`
         ${this.renderTabla("Pasivo corriente", cuentasPC, false, false, false)}
          ${this.renderTabla("Pasivo no corriente", cuentasPNC, false, true, false)}
          ${this.renderTabla("Capital", cuentasCap, false, true, false)}
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
                    <tr style="font-weight:bold; background:#f0f0f0;">
                        <td>Suma Total</td>
                        <td colspan="3"></td>
                        <td>$ ${formato.format(totalUso)}</td>
                        <td>$ ${formato.format(totalFuente)}</td>
                    </tr>
    `;
    }



    renderTabla(titulo, cuentas, renderHeaders, renderTotal, esActivo) {
        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Crear objeto total
        const TotalTitulo = {
            nombre_cuenta: `TOTAL ${titulo}`
        };

        let saldoTitulo1 = 0;
        let saldoTitulo2 = 0;

        if (renderTotal) {
            // Si renderTotal es true → sumar todas menos la última
            saldoTitulo1 = this.getTotalAnio1(cuentas.slice(0, -1));
            saldoTitulo2 = this.getTotalAnio1(cuentas.slice(0, -1));
            TotalTitulo.saldo_anio1 = saldoTitulo1;
            TotalTitulo.saldo_anio2 = saldoTitulo2;

            // Insertar antes del último elemento
            cuentas.splice(cuentas.length - 1, 0, TotalTitulo);
        } else {
            // Si renderTotal es false → sumar todas las cuentas
            saldoTitulo1 = this.getTotalAnio1(cuentas);
            saldoTitulo2 = this.getTotalAnio2(cuentas);
            TotalTitulo.saldo_anio1 = saldoTitulo1;
            TotalTitulo.saldo_anio2 = saldoTitulo2;

            // Agregar al final del array
            cuentas.push(TotalTitulo);
        }

        // Renderizado
        return html`
        ${cuentas.map((cuenta, index) => {
            console.log(cuenta);

            // Determinar si va en negrita
            const esNegritaBase = renderHeaders ? index < 2 : index < 1;
            const contieneTotal = cuenta.nombre_cuenta?.toLowerCase().includes("total");
            const estilo = (esNegritaBase || contieneTotal)
                ? "font-weight: bold;"
                : "";


            const esTotal = /total/i.test(cuenta.nombre_cuenta); //  Detecta si es total
            return html`
            <tr>
              <td style=${estilo}>${cuenta.nombre_cuenta}</td>
              <td style=${estilo}>
                ${cuenta.saldo_anio1 == null ? "" : `$ ${formato.format(cuenta.saldo_anio1)}`}
              </td>
              <td style=${estilo}>
                ${cuenta.saldo_anio2 == null ? "" : `$ ${formato.format(cuenta.saldo_anio2)}`}
              </td>
             <td style=${estilo}>$  ${cuenta.saldo_anio1 == null && cuenta.saldo_anio2 == null ? "-"
                    : formato.format(this.getDiferencia(cuenta.saldo_anio1, cuenta.saldo_anio2))}</td>
              <td style=${estilo}>$ ${esTotal ? "-" : this.esFuente(cuenta.saldo_anio1, cuenta.saldo_anio2, esActivo)}</td>
              <td style=${estilo}>$ ${esTotal ? "-" : this.esUso(cuenta.saldo_anio1, cuenta.saldo_anio2, esActivo)}</td>
            </tr>
          `;
        })}
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

}

customElements.define("balance-usos-fuentes", BalanceDeUsosFuentes);
export default BalanceDeUsosFuentes;
