import { pool } from "../db/connection.js";

// 🟢 Obtener todos los registros
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
        res.status(500).json({ error: error.message });
    }
};
export const getRegistrosBalance = async (req, res) => {
    try {
        const { anio } = req.query; // Recibe el año por query: /api/registros/balance?anio=2025

        // Validación simple
        if (!anio) {
            return res.status(400).json({ error: "Debe especificar el año (anio=YYYY)" });
        }

        const result = await pool.query(`
            SELECT 
                r.idregistro,
                r.idcuenta,
                r.anio,
                r.saldo,
                c.codigo,
                c.nombre AS nombre_cuenta,
                c.codigo AS codigo_cuenta
            FROM public.registro r
            JOIN public.cuenta c ON r.idcuenta = c.idcuenta
            WHERE r.anio = $1
            AND (
                c.codigo LIKE '1%' OR
                c.codigo LIKE '2%' OR
                c.codigo LIKE '3%'
            )
            ORDER BY r.idregistro ASC;

        `, [anio]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener registros por año:", error);
        res.status(500).json({ error: error.message });
    }
};


// 🔵 Buscar registros por nombre y año
export const buscarRegistro = async (req, res) => {
    try {
        const { idcuenta, anio } = req.query;

        if (!idcuenta || !anio) {
            return res.status(400).json({ error: "Debe especificar id y año" });
        }

        const result = await pool.query(
            `
      SELECT 
        r.*, 
        c.nombre AS nombre_cuenta, 
        c.codigo
      FROM registro r
      INNER JOIN cuenta c ON c.idCuenta = r.idCuenta
      WHERE c.idcuenta =$1
        AND r.anio = $2
      ORDER BY r.idRegistro ASC
      `,
            [idcuenta, anio]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 🟡 Crear registro
export const createRegistro = async (req, res) => {
    try {
        const { idcuenta, anio, saldo } = req.body;

        const result = await pool.query(
            "INSERT INTO registro (idcuenta, anio, saldo) VALUES ($1, $2, $3) RETURNING *",
            [idcuenta, anio, saldo]
        );

        // Actualiza los totales después de insertar
        await actualizarTotales(anio);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Función para actualizar los registros totales de activo, pasivo y patrimonio
const actualizarTotales = async (anio) => {
    const cuentasTotales = [
        { idCuenta: 66, codigo: '1.%' }, // Activo
        { idCuenta: 67, codigo: '2.%' }, // Pasivo
        { idCuenta: 68, codigo: '3.%' }  // Patrimonio
    ];

    for (const cuenta of cuentasTotales) {
        try {
            const saldoTotal = await obtenerSumaPorCodigo(cuenta.codigo, anio);

            await pool.query(
                `INSERT INTO registro (idcuenta, anio, saldo)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (idcuenta, anio)
                 DO UPDATE SET saldo = EXCLUDED.saldo`,
                [cuenta.idCuenta, anio, saldoTotal]
            );
        } catch (error) {
            console.error(`Error al actualizar registro total para cuenta ${cuenta.idCuenta}:`, error);
        }
    }
};

// Función genérica para obtener la suma de registros por código y año
export const obtenerSumaPorCodigoEndpoint = async (req, res) => {
    try {
        const { codigo, anio } = req.query;

        if (!codigo || !anio) {
            return res.status(400).json({ error: "Debe especificar 'codigo' y 'anio'" });
        }

        const result = await pool.query(
            `SELECT SUM(r.saldo) AS total_saldo
             FROM registro r
             INNER JOIN cuenta c ON r.idcuenta = c.idcuenta
             WHERE c.codigo LIKE $1 AND r.anio = $2`,
            [`${codigo}%`, anio]
        );

        res.json({ codigoInicio: codigo, anio, total_saldo: result.rows[0].total_saldo || 0 });
    } catch (error) {
        console.error("Error al obtener suma de registros:", error);
        res.status(500).json({ error: error.message });
    }
};




// 🟠 Actualizar registro
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
        res.status(500).json({ error: error.message });
    }
};

// 🔴 Eliminar registro
export const deleteRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM registro WHERE idRegistro = $1", [id]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: "Registro no encontrado" });
        res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
