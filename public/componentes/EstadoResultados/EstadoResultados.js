import { html, render } from "../../js/terceros/lit-html.js";
import EstadoResultadoAccess from "../../control/EstadoResultadoAccess.js";
class EstadoResultado extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.ListDePeriodos = [];
    this.ListDeCuentas = [];
    this.cantidadDeReportes = 1;
    this.tipoPeriodo = ""
    this.visible = false;
  }

  connectedCallback() {
    this.render();
    this.EstadoResultadoAccess = new EstadoResultadoAccess();

  }

  getDataByDates() {
    this.EstadoResultadoAccess
  }

  render() {
    const link = html`
    <link rel="stylesheet" href="./main.css" />
    <link rel="stylesheet" href="./componentes/EstadoResultados/EstadoResultados.css" />
    `;


    const plantilla = html`
    ${link}
    <div class="pdf-container">
    <h1>
      Estado${this.cantidadDeReportes > 1 ? "s" : ""} 
      de Resultados
    </h1>
    <h2>Empresa más chingona del mundo SA DE SV</h2>
    <p>
      Análisis ${this.tipoDeAnalisis()} del
      <span>${this.ListDePeriodos?.[0] ? this.formatoFecha(this.ListDePeriodos[0].fechaInicio) : "sin fecha"}</span>
      al
      <span>${this.ListDePeriodos?.[this.ListDePeriodos.length - 1] ? this.formatoFecha(this.ListDePeriodos[this.ListDePeriodos.length - 1].fechaFinal) : "sin fecha"}</span>
    </p>
    <p>Cantidad de periodos: ${this.cantidadDeReportes} ${this.tipoPeriodo}</p>

    <div class="estado-cuerpo">
      ${this.renderCuerpo()}
    </div>
    </div>
    
  `;

    render(plantilla, this._root);
  }
  renderCuerpo() {
    // Tomamos los nombres de cuentas del primer periodo (asumiendo que todas son iguales)
    const cuentas = Object.keys(this.ListDePeriodos?.[0]?.reporte?.cuentasYSaldos || {});

    return html`
    <table class="tabla-estado">
      <thead>
  <tr>
    <th>Cuenta</th>
    ${this.ListDePeriodos.map(p => {
      const fecha = new Date(p.fechaInicio);
      let encabezado = "";

      if (this.tipoPeriodo === "anio") {
        encabezado = fecha.getFullYear(); // solo el año
      } else {
        const nombreMes = fecha.toLocaleString("es-ES", { month: "long" });
        encabezado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1); // capitalizar
      }

      return html`<th>${encabezado}</th>`;
    })}
  </tr>
</thead>

      <tbody>
        ${cuentas.map(cuenta => html`
          <tr>
            <td>${cuenta}</td>
            ${this.ListDePeriodos.map(p => {
      const saldo = p.reporte?.cuentasYSaldos[cuenta];
      return html`
      <td style="text-align:right; font-weight: ${[
          "Ventas totales", "Ventas netas", "Compras totales", "Compras netas",
          "Disponiblidad de productos para el periodo", "Costo de lo vendido",
          "Utilidad Bruta", "Gastos de operación", "Utilidad operativa",
          "Utilidad antes de impuesto e intereses", "Utilidad del periodo"
          ,]

          .includes(cuenta) ? 'bold' : 'normal'};">
                ${saldo != null ? Number(saldo).toLocaleString("es-SV", { minimumFractionDigits: 2 }) : "$0.00"}
              </td>`;
    })}
          </tr>
        `)}
      </tbody>
    </table>
  `;
  }



  getPeridosIniciales() {
    if (!this.ListDePeriodos || this.ListDePeriodos.length === 0) return [];

    return this.ListDePeriodos.map(p =>
      p.fechaInicio

    );
  }


  tipoDeAnalisis() {
    switch (this.tipoPeriodo) {
      case "anio":
        return "anual"
      case "semestre":
        return "semestral"
      case "trimestre":
        return "trimestral"
      case "mes":
        return "mensual"
      default:
        return ""
    }
  }
  formatoFecha(fechaFormatoIso) {
    if (!fechaFormatoIso) return ""; // Evita error si es null o undefined
    const fecha = new Date(fechaFormatoIso);

    if (isNaN(fecha)) return ""; // Evita error si la fecha es inválida

    const opciones = { day: "numeric", month: "long", year: "numeric" };
    return fecha.toLocaleDateString("es-ES", opciones);
  }

  setCuentasDeBalancePorPeriodo() {
    const promesas = this.ListDePeriodos.map(p => {

      return this.EstadoResultadoAccess.getDataByDate(this.formatLocalDate(p.fechaInicio), this.formatLocalDate(p.fechaFinal))
        .then(response => response.json())
        .then(reporte => {
          p.reporte = reporte;

        })
    }
    );

    Promise.all(promesas).then(() => {
      this.ListDeCuentas = this.ListDePeriodos.forEach(p =>
        console.log(p)
      );


      this.render();

    });
  }

  formatLocalDate(date) {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    // ------------------------------
    // TITULOS
    // ------------------------------
    doc.setFontSize(16);
    doc.text("Estado de Resultados", pageWidth / 2, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text("Empresa más chingona del mundo SA DE SV", pageWidth / 2, 60, { align: "center" });
    doc.text(
      `Análisis ${this.tipoDeAnalisis()} del ${this.ListDePeriodos?.[0] ? this.formatoFecha(this.ListDePeriodos[0].fechaInicio) : "sin fecha"} al ${this.ListDePeriodos?.[this.ListDePeriodos.length - 1] ? this.formatoFecha(this.ListDePeriodos[this.ListDePeriodos.length - 1].fechaFinal) : "sin fecha"}`,
      pageWidth / 2,
      80,
      { align: "center" }
    );

    // ------------------------------
    // Cuentas que van en negrita
    // ------------------------------
    const boldAccounts = [
      "Ventas totales", "Ventas netas", "Compras totales", "Compras netas",
      "Disponiblidad de productos para el periodo", "Costo de lo vendido",
      "Utilidad Bruta", "Gastos de operación", "Utilidad operativa",
      "Utilidad antes de impuesto e intereses", "Utilidad del periodo"
    ];

    // ------------------------------
    // COLUMNAS DINÁMICAS
    // ------------------------------
    const columns = [{ header: "Cuenta", dataKey: "cuenta" }];
    this.ListDePeriodos.forEach((p, index) => {
      const fecha = new Date(p.fechaInicio);
      let encabezado = "";
      if (this.tipoPeriodo === "anio") {
        encabezado = fecha.getFullYear();
      } else {
        const nombreMes = fecha.toLocaleString("es-ES", { month: "long" });
        encabezado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
      }
      columns.push({ header: encabezado, dataKey: `periodo${index}` });
    });

    // ------------------------------
    // FILAS
    // ------------------------------
    const cuentas = Array.from(
      new Set(this.ListDePeriodos.flatMap(p => Object.keys(p.reporte?.cuentasYSaldos || {})))
    );

    const rows = cuentas.map(cuenta => {
      const row = { cuenta };
      this.ListDePeriodos.forEach((p, index) => {
        const saldo = p.reporte?.cuentasYSaldos[cuenta] ?? 0;
        row[`periodo${index}`] = Number(saldo).toLocaleString("es-SV", { style: "currency", currency: "USD" });
      });
      return row;
    });

    // ------------------------------
    // COLUMNAS CENTRADAS
    // ------------------------------
    const columnStyles = {};
    this.ListDePeriodos.forEach((_, index) => {
      columnStyles[index + 1] = { halign: "center" }; // +1 porque la primera columna es "Cuenta"
    });

    // ------------------------------
    // TABLA
    // ------------------------------
    doc.autoTable({
      startY: 100,
      head: [columns.map(c => c.header)],
      body: rows.map(r => columns.map(c => r[c.dataKey])),
      styles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: 0,
        fillColor: 255,
        halign: "left"
      },
      headStyles: {
        fillColor: 255,
        textColor: 0,
        fontStyle: "normal",
        halign: "left"
      },
      alternateRowStyles: { fillColor: 255 },
      columnStyles,
      tableLineColor: 0,
      tableLineWidth: 0.1,
      // ------------------------------
      // Negritas solo para saldos de cuentas importantes
      // ------------------------------
      didParseCell: function (data) {
        const rowData = rows[data.row.index];
        // primera columna = "Cuenta" → normal
        if (data.column.index === 0) return;
        // columnas de saldo → si la cuenta está en boldAccounts
        if (boldAccounts.includes(rowData.cuenta)) {
          data.cell.styles.fontStyle = "bold";
        }
      }
    });

    doc.save("EstadoResultados.pdf");
  }





}

customElements.define("estado-resultados", EstadoResultado);
