// import dataAccess from "../control/dataAccess.js";
// import Interactividad from "./interactividad.js";

class AppController extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.catalogoCuentas = document.getElementById("catalogo-cuentas");
    this.estadosFinancieros = document.getElementById("estados-financieros");
    this.ratiosFinancieros = document.getElementById("ratios-financieros");
    this.registros = document.getElementById("registros-cuenta");
    this.notificador = document.getElementById("notificador");
    this.bienvenida = document.getElementById("bienvenida");

    this.listaComponentes = [
      this.catalogoCuentas,
      this.estadosFinancieros,
      this.ratiosFinancieros,
      this.registros,
      this.bienvenida

    ];

    this.iniciarEventos();


  }

  iniciarEventos() {

    this.catalogoCuentas.style.display = "none";
    this.estadosFinancieros.style.display = "none";
    this.ratiosFinancieros.style.display = "none";
    this.registros.style.display = "none";

    document.addEventListener("inicioClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.bienvenida
      ]);
    });

    document.addEventListener("CatalogoDeCuentasClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.catalogoCuentas
      ]);
    })

    document.addEventListener("indicadoresFinancierosClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.ratiosFinancieros
      ]);
    })

    document.addEventListener("EstadosFinancierosCLick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.estadosFinancieros
      ]);
    })
    document.addEventListener("registroClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.registros
      ]);
    })
    document.addEventListener("notificacion", (e) => {
      this.notificador.mostrar(e.detail.mensaje, e.detail.body.status)
    })


  }

  desaparecerElementos(listaElementos, listaExcepciones) {
    listaElementos.forEach((el) => {
      if (!listaExcepciones.includes(el)) {
        el.style.display = "none";
      }
    });
    listaExcepciones.forEach((el) => {
      console.log(el);

      el.style.display = "block";
    });
  }


}

customElements.define("app-controller", AppController);
