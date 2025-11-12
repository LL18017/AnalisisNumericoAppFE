import { pool } from "../db/connection.js";

const cuentasProtegidas = [
  // --- cuentasEstadoResultados ---
  "Ingresos por ventas",
  "Costo de lo vendido",
  "Gastos administrativos",
  "Gastos de venta",
  "Gastos de Personal",
  "Gastos de Depreciación y Amortización",
  "Perdidas por deterioro de valor de cuentas por cobrar",
  "Otros ingresos y gastos netos",
  "Ingresos Financieros",
  "Gastos Financieros",
  "Otros Ingresos (Gastos)",
  "Ingresos (gastos) financieros, netos",
  "Provision para el impuesto sobre la renta",
  "Provision para la aportacion solidaria",
  "Efecto de conversion de moneda de anio",

  // --- cuentas que se crean dinámicamente ---
  "Utilidad Bruta",
  "Utilidad Operativa",
  "Utilidad antes de impuestos",
  "Utilidad Neta",
  "Resultado Integral Total",

  // --- cuentas adicionales mencionadas en cálculos ---
  "Ajuste por tipo de cambio",
  "Cuentas por cobrar a clientes",
  "Cuentas por cobrar comerciales - neto",
  "Clientes",
  "Otras cuentas por cobrar",
  "Inventarios",
  "Existencias",
  "Mercaderías",
  "Ventas netas",
  "Costo de ventas",
  "Acreedores comerciales y otras cuentas por pagar",
  "Cuentas por pagar comerciales",
  "Cuentas por pagar a partes relacionadas",
  "Gastos financieros",
  "Ingresos financieros",
  "Arrendamientos pagados",
  "Prestamos bancarios pagados",
  "Documentos por pagar pagados",
  "Obligaciones por derechos titularizados pagados",
  "Efecto de conversión de moneda del año",

  // --- categorías de balance ---
  "Activo Corriente",
  "Activo No Corriente",
  "Total Activo",
  "Pasivo Corriente",
  "Pasivo No Corriente",
  "Total Pasivo",
  "Patrimonio",

  // --- otros usados en ratios ---
  "Promedio de Ventas al Crédito",
  "Promedio de Compras al Crédito",

  // --- estructura interna (objeto principal) ---
  "Principal",
  "Préstamos Bancarios Pagados",
  "Documentos Pagados",
  "Obligaciones Titularizadas Pagadas",
  "Principal Total",

  // --- agregadas dinámicamente ---
  "Gastos e Ingresos Financieros"
];


//  Obtener todas las cuentas
export const getCuentas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cuenta ORDER BY codigo");
    res.json(result.rows);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

//  Buscar cuentas por nombre, código o id
export const buscarCuenta = async (req, res) => {
  try {
    const { filtro } = req.query;
    const result = await pool.query(
      `SELECT * FROM cuenta
       WHERE CAST(idCuenta AS TEXT) ILIKE $1
       OR codigo ILIKE $1
       OR nombre ILIKE $1`,
      [`%${filtro}%`]
    );
    res.json(result.rows);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

//  Crear cuenta
export const createCuenta = async (req, res) => {
  try {
    const { codigo, nombre } = req.body;
    const result = await pool.query(
      "INSERT INTO cuenta (codigo, nombre) VALUES ($1, $2) RETURNING *",
      [codigo, nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
    } else if (error.code === "23505") {
      res.status(400).json({ error: "Ya existe una cuenta con el mismo nombre o código." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Actualizar cuenta

export const updateCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre } = req.body;

    // Obtener la cuenta actual
    const { rows } = await pool.query("SELECT nombre FROM cuenta WHERE idCuenta = $1", [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });

    const nombreActual = rows[0].nombre;

    // Verificar si pertenece al listado protegido
    const esProtegida = cuentasProtegidas.some(
      c => c.toLowerCase() === nombreActual.toLowerCase()
    );

    // Si es protegida y se intenta cambiar el nombre → denegar
    if (esProtegida && nombre.toLowerCase() !== nombreActual.toLowerCase()) {
      return res.status(403).json({
        error: `No está permitido modificar el nombre de la cuenta "${nombreActual}".`
      });
    }

    // Actualización normal (si pasa las validaciones)
    const result = await pool.query(
      "UPDATE cuenta SET codigo = $1, nombre = $2 WHERE idCuenta = $3 RETURNING *",
      [codigo, nombre, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
    } else if (error.code === "23505") {
      res.status(400).json({ error: "Ya existe otra cuenta con el mismo nombre o código." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

//  Eliminar cuenta
export const deleteCuenta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la cuenta existe
    const { rows } = await pool.query("SELECT nombre FROM cuenta WHERE idCuenta = $1", [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });

    const nombreCuenta = rows[0].nombre;

    // Verificar si la cuenta está protegida
    const esProtegida = cuentasProtegidas.some(
      c => c.toLowerCase() === nombreCuenta.toLowerCase()
    );

    if (esProtegida) {
      return res.status(403).json({
        error: `No está permitido eliminar la cuenta protegida "${nombreCuenta}".`
      });
    }

    // Eliminar solo si no es protegida
    const result = await pool.query("DELETE FROM cuenta WHERE idCuenta = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};
