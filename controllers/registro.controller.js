import { pool } from "../db/connection.js";



const cuentasEstadoResultados = ["ingresos por ventas", "costo de lo vendido", "gastos administrativos",
    "gastos de venta", "otros ingresos y gastos netos", "ingresos (gastos) financieros, netos",
    "provision para el impuesto sobre la renta",
    "provision para la aportacion solidaria", "efecto de conversion de moneda de anio"
]
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

// 🔵 Buscar registros por id y año
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

// 🔵 Buscar registros por nombre y año
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
        res.status(500).json({ error: error.message });
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


//  Función auxiliar para ejecutar consultas SQL
const ejecutarConsulta = async (query, params) => {
    const { rows } = await pool.query(query, params);
    return rows;
};

//  Función genérica para buscar registros por condiciones
const obtenerRegistros = async (condicion, valores) => {
    const query = `
    SELECT 
      r.anio, 
      r.saldo, 
      c.nombre AS nombre_cuenta, 
      c.codigo
    FROM registro r
    INNER JOIN cuenta c ON c.idCuenta = r.idCuenta
    ${condicion}
    ORDER BY r.idRegistro ASC;
  `;
    return ejecutarConsulta(query, valores);
};

// Calcula una cuenta derivada (como Utilidad Bruta, Neta, etc.)
//  Inserta después de una cuenta específica
const insertarDespuesDe = (resultados, nombrePrincipal, nombreSecundario, nuevo) => {
    let index = resultados.findIndex(c => c.nombre_cuenta === nombrePrincipal);
    if (index !== -1) {
        resultados.splice(index + 1, 0, nuevo);
    } else if (nombreSecundario) {
        index = resultados.findIndex(c => c.nombre_cuenta === nombreSecundario);
        if (index !== -1) resultados.splice(index + 1, 0, nuevo);
    }
};

// Crea un nuevo registro (función genérica que sirve para saldo o comparativo)
const crearRegistro = (resultados, cuentas, nombreNuevo, campos = ["saldo"]) => {
    const cuentasFiltradas = resultados.filter(c =>
        cuentas.includes(c.nombre_cuenta)
    );

    const nuevo = { nombre_cuenta: nombreNuevo };

    for (const campo of campos) {
        const total = cuentasFiltradas.reduce((acc, c) => acc + (Number(c[campo]) || 0), 0);
        nuevo[campo] = total;
    }

    return nuevo;
};

// 🔧 Inserta todas las utilidades estándar
const insertarUtilidades = (resultados, campos = ["saldo"]) => {
    const agregar = (despues, segundaOpcion, cuentas, nombreNuevo) => {
        const nuevo = crearRegistro(resultados, cuentas, nombreNuevo, campos);
        insertarDespuesDe(resultados, despues, segundaOpcion, nuevo);
    };

    agregar("costo de lo vendido", null,
        ["ingresos por ventas", "costo de lo vendido"],
        "Utilidad Bruta"
    );

    agregar("otros ingresos y gastos netos", null,
        ["Utilidad Bruta", "gastos administrativos", "gastos de venta", "otros ingresos y gastos netos"],
        "Utilidad Operativa"
    );

    agregar("ingresos (gastos) financieros, netos", null,
        ["Utilidad Operativa", "ingresos (gastos) financieros, netos"],
        "Utilidad antes de impuestos"
    );

    agregar("provision para la aportacion solidaria", "provision para el impuesto sobre la renta",
        ["Utilidad antes de impuestos", "provision para el impuesto sobre la renta", "provision para la aportacion solidaria"],
        "Utilidad Neta"
    );

    agregar("efecto de conversion de moneda de anio", null,
        ["Utilidad Neta", "efecto de conversion de moneda de anio"],
        "Resultado Integral Total"
    );
};



// 🟢 Obtener estado de resultados de un solo año
export const getRegistrosEstadoResultados = async (req, res) => {
    try {
        const { anio } = req.query;
        if (!anio) return res.status(400).json({ error: "Debe especificar el año (anio=YYYY)" });

        const resultados = [];

        for (const nombre of cuentasEstadoResultados) {
            const rows = await obtenerRegistros("WHERE LOWER(c.nombre) = LOWER($1) AND r.anio = $2", [nombre, anio]);
            if (rows.length > 0) resultados.push(rows[0]);
        }

        insertarUtilidades(resultados);
        res.json(resultados);
    } catch (error) {
        console.error("Error en estado de resultados:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔵 Obtener estado de resultados comparativo (2 años)
export const getRegistrosEstadoResultadosComparativo = async (req, res) => {
    try {
        const { anio1, anio2 } = req.query;
        if (!anio1 || !anio2)
            return res.status(400).json({ error: "Debe especificar ambos años (anio1 y anio2)" });

        const resultados = [];

        for (const nombre of cuentasEstadoResultados) {
            const rows = await obtenerRegistros(
                "WHERE LOWER(c.nombre) = LOWER($1) AND r.anio IN ($2, $3)",
                [nombre, anio1, anio2]
            );

            const registro = {
                nombre_cuenta: nombre,
                saldo_anio1: 0,
                saldo_anio2: 0,
            };

            for (const r of rows) {
                if (r.anio == anio1) registro.saldo_anio1 = r.saldo;
                if (r.anio == anio2) registro.saldo_anio2 = r.saldo;
            }

            resultados.push(registro);
        }

        insertarUtilidades(resultados, ["saldo_anio1", "saldo_anio2"]);
        res.json(resultados);
    } catch (error) {
        console.error("Error en estado de resultados comparativo:", error);
        res.status(500).json({ error: error.message });
    }
};


const crearRegistroParaEstadoResultado = (cuentas, nombresCuentasParaSumar, nombreNuevo) => {
    // Filtra las cuentas que están en la lista de nombres a sumar
    const cuentasFiltradas = cuentas.filter(c =>
        nombresCuentasParaSumar.includes(c.nombre_cuenta)
    );

    // Suma sus valores (asumiendo que el campo numérico es 'valor')
    const total = cuentasFiltradas.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0);

    // Crea un nuevo registro con el total
    const nuevoRegistro = {
        nombre_cuenta: nombreNuevo,
        saldo: total
    };

    return nuevoRegistro;
};


const indiceDeCuenta = (resultados, nombre) => {
    const i = resultados.findIndex(e => e.nombre_cuenta == nombre);
    if (i !== -1) {
        return i + 1;
    }
    return 0;

}

export const getRegistrosBalanceComparativo = async (req, res) => {
    try {
        const { anio1, anio2 } = req.query;
        // Ejemplo: /api/registros/balance-comparativo?anio1=2024&anio2=2025

        if (!anio1 || !anio2) {
            return res.status(400).json({ error: "Debe especificar ambos años (anio1 y anio2)" });
        }

        const query = `
      SELECT 
        c.idcuenta,
        c.codigo,
        c.nombre AS nombre_cuenta,
        COALESCE(r1.saldo::numeric, 0) AS saldo_anio1,
        COALESCE(r2.saldo::numeric, 0) AS saldo_anio2
      FROM cuenta c
      LEFT JOIN registro r1 ON r1.idcuenta = c.idcuenta AND r1.anio = $1
      LEFT JOIN registro r2 ON r2.idcuenta = c.idcuenta AND r2.anio = $2
      WHERE 
        (c.codigo LIKE '1%' OR c.codigo LIKE '2%' OR c.codigo LIKE '3%')
        AND (
          COALESCE(r1.saldo::numeric, 0) <> 0 
          OR COALESCE(r2.saldo::numeric, 0) <> 0
        )
      ORDER BY c.codigo ASC;
    `;

        const result = await pool.query(query, [anio1, anio2]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener balance comparativo:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getResumenCuentasParaRatio = async (req, res) => {
    try {
        const { anio } = req.query;
        if (!anio) {
            return res.status(400).json({ error: "Debe especificar el año (anio=YYYY)" });
        }

        // 🔹 Función auxiliar genérica para totales por código
        const obtenerTotalPorCodigo = async (codigoPrefix) => {
            const { rows } = await pool.query(
                `SELECT COALESCE(SUM(r.saldo), 0) AS total
                 FROM registro r
                 INNER JOIN cuenta c ON r.idcuenta = c.idcuenta
                 WHERE c.codigo LIKE $1 AND r.anio = $2`,
                [`${codigoPrefix}%`, anio]
            );
            return Number(rows[0].total) || 0;
        };

        // 🔹 Función auxiliar para buscar saldo por un solo nombre
        const obtenerSaldoPorNombre = async (nombre) => {
            const { rows } = await pool.query(
                `SELECT COALESCE(SUM(r.saldo), 0) AS saldo
                 FROM registro r
                 INNER JOIN cuenta c ON r.idcuenta = c.idcuenta
                 WHERE LOWER(c.nombre) = LOWER($1) AND r.anio = $2`,
                [nombre, anio]
            );
            return Number(rows[0].saldo) || 0;
        };

        // 🔹 Nueva función: busca saldo por múltiples posibles nombres
        const obtenerSaldoPorNombres = async (nombres = []) => {
            for (const nombre of nombres) {
                const saldo = await obtenerSaldoPorNombre(nombre);
                if (saldo) return saldo;
            }
            return 0;
        };

        // 🔹 1. Totales por clasificación
        const totalActivoCorriente = await obtenerTotalPorCodigo("1.1");
        const totalActivoNoCorriente = await obtenerTotalPorCodigo("1.2");
        const totalPasivoCorriente = await obtenerTotalPorCodigo("2.1");
        const totalPasivoNoCorriente = await obtenerTotalPorCodigo("2.2");
        const totalPatrimonio = await obtenerTotalPorCodigo("3");

        // 🔹 2. Cuentas individuales (usando múltiples posibles nombres)
        const clientes = await obtenerSaldoPorNombres([
            "Cuentas por cobrar a clientes",
            "Cuentas por cobrar comerciales - neto",
            "Clientes"
        ]);

        const inventarios = await obtenerSaldoPorNombres([
            "Inventarios",
            "Existencias",
            "Mercaderías"
        ]);

        const ingresosPorVentas = await obtenerSaldoPorNombres([
            "Ingresos por ventas",
            "Ventas netas"
        ]);

        const costoDeLoVendido = await obtenerSaldoPorNombres([
            "Costo de lo vendido",
            "Costo de ventas"
        ]);

        // 🔹 3. Otras cuentas relevantes para utilidades
        const gastosAdministrativos = await obtenerSaldoPorNombre("Gastos administrativos");
        const gastosDeVenta = await obtenerSaldoPorNombre("Gastos de venta");
        const otrosIngresosYGastosNetos = await obtenerSaldoPorNombre("Otros ingresos y gastos netos");
        const ingresosYGastosFinancieros = await obtenerSaldoPorNombre("Ingresos (gastos) financieros, netos");
        const provisionRenta = await obtenerSaldoPorNombre("Provision para el impuesto sobre la renta");
        const provisionSolidaria = await obtenerSaldoPorNombre("Provision para la aportacion solidaria");
        const efectoConversion = await obtenerSaldoPorNombre("Efecto de conversion de moneda de anio");

        // 🔹 4. Calcular utilidades derivadas
        const utilidadBruta = ingresosPorVentas + costoDeLoVendido;
        const utilidadOperativa = utilidadBruta + otrosIngresosYGastosNetos + gastosAdministrativos + gastosDeVenta;
        const utilidadAntesDeImpuestos = utilidadOperativa + ingresosYGastosFinancieros;
        const utilidadNeta = utilidadAntesDeImpuestos + provisionRenta + provisionSolidaria;
        const resultadoIntegralTotal = utilidadNeta + efectoConversion;

        // 🔹 5. Respuesta JSON plana (con espacios en los nombres)
        res.json({
            "Año": anio,
            "Activo Corriente": totalActivoCorriente,
            "Activo No Corriente": totalActivoNoCorriente,
            "Pasivo Corriente": totalPasivoCorriente,
            "Pasivo No Corriente": totalPasivoNoCorriente,
            "Patrimonio": totalPatrimonio,
            "Clientes": clientes,
            "Inventarios": inventarios,
            "Ingresos por Ventas": ingresosPorVentas,
            "Costo de lo Vendido": costoDeLoVendido,
            "Utilidad Bruta": utilidadBruta,
            "Utilidad Operativa": utilidadOperativa,
            "Utilidad Antes de Impuestos": utilidadAntesDeImpuestos,
            "Utilidad Neta": utilidadNeta,
            "Resultado Integral Total": resultadoIntegralTotal
        });

    } catch (error) {
        console.error("Error al generar resumen financiero:", error);
        res.status(500).json({ error: error.message });
    }
};

