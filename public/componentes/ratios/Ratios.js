import { html, render } from "../../js/terceros/lit-html.js";
class Ratios extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.menuAbierto = false;
  }

  connectedCallback() {
    this.render();
  }


  render() {
    const link = html`
      <link rel="stylesheet" href="./componentes/ratios/ratios.css" />
    `;

    const plantilla = html`
      ${link}
      <h1>ratios</h1>

    `;

    render(plantilla, this._root);
  }
 

}

customElements.define("ratios-financieros", Ratios);
