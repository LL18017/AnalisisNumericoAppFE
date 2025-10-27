import { html, render } from "../../js/terceros/lit-html.js";

class EstadosFinancieros extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.menuAbierto = false;
    this.balance = document.createElement("balance-general");
    this.balanceAnalisisVertical = document.createElement("balance-general-analisi-vertical");
    this.estadoResultados = document.createElement("estado-resultados");
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./componentes/estadosFinancieros/estados.css" />
      <link rel="stylesheet" href="./main.css" />
    `;

    const plantilla = html`
      ${link}
      <div class="btnContainer">
        <button class="btn_estados" @click=${() => this.atrasBtn()} id="atrasBtn">Atrás</button>
        <button class="btn_estados" @click=${() => this.exportToPDF()} id="descargarBtn">Descargar</button>
      </div>

      ${this.balance}
      ${this.balanceAnalisisVertical}
      ${this.estadoResultados}

      <div class="formulario-estados">
        <h2>Generar Estado Financiero</h2>
        
        <label for="tipoEstado">Tipo de estado:</label>
        <select id="tipoEstado" @change=${(e) => this.toggleAnioSecundario(e)}>
          <option value="reporte">Balance General (Reporte)</option>
          <option value="cuenta">Balance General (Cuenta)</option>
          <option value="estado_resultado">Estado de Resultado</option>
          <option value="analisis_vertical_balance">Análisis Vertical Balance general</option>
          <option value="analisis_horizontal">Análisis Horizontal</option>
          <option value="balance_uso_aplicacion">Balance de Uso y Aplicación</option>
        </select>

        <label for="anioPrincipal">Año principal:</label>
        <input type="number" id="anioPrincipal" min="1900" max="2100" placeholder="Ej. 2025" />

          <label id="labelAnioSecundario" for="anioSecundario" style="display:none;">Año secundario:</label>
          <input type="number" id="anioSecundario" min="1900" max="2100" placeholder="Ej. 2024" style="display:none;"/>

        <button class="btn" @click=${() => this.generarReporte()} id="generar">Generar</button>
      </div>
    `;

    render(plantilla, this._root);
  }

  // 🔄 Mostrar/ocultar campo "Año secundario" según el tipo de estado
  toggleAnioSecundario(e) {
    const tipo = e.target.value;
    const labelAnioSecundario = this._root.querySelector("#labelAnioSecundario");
    const inputAnioSecundario = this._root.querySelector("#anioSecundario");
    if (
      tipo === "analisis_horizontal" ||
      tipo === "balance_uso_aplicacion"
    ) {
      labelAnioSecundario.style.display = "block";
      inputAnioSecundario.style.display = "block";
    } else {
      labelAnioSecundario.style.display = "none";
      inputAnioSecundario.style.display = "none";
    }
  }

  generarReporte() {
    const tipo = this._root.querySelector("#tipoEstado").value;
    const anioPrincipal = parseInt(this._root.querySelector("#anioPrincipal").value);
    const anioSecundarioInput = this._root.querySelector("#anioSecundario");
    const anioSecundario = anioSecundarioInput && anioSecundarioInput.value ? parseInt(anioSecundarioInput.value) : null;

    if (!anioPrincipal) {
      alert("Debe ingresar un año principal válido.");
      return;
    }

    // Aquí puedes ajustar la lógica según el tipo de estado
    if (tipo === "estado_resultado") {
      this.mostrarEstadoResultado(anioPrincipal);
    } else if (tipo === "analisis_vertical_balance") {
      this.mostrarBalanceAnalisisVertical(tipo, anioPrincipal, anioSecundario);
    } else if (tipo === "reporte") {
      this.mostrarBalance(tipo, anioPrincipal, anioSecundario);
    }

    this.actualizarElementosVisibles();
    this.noticadorHandle(`Generando estado financiero ${tipo} para ${anioPrincipal}`, "info");
  }

  async mostrarBalance(tipo, anioPrincipal, anioSecundario) {
    this.balance.tipo = tipo;
    this.balance.style.display = "block";
    this.balance.anioPrincipal = anioPrincipal;
    this.balance.anioSecundario = anioSecundario;
    console.log("anio es " + anioPrincipal);

    await this.balance.setCuentasDeBalancePorPeriodo(anioPrincipal);
    this.balance.render();
  }

  async mostrarBalanceAnalisisVertical(tipo, anioPrincipal, anioSecundario) {
    this.balanceAnalisisVertical.tipo = tipo;
    this.balanceAnalisisVertical.style.display = "block";
    this.balanceAnalisisVertical.anioPrincipal = anioPrincipal;
    this.balanceAnalisisVertical.anioSecundario = anioSecundario;

    await this.balanceAnalisisVertical.setCuentasDeBalancePorPeriodo(anioPrincipal);
    this.balanceAnalisisVertical.render();
  }

  mostrarEstadoResultado(anioPrincipal) {
    this.estadoResultados.style.display = "block";
    this.estadoResultados.anioPrincipal = anioPrincipal;
    this.estadoResultados.setCuentasDeBalancePorPeriodo();
    this.estadoResultados.render();
  }

  actualizarElementosVisibles() {
    const formulario = this._root.querySelector(".formulario-estados");
    const atrasBtn = this._root.querySelector("#atrasBtn");
    const descargarBtn = this._root.querySelector("#descargarBtn");

    formulario.style.display = "none";
    atrasBtn.style.display = "inline";
    descargarBtn.style.display = "inline";
  }

  atrasBtn() {
    const formulario = this._root.querySelector(".formulario-estados");
    const btnAtras = this._root.querySelector("#atrasBtn");
    const descargarBtn = this._root.querySelector("#descargarBtn");

    btnAtras.style.display = "none";
    descargarBtn.style.display = "none";
    formulario.style.display = "flex";
    this.balance.style.display = "none";
    this.balanceAnalisisVertical.style.display = "none";
    this.estadoResultados.style.display = "none";
  }

  async exportToPDF() {
    const tipo = this._root.querySelector("#tipoEstado").value;
    try {
      let shadowRoot = this.balance.shadowRoot || this.balance._root;;
      if (tipo === "reporte") {
        shadowRoot = this.balance.shadowRoot || this.balance._root;
      } else if (tipo == "analisis_vertical_balance") {
        shadowRoot = this.balanceAnalisisVertical.shadowRoot || this.balanceAnalisisVertical._root;
      } else {

      }

      if (!shadowRoot) {
        console.error(`No se encontró el shadowRoot del componente ${tipo}`);
        return;
      }



      // Obtener el HTML del shadow DOM
      const contenidoHTML = shadowRoot.innerHTML;

      const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${tipo}</title>
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

          </style>
          <link rel="stylesheet" href="./componentes/estadosFinancieros/estados.css">
          <link rel="stylesheet" href="./main.css">
        </head>
        <body>
          <div id="wrapper">
            ${contenidoHTML}
          </div>
        </body>
      </html>
    `;

      const response = await fetch(`/pdf/${tipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error(`Error al generar el PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando PDF:", error);
    }
  }



  noticadorHandle(mensaje, status) {
    this.dispatchEvent(
      new CustomEvent("notificacion", {
        composed: true,
        bubbles: true,
        detail: { element: "botonInicio", mensaje, body: { status } },
      })
    );
  }
}

customElements.define("estados-financieros", EstadosFinancieros);
