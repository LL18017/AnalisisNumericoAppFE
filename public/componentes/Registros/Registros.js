import { html, render } from "../../js/terceros/lit-html.js";
import CuentaAccess from "../../control/CuentaAccess.js";
import RegistroAccess from "../../control/RegistrosAccess.js";
import TipoSaldoAccess from "../../control/TipoSaldoAccess.js";

class Registros extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: "open" });
        this._nombreCuentaSelecionada = "";
        this._idCuentaSelecionada = null;
        this._anio = new Date().getFullYear(); // Por defecto año actual
        this._saldo = "";
        this._idRegistro = null;

        this.CuentaAccess = new CuentaAccess();
        this.TipoSaldoAccess = new TipoSaldoAccess();
        this.RegistroAccess = new RegistroAccess();

        this.cuentas = [];
        this.tipoSaldos = [];
        this.cuentasFiltradas = [];
    }

    connectedCallback() {
        this.getDataCuentas();
        document.addEventListener("click", this.handleClickOutside);
    }

    disconnectedCallback() {
        document.removeEventListener("click", this.handleClickOutside);
    }

    handleClickOutside = (e) => {
        const container = this._root.querySelector(".nombre-cuenta-container");
        if (container && !container.contains(e.composedPath()[0])) {
            this.cuentasFiltradas = [];
            this.render();
        }
    };

    filtrarCuentas(valor) {
        this._nombreCuentaSelecionada = valor;
        if (valor.trim() === "") {
            this.cuentasFiltradas = [];
        } else {
            const texto = valor.toLowerCase();
            this.cuentasFiltradas = this.cuentas.filter(c =>
                c.nombre.toLowerCase().includes(texto)
            );

            if (this.cuentasFiltradas.length === 0) {
                this.cuentasFiltradas = [{ nombre: "❌ No existe cuenta", _noExiste: true }];
            }
        }
        this.render();
    }

    seleccionarCuenta(cuenta) {

        if (!cuenta._noExiste) {
            this._nombreCuentaSelecionada = cuenta.nombre;
            this._idCuentaSelecionada = cuenta.idcuenta;

        }
        this.cuentasFiltradas = [];
        this.render();
    }

    render() {
        const plantilla = html`
      <link rel="stylesheet" href="./componentes/Registros/Registro.css" />

      <div class="formulario-cuenta">
        <div class="nombre-cuenta-container">
          <label for="nombreCuenta">Nombre de la cuenta:</label>
          <input
            type="text"
            id="nombreCuenta"
            .value=${this._nombreCuentaSelecionada}
            autocomplete="off"
            placeholder="Ej: Caja general"
            @input=${e => this.filtrarCuentas(e.target.value)}
          >
          ${this.cuentasFiltradas.length > 0
                ? html`<ul>
                    ${this.cuentasFiltradas.map(
                    c => html`<li @click=${() => this.seleccionarCuenta(c)}>${c.codigo} - ${c.nombre}</li>`
                )}
                  </ul>`
                : ""}
        </div>

        <label for="anio">Año:</label>
        <input type="number" id="anio" placeholder="Ej: 2025"
               .value=${this._anio ?? ""}
               @input=${e => (this._anio = parseInt(e.target.value))}>

        <label for="saldo">Saldo:</label>
        <input type="number" id="saldo" step="0.01" placeholder="0.00"
               .value=${this._saldo}
               @input=${e => (this._saldo = parseFloat(e.target.value))}>

        <label for="tipo">Tipo de movimiento:</label>
        

        <button @click=${() => this.guardarRegistro()}>Guardar</button>
        <button @click=${() => this.buscarRegistro()}>Buscar</button>
        <button @click=${() => this.actualizarRegistro()}>Modificar</button>
        <button @click=${() => this.eliminarRegistro()}>Eliminar</button>
      </div>
    `;
        render(plantilla, this._root);
    }

    async getDataCuentas() {
        try {
            const response = await this.CuentaAccess.getData();
            const data = await response.json();
            this.cuentas = data;
            this.render();
        } catch (error) {
            console.error("Error al cargar cuentas:", error);
        }
    }

    async guardarRegistro() {

        if (!this._idCuentaSelecionada || !this._saldo) {
            this.noticadorHandle("❌ Debes completar todos los campos", "error");
            return;
        }


        const datos = {
            idcuenta: this._idCuentaSelecionada,
            anio: this._anio,
            saldo: this._saldo
        };

        const response = await this.RegistroAccess.createData(datos);

        if (response.ok) {
            this.noticadorHandle("Registro guardado correctamente", "success");
            this.limpiarFormulario();
            this.render();
        } else {

            try {
                const errorData = await response.json();
                const mensaje = errorData.error || errorData.message || "❌ Error al guardar el registro.";
                this.noticadorHandle(mensaje, "danger");
            } catch (err) {
                this.noticadorHandle("Error inesperado al procesar la respuesta del servidor.", "danger");
            }
        }

    }

    async buscarRegistro() {


        if (!this._idCuentaSelecionada || !this._anio) {
            this.noticadorHandle("Debes seleccionar cuenta y año", "danger");
            return;
        }

        try {
            const response = await this.RegistroAccess.getDataByNombreAndAnio(
                this._idCuentaSelecionada,
                this._anio
            );

            if (!response.ok) {
                const errorData = await response.json();
                const mensaje = errorData.error || errorData.message || "Error al guardar el registro.";
                this.limpiarFormulario();
                this.noticadorHandle(mensaje, "danger");
                return;
            }

            const data = await response.json();

            this._anio = data[0].anio;
            this._saldo = data[0].saldo;
            this._idRegistro = data[0].idregistro
            this.noticadorHandle("Registro encontrado", "success");
            this.render();
        } catch (error) {
            this.noticadorHandle(error, "danger");
        }
    }

    async actualizarRegistro() {
        if (!this._idRegistro) {
            this.noticadorHandle("Primero busca un registro", "danger");
            return;
        }

        const datos = {
            idcuenta: this._idCuentaSelecionada,
            idregistro: this._idRegistro,
            anio: this._anio,
            saldo: this._saldo
        };

        console.log("ID cuenta seleccionada:", this._idCuentaSelecionada);
        console.log("Datos a enviar:", datos);


        try {
            const response = await this.RegistroAccess.updateData(datos, this._idRegistro);
            if (response.ok) {
                this.noticadorHandle("Registro modificado correctamente", "success");
                this.limpiarFormulario();
                this.render();
            } else {
                const errorData = await response.json();
                const mensaje = errorData.error || errorData.message || "Error al guardar el registro.";

                this.noticadorHandle(mensaje, "danger");
                return;
            }
        } catch (error) {
            console.error(error);
            this.noticadorHandle(error, "danger");
        }
    }

    async eliminarRegistro() {
        if (!this._idRegistro) {
            this.noticadorHandle("Primero busca un registro", "danger");
            return;
        }

        try {
            const response = await this.RegistroAccess.deleteData(this._idRegistro);
            if (response.ok) {
                this.noticadorHandle("Registro eliminado correctamente", "success");
                this.limpiarFormulario();
                this.render();
            } else {
                const errorData = await response.json();
                const mensaje = errorData.error || errorData.message || "Error al guardar el registro.";

                this.noticadorHandle(mensaje, "danger");
                return;
            }
        } catch (error) {
            this.noticadorHandle(error, "danger");
        }
    }

    limpiarFormulario() {

        this._nombreCuentaSelecionada = "";
        this._idCuentaSelecionada = null;
        // this._anio = new Date().getFullYear();
        this._anio = "";
        this._saldo = "";
        this._idRegistro = null;
        this.cuentasFiltradas = [];
        this.render();
    }

    noticadorHandle(mensaje, status) {
        this.dispatchEvent(new CustomEvent("notificacion", {
            composed: true,
            bubbles: true,
            detail: { mensaje, body: { status } }
        }));
    }
}

customElements.define("registros-cuenta", Registros);
