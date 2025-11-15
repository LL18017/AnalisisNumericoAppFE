import { html, render } from "../../js/terceros/lit-html.js";
import RegistroAccess from "../../control/RegistrosAccess.js";
class RatiosFinancieros extends HTMLElement {
  constructor() {
    super();
    this.RegistroAccess = new RegistroAccess()
    this._root = this.attachShadow({ mode: "open" });
    this.data = null;
    this.anio = 0;
  }

  async setCuentasRatios(anio) {
    try {
      const response = await this.RegistroAccess.getDataCuentasDeRatios(anio);
      if (!response.ok) throw new Error("Error al obtener cuentas de ratios");
      const datos = await response.json();
      this.data = datos || [];
      this.render();
    } catch (error) {
      console.error("Error cargando cuentas por periodo:", error);
    }
  }

  connectedCallback() {
    this.render();
  }


  verDetalle(tipo) {
    const detalle = document.createElement("detalle-informacion");
    detalle.setDatos(tipo, this.data[tipo]);
    document.body.appendChild(detalle);
    detalle.mostrar();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./main.css" />
      <link rel="stylesheet" href="./componentes/indicadoresFinanciros/ratios.css" />
    `;

    if (!this.data) {
      render(
        html`${link}
          <p style="text-align:center;">No hay datos disponibles.</p>`,
        this._root
      );
      return;
    }


    ["cuentas", "Año"].forEach((k) => delete this.data[k]);
    const formato = new Intl.NumberFormat("es-SV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    });
    const plantilla = html`
    <h3>Ratios Financieros - Año ${this.anio}</h3>
  <table>
    ${Object.keys(this.data).map(
      (categoria) => html`
      ${link}
        <thead>
          <tr>
            <th colspan="2">${categoria}</th>
          </tr>
          <tr>
            <th>Ratio</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(this.data[categoria]).map(
        ([nombre, valor]) => html`
              <tr>
                <td>${nombre}</td>
                <td>${formato.format(valor)}</td>
              </tr>
            `
      )}
        </tbody>
      `
    )}
  </table>
`


    render(plantilla, this._root);
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
  getCss() {
    return `:host {
     display: grid;
    place-items: center;
    padding: 1.5rem;
    font-family: Arial, sans-serif;
}

h3,
p {
    color: #0a0849;
    text-align: center;
    margin-bottom: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    background:  #fffcff;
    border-radius: 12px;
    overflow: hidden;
}

th,
td {
    border: 1px solid #ddd;
    padding: 4px;
    text-align: left;
    font-size: 15px;
    color:  #020202;;
    heigh:15px;
}

th {
    background: #273f6e;
    color:  #fffcff;
    text-align: center;
    font-weight: bold;
    font-size: 15px;
    }
    
    tr:nth-child(even) {
      background-color: #f7f9fc;
      }
      
      tr:hover {
        background-color: rgba(12, 34, 156, 0.08);
        }
        
        button {
          background: #0c229c;;
          color:  #fffcff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.3s ease-in-out;
          }
          
          button:hover {
            background: #0a0849;
            transform: scale(1.05);
            }
            tr{
              font-size: 15px;
              }    
`
  }
}

customElements.define("ratios-financieros", RatiosFinancieros);
