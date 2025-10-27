class dataAccess {
  PATH_URL = "";
  constructor(path) {
    this.PATH_URL = path; // Definir PATH_URL con un valor por defecto
    this.URL = `${window.URLBASE_CON_HOST_PUERTO === undefined ? "http://localhost:8080" : window.URLBASE_CON_HOST_PUERTO}/${this.PATH_URL}`;
  }

  /**
   *
   * @param {id} id id de la entidad a consulta este valor es opcional
   * @param first first primer valor rrequerido este valro es opcional
   * @param {*} max maximo valores requerido este valor es opcional
   * @returns
   */
  getData(id, first, max) {
    let request = "";

    if (id !== undefined) {
      request += `/${id}`;
    }

    const queryParams = new URLSearchParams();
    if (first !== undefined && max !== undefined) {
      queryParams.append("first", first);
      queryParams.append("max", max);
    }

    if (queryParams.toString()) {
      request += `?${queryParams.toString()}`;
    }

    request = this.URL + request;
    return fetch(request, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }



  createData(registro, id) {
    let uri = "";
    if (id) {
      uri += `/${id}`;
    }
    return fetch(this.URL + uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registro),
    });
  }
  updateData(registro, id) {
    let request = "";
    if (id !== undefined) {
      request += `/${id}`;
    }
    request = this.URL + request;
    return fetch(request, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registro),
    });
  }
  deleteData(id) {
    let request = this.URL;

    if (id !== undefined && id !== "") {
      request += `/${id}`;
    }
    return fetch(request, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default dataAccess;
