import { html, render } from "../../js/terceros/lit-html.js";

class DetalleInformacion extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.tipo = "";
    this.data = {};
    this.visible = false;
  }

  connectedCallback() {
    this.render();
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
                      <span>${typeof subValor === "number"
              ? subValor.toLocaleString()
              : subValor}</span>
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
            <td>${typeof valor === "number"
            ? valor.toLocaleString()
            : valor}</td>
          </tr>
        `;
      }
    };

    const contenido = html`
      ${link}
      <div id="modal" class="modal" style="display: none;">
        <div class="contenido">
          <button class="cerrar" @click=${() => this.cerrar()}>×</button>
          <h3>${this.tipo.replace("ratios", "Ratios de ")}</h3>
          <table>
            <thead>
              <tr><th>Concepto</th><th>Valor</th></tr>
            </thead>
            <tbody>
              ${Object.entries(this.data || {}).map(([clave, valor]) =>
      renderFila(clave, valor)
    )}
            </tbody>
          </table>
        </div>
      </div>
    `;

    render(contenido, this._root);
  }

  mostrar() {
    const modal = this._root.querySelector("#modal");
    if (!modal) {
      this.render();
    }
    const nuevoModal = this._root.querySelector("#modal");
    if (nuevoModal) {
      nuevoModal.style.display = "flex";
      this.visible = true;
      console.log("Modal mostrado");
    }
  }

  cerrar() {
    const modal = this._root.querySelector("#modal");
    if (modal) {
      modal.style.display = "none";
      this.visible = false;
      console.log("Modal cerrado");
    }
  }
}

customElements.define("detalle-informacion", DetalleInformacion);
