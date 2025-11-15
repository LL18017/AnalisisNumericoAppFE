import { html, render } from "../../js/terceros/lit-html.js";
import CuentaAccess from "../../control/CuentaAccess.js";

class Catalogo extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.CuentaAccess = new CuentaAccess();
    this.cuentas = [];
    this.cuentasFiltradas = [];
    this._nombreCuentaSelecionada = "";
    this._idCuentaSelecionada = "0";
  }

  connectedCallback() {
    this.render();
    this.getData()
      .then(() => this.render())
      .catch(err => {
        console.error("Error al cargar las cuentas:", err);
        this._root.innerHTML = `<p>Error al cargar las cuentas</p>`;
      });
  }

  async getData(q = "") {
    const response = await this.CuentaAccess.getData(q);
    if (response.status != 200) {
      const error = await response.json();
      this.noticadorHandle(error.error, "danger")
    } else {
      const data = await response.json();
      this.cuentas = data;
      this.cuentasFiltradas = structuredClone(data);
    }
  }

  async PostData() {
    const codigo = this._root.querySelector("#modal-codigo").value;
    const nombre = this._root.querySelector("#modal-nombre").value;
    const registro = { nombre, codigo };

    if (!codigo || !nombre) {
      this.noticadorHandle(`Error al crear la cuenta el nombre o codigo no deben ser nulos`, "danger");
      return;
    }

    try {
      const response = await this.CuentaAccess.createData(registro);
      if (response.ok) {
        await this.getData();
        this.limpiar();
        this.render();
        this.setupModal();
        this.noticadorHandle(`Cuenta "${nombre}" creada correctamente`, "success");
        this._root.querySelector("#modal").style.display = "none";
      } else {
        const errorText = await response.json();
        this.noticadorHandle(`Error al crear la cuenta: ${errorText.error}`, "danger");
      }
    } catch (error) {
      this.noticadorHandle("No se pudo conectar al servidor", "danger");
    }
  }

  async updateData() {
    const id = this._root.querySelector("#modal-id").value;
    const codigo = this._root.querySelector("#modal-codigo").value;
    const nombre = this._root.querySelector("#modal-nombre").value;
    const registro = { id, nombre, codigo };

    if (!codigo || !nombre) {
      this.noticadorHandle(`Error al crear la cuenta el nombre o codigo no deben ser nulos`, "danger");
      return;
    }

    try {
      const response = await this.CuentaAccess.updateData(registro, id);
      if (response.ok) {
        await this.getData();
        this.limpiar();
        this.render();
        this.noticadorHandle(`Cuenta "${nombre}" modificada correctamente`, "success");
        this._root.querySelector("#modal").style.display = "none";
      } else {
        const errorText = await response.json();
        this.noticadorHandle(`Error al modificar la cuenta: ${errorText.error}`, "danger");
      }
    } catch (error) {
      console.error("Error en updateData:", error);
      this.noticadorHandle("No se pudo conectar al servidor", "danger");
    }
  }

  async deleteData() {
    const id = this._root.querySelector("#modal-id").value;
    const nombre = this._root.querySelector("#modal-nombre").value;

    try {
      const response = await this.CuentaAccess.deleteData(id);
      if (response.ok) {
        await this.getData();
        this.limpiar();
        this.render();
        this.noticadorHandle(`Cuenta "${nombre}" eliminada correctamente`, "success");
        this._root.querySelector("#modal").style.display = "none";
      } else {
        const errorText = await response.json();
        this.noticadorHandle(`Error al eliminar la cuenta: ${errorText.error}`, "danger");
      }
    } catch (error) {
      console.error("Error en deleteData:", error);
      this.noticadorHandle("No se pudo conectar al servidor", "danger");
    }
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./componentes/catalogo/catalogo.css" />
      <link rel="stylesheet" href="./main.css" />
    `;

    const plantilla = html`
      ${link}
      <notificacion-toast id="notificador"></notificacion-toast>
      <div class="catalogoContainer">
        <h1>Catálogo de cuentas</h1>
        <input id="buscar" type="text"
         placeholder="Ingrese nombre, código o ID">
        <div class="cuentasContainer">
          <button class="btn" id="crear">Crear cuenta</button>
          <table border="1" class="tabla-cuentas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div id="modal" class="modal">
        <div class="modal-content">
          <span id="cerrarModal" class="cerrar">&times;</span>
          <h2>Modificar Cuenta</h2>
          <div class="inputsContainer">
            <label>ID:</label>
            <input autocomplete="off" id="modal-id" type="text" disabled>
            <label>Código:</label>
            <input autocomplete="off" id="modal-codigo" placeholder="Código de la cuenta" type="text">
            <label>Nombre:</label>
            <input autocomplete="off" id="modal-nombre" placeholder="Nombre de la cuenta" type="text">
          </div>
          <div class="btnContainer">
            <button class="btn" @click=${() => this.PostData()} id="guardar">Guardar</button>
            <button class="btn" @click=${() => this.updateData()} id="modificar">Modificar</button>
            <button class="btn" @click=${() => this.deleteData()} id="eliminar">Eliminar</button>
          </div>
        </div>
      </div>
    `;

    render(plantilla, this._root);
    this.renderTabla(this.cuentasFiltradas);
    this.setupFiltrado();
    this.setupBtncrear();
  }

  renderTabla(cuentas) {
    const tbody = this._root.querySelector("tbody");
    tbody.innerHTML = cuentas.map(c => `
      <tr data-idcuenta="${c.idcuenta}">
        <td>${c.idcuenta}</td>
        <td>${c.codigo}</td>
        <td>${c.nombre}</td>
      </tr>
    `).join('');

    this.setupModal();
  }

  setupFiltrado() {
    const input = this._root.querySelector("#buscar");

    input.addEventListener("input", (e) => {
      const texto = e.target.value.toLowerCase();

      // Filtra en tiempo real (sin afectar el arreglo original)
      this.cuentasFiltradas = this.cuentas.filter(c =>
        c.nombre.toLowerCase().includes(texto) ||
        c.codigo.toLowerCase().includes(texto) ||
        String(c.idcuenta).includes(texto)
      );

      this.renderTabla(this.cuentasFiltradas);
    });
  }


  setupModal() {
    const modal = this._root.querySelector("#modal");
    const cerrarModal = this._root.querySelector("#cerrarModal");
    const filas = this._root.querySelectorAll("tbody tr");

    filas.forEach((fila) => {
      fila.addEventListener("click", () => {
        const id = fila.dataset.idcuenta;
        const cuenta = this.cuentas.find(c => String(c.idcuenta) === String(id));

        if (!cuenta) return;

        modal.style.display = "flex";

        // Activar botones correctos al seleccionar una cuenta
        this._root.querySelector("#guardar").style.display = "none";
        this._root.querySelector("#eliminar").style.display = "block";
        this._root.querySelector("#modificar").style.display = "block";

        // Cargar datos
        this._root.querySelector("#modal-id").value = cuenta.idcuenta;
        this._root.querySelector("#modal-codigo").value = cuenta.codigo;
        this._root.querySelector("#modal-nombre").value = cuenta.nombre;
      });
    });


    cerrarModal.addEventListener("click", () => {
      modal.style.display = "none";
      this._root.querySelector("#guardar").style.display = "none";
      this._root.querySelector("#eliminar").style.display = "block";
      this._root.querySelector("#modificar").style.display = "block";
    });
  }

  setupBtncrear() {
    const btncrear = this._root.querySelector("#crear");
    const modificar = this._root.querySelector("#modificar");
    const eliminar = this._root.querySelector("#eliminar");
    const guardar = this._root.querySelector("#guardar");
    const modal = this._root.querySelector("#modal");

    btncrear.addEventListener("click", () => {
      guardar.style.display = "block";
      eliminar.style.display = "none";
      modificar.style.display = "none";
      modal.style.display = "flex";
      this._root.querySelector("#modal-id").value = "";
      this._root.querySelector("#modal-codigo").value = "";
      this._root.querySelector("#modal-nombre").value = "";
    });
  }

  limpiar() {
    const input = this._root.querySelector("#buscar");
    input.value = "";
  }

  noticadorHandle(mensaje, status) {
    this.dispatchEvent(new CustomEvent("notificacion", {
      composed: true,
      bubbles: true,
      detail: { element: "botonInicio", mensaje, body: { status } }
    }));
  }
}

customElements.define("catalogo-cuentas", Catalogo);
