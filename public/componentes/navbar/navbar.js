import { html, render } from "../../js/terceros/lit-html.js";
class NavBar extends HTMLElement {
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
      <link rel="stylesheet" href="./componentes/navbar/navbar.css" />
    `;

    const plantilla = html`
      ${link}
      <div
        class="list-container"
        style=${this.menuAbierto
        ? "background-color: rgba(2, 2, 2, 0.7); height: 100vh;"
        : "background-color: var(--color--principal); height: 80px;"}
      >
        <button
          id="menu-button-cerrar"
          style=${this.menuAbierto ? "display: block" : "display: none"}
          @click=${() => this.buttonCerrar()}
        >
          <img src="./css/assets/cerrar-blanco.png" />
        </button>

        <button
          id="menu-button-abrir"
          style=${this.menuAbierto ? "display: none" : "display: block"}
          @click=${() => this.buttonAbrir()}
        >
          <img src="./css/assets/menu-blanco.png" />
        </button>

        <!-- Menú principal -->
        <ul id="menu-lista" class=${this.menuAbierto ? "mostrar" : "ocultar"}>
          <li @click=${() => this.inicionCLick()}>Inicio</li>
          <li @click=${() => this.CatalogoDeCuentasClick()}>Catalogo</li>
          <li @click=${() => this.EstadosFinancierosCLick()}>estados financieros</li>
          <li @click=${() => this.registroClick()}>registros</li>
          <li @click=${() => this.indicadoresFinancierosClick()}>indicadores finacieros</li>
        </ul>

    `;

    render(plantilla, this._root);
    this._carrito = this._root.querySelector("#cartCard");
  }


  buttonAbrir() {
    const cartElement = this._root.querySelector("#cartLi");
    if (cartElement) {
      cartElement.style.display = "none";
    }
    this.menuAbierto = true;
    this.render();
  }

  buttonCerrar() {
    const cartElement = this._root.querySelector("#cartLi");
    if (cartElement) {
      cartElement.style.display = "block";
    }
    this.menuAbierto = false;
    this.render();
  }

  inicionCLick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("inicioClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonInicio",
          mensaje: "boton inicion clickeado",
          body: {},
        },
      })
    );
  }

  MenuCLick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("menuClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonMenu",
          mensaje: "boton menu clickeado",
          body: {},
        },
      })
    );
  }

  EstadosFinancierosCLick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("EstadosFinancierosCLick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonEstadosFinancieros",
          mensaje: "boton estadosFinancieros clickeado",
          body: {},
        },
      })
    );
  }

  CatalogoDeCuentasClick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("CatalogoDeCuentasClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonCatalogoDeCuentasClick",
          mensaje: "boton para catalogo de cuentas clickeado",
          body: {},
        },
      })
    );
  }

  indicadoresFinancierosClick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("indicadoresFinancierosClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonIndicadoresFinancierosClick",
          mensaje: "boton para indicadores clickeado",
          body: {},
        },
      })
    );
  }
  registroClick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("registroClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonRegistroClick",
          mensaje: "boton para registros clickeado",
          body: {},
        },
      })
    );
  }

  cartClick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("cartClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "cart",
          mensaje: "boton cart clickeado",
          body: {
            id: 1,
            nombre: "hola",
          },
        },
      })
    );
  }





}

customElements.define("nav-bar", NavBar);
