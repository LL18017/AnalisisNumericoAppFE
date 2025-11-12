import { html, render } from "../../js/terceros/lit-html.js";

class EstadosFinancieros extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.menuAbierto = false;
    this.balance = document.createElement("balance-general");
    this.balanceAnalisisVertical = document.createElement("balance-general-analisi-vertical");
    this.balanceAnalisisHorizontal = document.createElement("balance-general-analisi-horizontal");
    this.balanceUsosFuentes = document.createElement("balance-usos-fuentes");
    this.estadoResultados = document.createElement("estado-resultados");
    this.estadoResultadosAnalisisVertical = document.createElement("estado-resultados-analisis-vertical");
    this.estadoResultadosAnalisisHorizontal = document.createElement("estado-resultados-analisis-horizontal");
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
      ${this.balanceAnalisisHorizontal}
      ${this.balanceUsosFuentes}
      ${this.estadoResultados}
      ${this.estadoResultadosAnalisisVertical}
      ${this.estadoResultadosAnalisisHorizontal}

      <div class="formulario-estados">
        <h2>Generar Estado Financiero</h2>
        
        <label for="tipoEstado">Tipo de estado:</label>
        <select id="tipoEstado" @change=${(e) => this.toggleAnioSecundario(e)}>
          <option value="reporte">Balance General</option>
          <option value="estado_resultado">Estado de Resultado</option>
          <option value="analisis_vertical_balance">Análisis Vertical Balance general</option>
          <option value="analisis_vertical_Estado_Resultados">Análisis Vertical Estado de Resultados</option>
          <option value="analisis_horizontal_balance">Análisis Horizontal Balance general</option>
          <option value="analisis_horizontal_Estado_Resultados">Análisis Horizontal Estado de resultados</option>
          <option value="balance_usos_fuente">Balance de usos y fuentes</option>
        </select>

        <label for="anioPrincipal">Año principal:</label>
        <input type="number" id="anioPrincipal" min="1900" max="2100" placeholder="Ej. 2025" value="2025" />

          <label id="labelAnioSecundario" for="anioSecundario" style="display:none;">Año secundario:</label>
          <input type="number" id="anioSecundario" min="1900" max="2100" placeholder="Ej. 2024" value="2024" style="display:none;"/>

        <button class="btn" @click=${() => this.generarReporte()} id="generar">Generar</button>
      </div>
    `;

    render(plantilla, this._root);
  }

  // Mostrar/ocultar campo "Año secundario" según el tipo de estado
  toggleAnioSecundario(e) {
    const tipo = e.target.value;
    const labelAnioSecundario = this._root.querySelector("#labelAnioSecundario");
    const inputAnioSecundario = this._root.querySelector("#anioSecundario");
    if (
      tipo === "analisis_horizontal_balance" ||
      tipo === "analisis_horizontal_Estado_Resultados" ||

      tipo === "balance_usos_fuente" ||
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
      this.mostrarEstadoDeResultados(tipo, anioPrincipal, anioSecundario, this.estadoResultados);
    } else if (tipo === "analisis_vertical_Estado_Resultados") {
      this.mostrarEstadoDeResultados(tipo, anioPrincipal, anioSecundario, this.estadoResultadosAnalisisVertical);
    } else if (tipo === "analisis_horizontal_Estado_Resultados") {
      this.mostrarEstadoDeResultados(tipo, anioPrincipal, anioSecundario, this.estadoResultadosAnalisisHorizontal);
    } else if (tipo === "analisis_vertical_balance") {
      this.mostrarBalance(tipo, anioPrincipal, anioSecundario, this.balanceAnalisisVertical);
    } else if (tipo === "analisis_horizontal_balance") {
      this.mostrarBalance(tipo, anioPrincipal, anioSecundario, this.balanceAnalisisHorizontal);
    } else if (tipo === "balance_usos_fuente") {
      this.mostrarBalance(tipo, anioPrincipal, anioSecundario, this.balanceUsosFuentes);
    } else if (tipo === "reporte") {
      this.mostrarBalance(tipo, anioPrincipal, anioSecundario, this.balance);
    }

    this.actualizarElementosVisibles();
    this.noticadorHandle(`Generando estado financiero ${tipo} para ${anioPrincipal}`, "info");
  }



  async mostrarBalance(tipo, anioPrincipal, anioSecundario, componente) {
    if (!componente) {
      console.error("Componente no definido para mostrarBalance");
      return;
    }

    // Lógica especial según tipo de análisis
    if (typeof componente.setCuentasDeBalancePorPeriodo === "function") {
      if (anioSecundario) {
        await componente.setCuentasDeBalancePorPeriodo(anioPrincipal, anioSecundario);
      } else {
        await componente.setCuentasDeBalancePorPeriodo(anioPrincipal);
      }
    } else {
      console.warn(`El componente ${tipo} no tiene el método setCuentasDeBalancePorPeriodo`);
    }

    if (componente.ListDeCuentas.length !== 0) {
      componente.render();
      componente.tipo = tipo;
      componente.style.display = "block";
      componente.anioPrincipal = anioPrincipal;
      componente.anioSecundario = anioSecundario;
    } else {
      this.noticadorHandle(`El componente ${tipo} no se puede renderizar`, "danger");
      this.atrasBtn()
      return;
    }


  }

  async mostrarEstadoDeResultados(tipo, anioPrincipal, anioSecundario, componente) {
    if (!componente) {
      console.error("Componente no definido para mostrarBalance");
      return;
    }

    componente.tipo = tipo;
    componente.style.display = "block";
    componente.anioPrincipal = anioPrincipal;
    componente.anioSecundario = anioSecundario;

    // Lógica especial según tipo de análisis
    if (typeof componente.setCuentasDeEstadoDeResultadoPorPeriodo === "function") {
      if (anioSecundario) {
        await componente.setCuentasDeEstadoDeResultadoPorPeriodo(anioPrincipal, anioSecundario);
      } else {
        await componente.setCuentasDeEstadoDeResultadoPorPeriodo(anioPrincipal);
      }
    } else {
      console.warn(`El componente ${tipo} no tiene el método setCuentasDeEstadoDeResultadoPorPeriodo`);
    }

    if (typeof componente.render === "function") {
      componente.render();
    } else {
      console.warn(`El componente ${tipo} no tiene el método render`);
    }
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
    this.balanceAnalisisHorizontal.style.display = "none";
    this.balanceUsosFuentes.style.display = "none";
    this.estadoResultados.style.display = "none";
    this.estadoResultadosAnalisisVertical.style.display = "none";
    this.estadoResultadosAnalisisHorizontal.style.display = "none";
  }

  async exportToPDF() {
    const tipo = this._root.querySelector("#tipoEstado").value;

    try {
      let shadowRoot;
      let css = ""

      if (tipo === "reporte") {
        shadowRoot = this.balance.shadowRoot || this.balance._root;
      } else if (tipo === "analisis_vertical_balance") {
        shadowRoot = this.balanceAnalisisVertical.shadowRoot || this.balanceAnalisisVertical._root;
      } else if (tipo === "analisis_horizontal_balance") {
        shadowRoot = this.balanceAnalisisHorizontal.shadowRoot || this.balanceAnalisisHorizontal._root;
      } else if (tipo === "balance_usos_fuente") {
        shadowRoot = this.balanceUsosFuentes.shadowRoot || this.balanceUsosFuentes._root;
      } else if (tipo === "estado_resultado") {
        shadowRoot = this.estadoResultados.shadowRoot || this.estadoResultados._root;
      } else if (tipo === "analisis_vertical_Estado_Resultados") {
        shadowRoot = this.estadoResultadosAnalisisVertical.shadowRoot || this.estadoResultadosAnalisisVertical._root;
      } else if (tipo === "analisis_horizontal_Estado_Resultados") {
        shadowRoot = this.estadoResultadosAnalisisHorizontal.shadowRoot || this.estadoResultadosAnalisisHorizontal._root;
      }

      if (!shadowRoot) {
        this.noticadorHandle(`No se encontró el shadowRoot del componente ${tipo}`, "danger");
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
