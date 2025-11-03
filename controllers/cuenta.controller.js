import { pool } from "../db/connection.js";

// 🟢 Obtener todas las cuentas
export const getCuentas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cuenta ORDER BY codigo");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔵 Buscar cuentas por nombre, código o id
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
    res.status(500).json({ error: error.message });
  }
};

// 🟡 Crear cuenta
export const createCuenta = async (req, res) => {
  try {
    const { codigo, nombre } = req.body;
    const result = await pool.query(
      "INSERT INTO cuenta (codigo, nombre) VALUES ($1, $2) RETURNING *",
      [codigo, nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟠 Actualizar cuenta
export const updateCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre } = req.body;
    const result = await pool.query(
      "UPDATE cuenta SET codigo = $1, nombre = $2 WHERE idCuenta = $3 RETURNING *",
      [codigo, nombre, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 Eliminar cuenta
export const deleteCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM cuenta WHERE idCuenta = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Cuenta no encontrada" });
    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
