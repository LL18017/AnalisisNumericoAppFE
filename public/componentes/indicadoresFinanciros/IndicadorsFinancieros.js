import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";

class Indicadores extends HTMLElement {
  constructor() {
    super();
    this.RegistroAccess = new RegistroAccess();
    this._root = this.attachShadow({ mode: "open" });
    this.ratios = document.createElement("ratios-financieros");


    // Variables principales
    this.menuAbierto = false;
    this.ListDeCuentas = [];
    this.data = {};
    this.visible = false; // control de modal
    this.tipo = "";
  }

  connectedCallback() {
    this.render();
  }

  async setCuentasRatios(anio) {
    try {
      const response = await this.RegistroAccess.getDataCuentasDeRatios(anio);
      if (!response.ok) throw new Error("Error al obtener cuentas de ratios");
      return await response.json();
    } catch (error) {
      this.noticadorHandle(error, "danger")
      this.data = {}
    }
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/indicadoresFinanciros/detalle.css" />
      <link rel="stylesheet" href="./componentes/indicadoresFinanciros/indicadores.css" />
    `;

    const renderFila = (clave, valor) => {
      if (clave === "Principal" && typeof valor === "object") {
        return html`
          <tr>
            <td colspan="2">
              <div class="bloque-principal">
                <h4>${clave}</h4>
                ${Object.entries(valor).map(
          ([subClave, subValor]) => html`
                    <div class="fila-principal">
                      <span>${subClave}</span>
                      <span>
                        ${typeof subValor === "number"
              ? subValor.toLocaleString()
              : subValor}
                      </span>
                    </div>
                  `
        )}
              </div>
            </td>
          </tr>
        `;
      } else {
        return html`
          <tr>
            <td>${clave}</td>
            <td>
              ${typeof valor === "number" ? valor.toLocaleString() : valor}
            </td>
          </tr>
        `;
      }
    };

    const plantilla = html`
      ${link}
      <div class="btnContainer">
        <button id="btnAtras" class="btn_estados" @click=${() => this.atrasBtn()}>Atrás</button>
        <button id="btnDetalle" class="btn_estados" @click=${() => this.mostrarModal()}>Detallar Info</button>
        <button id="btnDescargar" class="btn_estados" @click=${() => this.exportToPDF()}>Descargar</button>
      </div>
      ${this.ratios}

      <div class="formulario-ratios">
        <h2>Generar Indicador Financiero</h2>

        <label for="tipoEstado">Tipo de Indicador:</label>
        <select id="tipoEstado" @change=${(e) => this.toggleAnioSecundario(e)}>
          <option value="ratios">Ratios Financieros</option>
          <option value="dupont">Análisis de Dupont</option>
        </select>

        <label for="anioPrincipal">Año principal:</label>
        <input
          type="number"
          id="anioPrincipal"
          min="1900"
          max="2100"
          placeholder="Ej. 2025"
          value="2025"
        />

        <label id="labelAnioSecundario" for="anioSecundario" style="display:none;">
          Año secundario:
        </label>
        <input
          type="number"
          id="anioSecundario"
          min="1900"
          max="2100"
          value="2024"
          placeholder="Ej. 2024"
          style="display:none;"
        />

        <button class="btn" @click=${() => this.generarReporte()}>Generar</button>
      </div>

      <!-- Modal integrado -->
      <div id="modal" class="modal" style="display: ${this.visible ? "flex" : "none"};">
        <div class="contenido">
          <button class="cerrar" @click=${() => this.cerrarModal()}>×</button>
          <h3>Cuentas para ${this.anioPrincipal}</h3>
          <table>
            <thead>
              <tr><th>Concepto</th><th>Valor</th></tr>
            </thead>
            <tbody>
              ${Object.entries(this.data.cuentas || {}).map(([clave, valor]) =>
      renderFila(clave, valor)
    )}
            </tbody>
          </table>
        </div>
      </div>
    `;

    render(plantilla, this._root);
  }

  toggleAnioSecundario(e) {
    const tipo = e.target.value;
    const label = this._root.querySelector("#labelAnioSecundario");
    const input = this._root.querySelector("#anioSecundario");

    const mostrar = tipo === "analisis_horizontal_Estado_Resultados";
    label.style.display = mostrar ? "block" : "none";
    input.style.display = mostrar ? "block" : "none";
  }

  async generarReporte() {
    const tipo = this._root.querySelector("#tipoEstado").value;
    const anioPrincipal = parseInt(this._root.querySelector("#anioPrincipal").value);
    const anioSecundario = parseInt(this._root.querySelector("#anioSecundario")?.value || 0);

    if (!anioPrincipal) {
      alert("Debe ingresar un año principal válido.");
      return;
    }


    this.tipo = tipo;
    this.anioPrincipal = anioPrincipal;
    this.data = await this.setCuentasRatios(anioPrincipal);

    if (!this.data || Object.keys(this.data).length === 0) {
      this.noticadorHandle(`No se pudo generar: ${tipo}`, "danger");
      this.atrasBtn();
      return;
    }

    if (this.tipo === "ratios") {
      this.ratios.anio = anioPrincipal;
      this.ratios.data = structuredClone(this.data);
      this.ratios.render();
      this.ratios.style.display = "block"
    }

    this.actualizarElementosVisibles();
    this.noticadorHandle(`Generando indicador financiero: ${tipo} para ${anioPrincipal}`, "info");
  }

  noticadorHandle(mensaje, status) {
    this.dispatchEvent(
      new CustomEvent("notificacion", {
        composed: true,
        bubbles: true,
        detail: { mensaje, body: { status } },
      })
    );
  }

  actualizarElementosVisibles() {
    const formulario = this._root.querySelector(".formulario-ratios");
    const btnAtras = this._root.querySelector("#btnAtras");
    const btnDetalle = this._root.querySelector("#btnDetalle");
    const btnDescargar = this._root.querySelector("#btnDescargar");
    formulario.style.display = "none";
    btnAtras.style.display = "block";
    btnDetalle.style.display = "block";
    btnDescargar.style.display = "block";
  }

  atrasBtn() {
    const formulario = this._root.querySelector(".formulario-ratios");
    const btnAtras = this._root.querySelector("#btnAtras");
    const btnDetalle = this._root.querySelector("#btnDetalle");
    const btnDescargar = this._root.querySelector("#btnDescargar");
    this.ratios.style.display = "none"
    formulario.style.display = "flex";
    btnAtras.style.display = "none";
    btnDescargar.style.display = "none";
    btnDetalle.style.display = "none";
    this.cerrarModal();
  }

  mostrarModal() {
    const modal = this._root.querySelector("#modal");
    if (modal) {
      modal.style.display = "flex";
      this.visible = true;
      this.render();
    }
  }

  cerrarModal() {
    const modal = this._root.querySelector("#modal");
    if (modal) {
      modal.style.display = "none";
      this.visible = false;
    }
  }

  async exportToPDF() {
    const tipo = this._root.querySelector("#tipoEstado").value;

    try {
      let shadowRoot;
      let css = ""

      if (tipo === "ratios") {
        shadowRoot = this.ratios.shadowRoot || this.ratios._root;
        css = this.ratios.getCss()
      } else if (tipo === "analisis_vertical_balance") {
        shadowRoot = this.balanceAnalisisVertical.shadowRoot || this.balanceAnalisisVertical._root;
        css = this.balanceAnalisisVertical.getCss()
      }

      if (!shadowRoot) {
        console.error(`No se encontró el shadowRoot del componente ${tipo}`);
        return;
      }


      // Obtenemos el HTML interno del shadow DOM
      const contenidoHTML = shadowRoot.innerHTML;

      // Construimos el documento HTML completo para Puppeteer
      const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${tipo}</title>
          <style>
            ${css}
          </style>
          <link rel="stylesheet" href="./main.css">
          <link rel="stylesheet" href="./componentes/estadosFinancieros/estados.css">
        </head>
        <body>
          <div id="wrapper">
            ${contenidoHTML}
          </div>
        </body>
      </html>
    `;

      // Enviamos el HTML al backend (endpoint Puppeteer)
      const response = await fetch(`/pdf/${tipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error(`Error al generar el PDF: ${response.statusText}`);
      }

      // Recibimos el PDF y lo descargamos
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
}

customElements.define("indicadores-financieros", Indicadores);
