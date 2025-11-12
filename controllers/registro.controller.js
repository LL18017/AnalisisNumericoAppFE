import { pool } from "../db/connection.js";




const cuentasEstadoResultados = [
    "Ingresos por ventas", "Costo de lo vendido",
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
    "Provision para la aportacion solidaria", "Efecto de conversion de moneda de anio"
]
//  Obtener todos los registros
export const getRegistros = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT r.*, c.nombre AS nombre_cuenta, c.codigo
      FROM registro r
      INNER JOIN cuenta c ON c.idCuenta = r.idCuenta
      ORDER BY r.idRegistro DESC
    `);
        res.json(result.rows);
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "❌ No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

//  Buscar registros por id y año
export const buscarRegistro = async (req, res) => {
    try {
        const { idcuenta, anio } = req.query;

        if (!idcuenta || !anio) {
            return res.status(400).json({ error: "Debe especificar idcuenta y año." });
        }

        const result = await pool.query(
            `
      SELECT 
        r.*, 
        c.nombre AS nombre_cuenta, 
        c.codigo
      FROM registro r
      INNER JOIN cuenta c ON c.idCuenta = r.idCuenta
      WHERE c.idCuenta = $1
        AND r.anio = $2
      ORDER BY r.idRegistro ASC
      `,
            [idcuenta, anio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: `No se encontraron registros para la cuenta solicitada en el año ${anio}.`
            });
        }

        res.json(result.rows);
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({
                error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido."
            });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};


//  Buscar registros por nombre y año
export const buscarRegistroPorNombreAnio = async (req, res) => {
    try {
        const { nombre, anio } = req.query;

        if (!nombre || !anio) {
            return res.status(400).json({ error: "Debe especificar nombre y año" });
        }

        const result = await pool.query(
            `
      SELECT 
        r.*, 
        c.nombre AS nombre_cuenta, 
        c.codigo
      FROM registro r
      INNER JOIN cuenta c ON c.idCuenta = r.idCuenta
      WHERE c.nombre =$1
        AND r.anio = $2
      ORDER BY r.idRegistro ASC
      `,
            [nombre, anio]
        );

        res.json(result.rows);
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "❌ No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};


// Crear registro
export const createRegistro = async (req, res) => {
    try {
        const { idcuenta, anio, saldo } = req.body;

        const result = await pool.query(
            "INSERT INTO registro (idcuenta, anio, saldo) VALUES ($1, $2, $3) RETURNING *",
            [idcuenta, anio, saldo]
        );



        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else if (error.code === "23505") {
            res.status(400).json({ error: "Ya existe un registro para el año especificado." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};


//  Actualizar registro
export const updateRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const { idcuenta, anio, saldo } = req.body;
        const result = await pool.query(
            "UPDATE registro SET idcuenta = $1, anio = $2, saldo = $3 WHERE idregistro = $4 RETURNING *",
            [idcuenta, anio, saldo, id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ message: "Registro no encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: " No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

//  Eliminar registro
export const deleteRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM registro WHERE idRegistro = $1", [id]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: "Registro no encontrado" });
        res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "❌ No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};






