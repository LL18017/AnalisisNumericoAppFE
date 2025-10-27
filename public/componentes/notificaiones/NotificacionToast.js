import { html, render } from "../../js/terceros/lit-html.js";

class NotificacionToast extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.container = null; // Se inicializa en render()
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./componentes/notificaiones/NotificacionToast.css" />
      <link rel="stylesheet" href="./main.css" />
    `;
    const plantilla = html`
      ${link}
      <div class="toast-container"></div>
    `;
    render(plantilla, this._root);

    // Ahora sí tenemos el contenedor
    this.container = this._root.querySelector(".toast-container");
  }

   mostrar(mensaje, tipo = "info", duracion = 3000) {
    const toast = document.createElement("div");
    toast.classList.add("toast", `toast-${tipo}`);
    toast.innerHTML = `
      <span>${mensaje}</span>
      <span class="cerrar">&times;</span>
    `;
    this.container.appendChild(toast);

    // Cerrar al hacer click en la X
    toast.querySelector(".cerrar").addEventListener("click", () => {
      this._cerrar(toast);
    });

    // Eliminar automáticamente después de 'duracion' ms
    setTimeout(() => {
      this._cerrar(toast);
    }, duracion);
  }
  _crearToast(mensaje) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerHTML = `
      <span>${mensaje}</span>
      <span class="cerrar">&times;</span>
    `;

    toast.querySelector(".cerrar").addEventListener("click", () => {
      this._cerrar(toast);
    });

    return toast;
  }

  _cerrar(toast) {
    toast.style.animation = "slide-out 0.3s ease forwards";
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }
}

customElements.define("notificacion-toast", NotificacionToast);
