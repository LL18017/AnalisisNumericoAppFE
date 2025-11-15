import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";

class EstadoBase extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.ListDeCuentas = [];
  }

  connectedCallback() {
    this.render();
    this.RegistroAccess = new RegistroAccess();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/EstadoResultados/EstadoResultados.css" />
    `;

    const plantilla = html`
      ${link}
      <style>
        h1,
h2,
th,
td {
    color: var(--color--oscuro);
    text-align: left;
    margin: 0;
    padding: 0;
}

h1,
h2 {
    text-align: center;
}


.pdf-container {
    width: 100%;
    text-align: center;
}

.estado-cuerpo {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.tabla-estado {
    border-collapse: collapse;
    width: 80%;
    font-family: sans-serif;
}

.tabla-estado th,
.tabla-estado td {
    padding: 6px 10px;
    border: none;
    /* sin bordes */
}

.tabla-estado th {
    text-align: left;
    font-weight: bold;
    border-bottom: 1px solid var(--color--oscuro);
    /* solo línea separadora del header */
}


tr.negrita td {
    font-weight: bold;
}

tbody tr:not(:last-child) td {
    border-bottom: none;
    /* sin líneas entre filas */
}
      </style>
      <div class="pdf-container">
        <h1>Estado de Resultados al 31 de diciembre de ${this.anioPrincipal}</h1>
        <h2>Alutech S.A. de S.V.</h2>
        <div class="estado-cuerpo">
          ${this.renderCuerpo()}
        </div>
      </div>
    `;

    render(plantilla, this._root);
  }


  async setCuentasDeEstadoDeResultadoPorPeriodo(anio) {
    try {
      const response = await this.RegistroAccess.getDataCuentasDeEstadoDeResultados(anio);
      if (!response.ok) throw new Error("Error al obtener cuentas de estadoDeResultado");
      const data = await response.json();
      this.ListDeCuentas = data || [];
      this.render();
    } catch (error) {
      this.noticadorHandle(error, "danger")
      this.ListDeCuentas = []
    }
  }

  noticadorHandle(mensaje, status) {
    this.dispatchEvent(new CustomEvent("notificacion", {
      composed: true,
      bubbles: true,
      detail: { element: "botonInicio", mensaje, body: { status } }
    }));
  }

  firmas() {
    return html`
        <div class="firmas-container">

            <div class="firma">
                <div class="linea"><p>f. ________________________________</p></div>
                <div class="nombre"><p>Contador</p></div>
            </p></div>

            <div class="firma">
                <div class="linea"><p>f. ________________________________</p></div>
                <div class="nombre"><p>Auditor</p></div>
            </p></div>

            <div class="firma">
                <div class="linea"><p>f. ________________________________</p></div>
                <div class="nombre"><p>Representante Legal</p></p></div>
            </p></div>

        </p></div>
        
    `;
  }
}

export default EstadoBase
