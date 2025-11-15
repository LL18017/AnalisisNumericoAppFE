import { html, render } from "../../js/terceros/lit-html.js";

class AnalisisDupont extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: "open" });
        this.dupont = {};  // tu objeto raíz
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const estilos = html`
<style>

/* --- 1. Evitar cortes de página en cualquier parte del árbol --- */
.tree, 
.tree ul, 
.tree li, 
#dupont-wrapper {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

/* --- 2. Contenedor principal que el PDF debe respetar como un solo bloque --- */
#dupont-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: visible;
    page-break-after: avoid !important;
    page-break-before: avoid !important;
}

/* --- 3. El árbol escalará automáticamente (JS lo ajusta) --- */
.tree {
    transform-origin: top center;
    width: max-content; /* importante para que el JS pueda medir el ancho real */
    margin: 0 auto;
}


* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.tree {
    width: 100%;
    text-align: center;
}

/* ----- Estructura general del árbol ----- */

.tree ul {
    padding-top: 20px;
    position: relative;
    transition: .5s;
}

.tree li {
    display: inline-table;
    text-align: center;
    list-style-type: none;
    position: relative;
    padding: 10px;
    transition: .5s;
}

/* ----- Líneas ----- */

.tree li::before,
.tree li::after {
    content: '';
    position: absolute;
    top: 0;
    right: 50%;
    border-top: 2px solid #2F4B7C;
    width: 51%;
    height: 10px;
}

.tree li::after {
    right: auto;
    left: 50%;
    border-left: 2px solid #2F4B7C;
}

.tree li:only-child::after,
.tree li:only-child::before {
    display: none;
}

.tree li:only-child {
    padding-top: 0;
}

.tree li:first-child::before,
.tree li:last-child::after {
    border: 0 none;
}

.tree li:last-child::before {
    border-right: 2px solid #2F4B7C;
    border-radius: 0 5px 0 0;
}

.tree li:first-child::after {
    border-radius: 5px 0 0 0;
}

.tree ul ul::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    border-left: 2px solid #2F4B7C;
    height: 20px;
}

/* ----- Nodos ----- */

.tree li a {
    border: 2px solid #2F4B7C;
    padding: 10px;
    display: inline-grid;
    border-radius: 8px;
    text-decoration: none;
    background: #2F4B7C;
    color: white;
    min-width: 100px;
    transition: .3s;
}

.tree li a span {
    border-radius: 8px;
    padding: 4px;
    background: #2F4B7C;
    color: white;
    font-size: 10px;
    font-weight: 500;
    margin-top: 4px;
}


.tree li a:hover + ul li::after,
.tree li a:hover + ul li::before,
.tree li a:hover + ul::before,
.tree li a:hover + ul ul::before {
    border-color: #2F4B7C;
}

</style>

        `;

        const plantilla = html`
            ${estilos}
            <div id="dupont-wrapper">
            <div class="tree">
                <ul>
                    ${this.generarNodo(this.dupont)}
                </ul>
            </div>
            </div>
        `;

        render(plantilla, this._root);
    }

    generarNodo(nodo) {
        const formato = new Intl.NumberFormat("es-SV", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5
        });
        if (!nodo) return "";

        return html`
<li>
    <a href="#">
        <span>${nodo.nombreCuenta}</span>
        <span>${formato.format(nodo.saldo)}</span>
    </a>

    ${nodo.detalle && nodo.detalle.length > 0 ? html`
    <ul>
        ${nodo.detalle.map(hijo => this.generarNodo(hijo))}
    </ul>
    ` : ""}
</li>
        `;
    }
}

customElements.define("analisis-dupont", AnalisisDupont);
