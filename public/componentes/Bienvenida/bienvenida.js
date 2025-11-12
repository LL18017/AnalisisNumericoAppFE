import { html, render } from "../../js/terceros/lit-html.js";
class Bienvenida extends HTMLElement {
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
      <link rel="stylesheet" href="./componentes/Bienvenida/bienvenida.css" />
    `;

        const plantilla = html`
      ${link}
      <div class="container">
            <img src="../../assets/inicio_fondo.jpg"/>
        </div>
    

    `;

        render(plantilla, this._root);
    }


}

customElements.define("bienvenida-inicio", Bienvenida);
