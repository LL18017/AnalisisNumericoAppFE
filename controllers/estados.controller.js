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
            ORDER BY c.codigo ASC;

        `, [anio]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener registros por año:", error);
        res.status(500).json({ error: error.message });
    }
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

const insertarUtilidades = (resultados, campos = ["saldo"]) => {
    //  Array acumulador, parte como copia profunda
    let acumulado = JSON.parse(JSON.stringify(resultados));

    //  Permite pasar una lista de posibles ubicaciones "después de"
    const agregar = (despuesOpciones, cuentas, nombreNuevo) => {
        try {
            // Crear copia local del acumulado actual (no del original)
            const copia = JSON.parse(JSON.stringify(acumulado));

            const nuevo = crearRegistro(copia, cuentas, nombreNuevo, campos);

            // Buscar primera coincidencia válida en la copia
            const despuesValido = despuesOpciones.find(op =>
                copia.some(r => r.nombre_cuenta?.toLowerCase() === op?.toLowerCase())
            );

            insertarDespuesDe(copia, despuesValido, null, nuevo);

            // Actualiza el acumulado con la nueva copia
            acumulado = copia;
        } catch (error) {
            console.log(error);
        }
    };

    // --- Inserciones ---
    agregar(
        ["Costo de lo vendido"],
        ["Ingresos por ventas", "Costo de lo vendido"],
        "Utilidad Bruta"
    );

    agregar(
        [
            "Otros ingresos y gastos netos",
            "Perdidas por deterioro de valor de cuentas por cobrar",
            "Gastos de Depreciación y Amortización", "Gastos de Personal",
            "Gastos de venta", "Gastos administrativos",
        ],
        ["Utilidad Bruta", "Gastos administrativos", "Gastos de venta",
            "Gastos de Personal", "Gastos de Depreciación y Amortización",
            "Perdidas por deterioro de valor de cuentas por cobrar",
            "Otros ingresos y gastos netos"],
        "Utilidad Operativa"
    );

    if (acumulado.some(
        r => r.nombre_cuenta === "Ingresos (gastos) financieros, netos")) {
        agregar(
            ["Ingresos (gastos) financieros, netos", "Resultado financiero"],
            ["Utilidad Operativa", "Ingresos (gastos) financieros, netos"],
            "Utilidad antes de impuestos"
        );
    } else {
        agregar(
            ["resultado financiero",
                "Otros Ingresos (Gastos)",
                "Gastos Financieros",
                "Ingresos Financieros"],
            ["Utilidad Operativa", "Ingresos Financieros",
                "Gastos Financieros", "Otros Ingresos (Gastos)"],
            "Utilidad antes de impuestos"
        );
    }

    agregar(
        ["Provision para la aportacion solidaria", "Provision para el impuesto sobre la renta"],
        ["Utilidad antes de impuestos", "Provision para el impuesto sobre la renta", "Provision para la aportacion solidaria"],
        "Utilidad Neta"
    );

    agregar(
        ["Efecto de conversion de moneda de anio", "Ajuste por tipo de cambio"],
        ["Utilidad Neta", "Efecto de conversion de moneda de anio"],
        "Resultado Integral Total"
    );

    // 🔹 Finalmente devuelve la copia completa sin referencias al original
    return acumulado;
};





//  Obtener estado de resultados de un solo año
export const getRegistrosEstadoResultados = async (req, res) => {
    try {
        const { anio } = req.query;
        if (!anio) return res.status(400).json({ error: "Debe especificar el año (anio=YYYY)" });

        const resultados = [];

        for (const nombre of cuentasEstadoResultados) {
            const rows = await obtenerRegistros("WHERE LOWER(c.nombre) = LOWER($1) AND r.anio = $2", [nombre, anio]);
            if (rows.length > 0) resultados.push(rows[0]);
        }

        const resultadoFinal = [...insertarUtilidades([...resultados])];

        res.json(resultadoFinal);
    } catch (error) {
        console.error("Error en estado de resultados:", error);
        res.status(500).json({ error: error.message });
    }
};

//  Obtener estado de resultados comparativo (2 años)
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

        let resultadosSaldo1 = resultados.filter(c => c.saldo_anio1 != 0);
        let resultadosSaldo2 = resultados.filter(c => c.saldo_anio2 != 0);


        resultadosSaldo1 = [...insertarUtilidades([...resultadosSaldo1], ["saldo_anio1"])]
        resultadosSaldo2 = [...insertarUtilidades([...resultadosSaldo2], ["saldo_anio2"])]

        let nombres = [
            ...new Set([
                ...resultados.map(c => c.nombre_cuenta),
                ...resultadosSaldo1.map(c => c.nombre_cuenta),
                ...resultadosSaldo2.map(c => c.nombre_cuenta)
            ])
        ];


        // 🔹 Unir ambos resultados en un solo arreglo final
        let resultadoFinal = nombres.map(nombre => {
            const r1 = resultadosSaldo1.find(r => r.nombre_cuenta === nombre);
            const r2 = resultadosSaldo2.find(r => r.nombre_cuenta === nombre);

            return {
                nombre_cuenta: nombre,
                saldo_anio1: r1?.saldo_anio1 ?? 0,
                saldo_anio2: r2?.saldo_anio2 ?? 0,
            };
        });

        const ordenarEstadoResultados = (arr) => {
            const ordenPersonalizado = [
                "Ingresos por ventas",
                "Costo de lo vendido",
                "Utilidad Bruta",
                "Gastos administrativos",
                "Gastos de venta",
                "Gastos de Personal",
                "Gastos de Depreciación y Amortización",
                "Perdidas por deterioro de valor de cuentas por cobrar",
                "Otros ingresos y gastos netos",
                "Utilidad Operativa",
                "Ingresos (gastos) financieros, netos",
                "Ingresos Financieros",
                "Gastos Financieros",
                "Otros Ingresos (Gastos)",
                "Utilidad antes de impuestos",
                "Provision para el impuesto sobre la renta",
                "Provision para la aportacion solidaria",
                "Utilidad Neta",
                "Efecto de conversion de moneda de anio",
                "Ajuste por tipo de cambio",
                "Resultado Integral Total"
            ];

            // Se ordena según el índice en la lista anterior
            return arr.sort((a, b) => {
                const ia = ordenPersonalizado.indexOf(a.nombre_cuenta);
                const ib = ordenPersonalizado.indexOf(b.nombre_cuenta);
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        };

        resultadoFinal = ordenarEstadoResultados(resultadoFinal)

        res.json(resultadoFinal);
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

        // Función auxiliar para obtener totales por código
        const obtenerTotalPorCodigo = async (prefijoCodigo) => {
            const { rows } = await pool.query(
                `SELECT COALESCE(SUM(r.saldo), 0) AS total
         FROM registro r
         INNER JOIN cuenta c ON r.idcuenta = c.idcuenta
         WHERE c.codigo LIKE $1 AND r.anio = $2`,
                [`${prefijoCodigo}%`, anio]
            );
            return Number(rows[0].total) || 0;
        };

        // Función auxiliar para obtener saldo por un solo nombre
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

        // Función auxiliar para obtener saldo por varios posibles nombres
        const obtenerSaldoPorNombres = async (nombres = []) => {
            let saldo = 0;
            for (const nombre of nombres) {
                saldo += await obtenerSaldoPorNombre(nombre);
            }
            return saldo;
        };

        // 1. Totales por clasificación contable
        const totalActivoCorriente = await obtenerTotalPorCodigo("1.1");
        const totalActivoNoCorriente = await obtenerTotalPorCodigo("1.2");
        const totalActivo = totalActivoCorriente + totalActivoNoCorriente;

        const totalPasivoCorriente = await obtenerTotalPorCodigo("2.1");
        const totalPasivoNoCorriente = await obtenerTotalPorCodigo("2.2");
        const totalPasivo = totalPasivoCorriente + totalPasivoNoCorriente;

        const totalPatrimonio = await obtenerTotalPorCodigo("3");

        // 2. Cuentas específicas
        let clientes = await obtenerSaldoPorNombres([
            "Cuentas por cobrar a clientes",
            "Cuentas por cobrar comerciales - neto",
            "Clientes"
        ]);

        if (anio == 2024) {
            clientes += await obtenerSaldoPorNombres(["Otras cuentas por cobrar"]);
        }

        const inventarios = await obtenerSaldoPorNombres([
            "Inventarios",
            "Existencias",
            "Mercaderías"
        ]);

        const ingresosPorVentas = await obtenerSaldoPorNombres([
            "Ingresos por ventas",
            "Ventas netas"
        ]);

        const costoDeVentas = await obtenerSaldoPorNombres([
            "Costo de lo vendido",
            "Costo de ventas"
        ]);

        let cuentasPorPagar = await obtenerSaldoPorNombres([
            "Acreedores comerciales y otras cuentas por pagar",

            "Cuentas por pagar comerciales"
        ]);

        if (cuentasPorPagar === 0) {
            cuentasPorPagar = totalPasivoCorriente - await obtenerSaldoPorNombre("Cuentas por pagar a partes relacionadas");
        }

        // 3. Otras cuentas de resultado
        const gastosAdministrativos = await obtenerSaldoPorNombre("Gastos administrativos");
        const gastosDeVenta = await obtenerSaldoPorNombre("Gastos de venta");
        const otrosIngresosYGastosNetos = await obtenerSaldoPorNombre("Otros ingresos y gastos netos");
        const gastosFinancieros = await obtenerSaldoPorNombre("Gastos financieros");
        const ingresosFinancieros = await obtenerSaldoPorNombre("Ingresos financieros");
        const ingresosYGastosFinancieros = await obtenerSaldoPorNombre("Ingresos (gastos) financieros, netos");
        const provisionImpuestoRenta = await obtenerSaldoPorNombre("Provision para el impuesto sobre la renta");

        const arrendamientosPagados = await obtenerSaldoPorNombre("Arrendamientos pagados");
        const prestamosBancariosPagados = await obtenerSaldoPorNombre("Prestamos bancarios pagados");
        const documentosPagados = await obtenerSaldoPorNombre("Documentos por pagar pagados");
        const obligacionesTitularizadasPagadas = await obtenerSaldoPorNombre("Obligaciones por derechos titularizados pagados");

        const principalTotal = prestamosBancariosPagados + documentosPagados + obligacionesTitularizadasPagadas;

        const provisionAportacionSolidaria = await obtenerSaldoPorNombre("Provision para la aportacion solidaria");
        const efectoConversionMoneda = await obtenerSaldoPorNombre("Efecto de conversión de moneda del año");

        // 4. Cálculo de utilidades
        const utilidadBruta = ingresosPorVentas + costoDeVentas;
        const utilidadOperativa = utilidadBruta + otrosIngresosYGastosNetos + gastosAdministrativos + gastosDeVenta;
        const utilidadAntesDeImpuestos = utilidadOperativa + ingresosYGastosFinancieros + gastosFinancieros + ingresosFinancieros;
        const utilidadNeta = utilidadAntesDeImpuestos + provisionImpuestoRenta + provisionAportacionSolidaria;
        const resultadoIntegralTotal = utilidadNeta + efectoConversionMoneda;

        // 5. Promedios y valores de referencia
        const promedioVentasCredito = ingresosPorVentas !== 0 ? ingresosPorVentas : 0;
        const promedioComprasCredito = costoDeVentas !== 0 ? Math.abs(costoDeVentas) * 0.7 : 0;

        // 6. Cálculo de ratios financieros
        const ratiosLiquidez = obtenerRatiosLiquidez(totalActivoCorriente, totalPasivoCorriente, inventarios);
        const ratiosActividad = obtenerRatiosActividad(
            costoDeVentas, inventarios, clientes, cuentasPorPagar,
            promedioVentasCredito, promedioComprasCredito, ingresosPorVentas, totalActivo
        );
        const ratiosEndeudamiento = obtenerRatiosEndeudamiento(
            utilidadOperativa, arrendamientosPagados, (gastosFinancieros ? gastosFinancieros : ingresosYGastosFinancieros), principalTotal,
            totalActivo, totalPasivo, totalPatrimonio
        );
        const ratiosRendimiento = obtenerRatiosRendimiento(
            utilidadBruta, utilidadOperativa, utilidadNeta, ingresosPorVentas, totalActivo,
            ratiosEndeudamiento["Multiplicador de apalancamiento financiero (MAF)"]
        );

        // 7. Armar objeto de salida
        const cuentas = {
            "Activo Corriente": totalActivoCorriente,
            "Activo No Corriente": totalActivoNoCorriente,
            "Total Activo": totalActivo,
            "Pasivo Corriente": totalPasivoCorriente,
            "Pasivo No Corriente": totalPasivoNoCorriente,
            "Total Pasivo": totalPasivo,
            "Patrimonio": totalPatrimonio,
            "Clientes": clientes,
            "Cuentas por Pagar": cuentasPorPagar,
            "Promedio de Ventas al Crédito": promedioVentasCredito,
            "Promedio de Compras al Crédito": promedioComprasCredito,
            "Inventarios": inventarios,
            "Ingresos por Ventas": ingresosPorVentas,
            "Costo de Ventas": costoDeVentas,
            "Arrendamientos Pagados": arrendamientosPagados,
            "Utilidad Bruta": utilidadBruta,
            "Utilidad Operativa": utilidadOperativa,
            "Utilidad Antes de Impuestos": utilidadAntesDeImpuestos,
            "Utilidad Neta": utilidadNeta,
            "Resultado Integral Total": resultadoIntegralTotal,
            "Principal": {
                "Arrendamientos Pagados": arrendamientosPagados,
                "Préstamos Bancarios Pagados": prestamosBancariosPagados,
                "Documentos Pagados": documentosPagados,
                "Obligaciones Titularizadas Pagadas": obligacionesTitularizadasPagadas,
                "Principal Total": principalTotal
            }
        };

        // Agrega dinámicamente las cuentas financieras según el caso
        if (ingresosYGastosFinancieros) {
            cuentas["Gastos e Ingresos Financieros"] = ingresosYGastosFinancieros;
        } else {
            cuentas["Gastos Financieros"] = gastosFinancieros;
            cuentas["Ingresos Financieros"] = ingresosFinancieros;
        }

        // 8. Respuesta final
        res.json({
            "Año": anio,
            cuentas,
            ratiosLiquidez,
            ratiosActividad,
            ratiosEndeudamiento,
            ratiosRendimiento
        });

    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "No se puede conectar a la base de datos. Verifique que PostgreSQL esté encendido." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};



// Función auxiliar para convertir valores en números de forma segura
const numeroSeguro = (valor) => {
    const n = Number(valor);
    return isFinite(n) ? n : 0;
};

// Función auxiliar para evitar divisiones por cero
const dividirSeguro = (numerador, denominador) => {
    return denominador === 0 ? 0 : numerador / denominador;
};

// ---------------------------------
// Ratios de liquidez
// ---------------------------------
const obtenerRatiosLiquidez = (activoCorriente, pasivoCorriente, inventarios) => {
    activoCorriente = numeroSeguro(activoCorriente);
    pasivoCorriente = numeroSeguro(pasivoCorriente);
    inventarios = numeroSeguro(inventarios);

    return {
        "Liquidez corriente": dividirSeguro(activoCorriente, pasivoCorriente),
        "Prueba ácida": dividirSeguro(activoCorriente - inventarios, pasivoCorriente),
        "Capital de trabajo": activoCorriente - pasivoCorriente,
    };
};

// ---------------------------------
// Ratios de actividad
// ---------------------------------
const obtenerRatiosActividad = (costoVendido, inventarios, clientes, cuentasPorPagar,
    ventasCreditoPromedio, comprasCreditoPromedio, ingresosVentas, activoTotal) => {

    costoVendido = Math.abs(numeroSeguro(costoVendido));
    inventarios = numeroSeguro(inventarios);
    clientes = numeroSeguro(clientes);
    cuentasPorPagar = numeroSeguro(cuentasPorPagar);
    ventasCreditoPromedio = numeroSeguro(ventasCreditoPromedio);
    comprasCreditoPromedio = numeroSeguro(comprasCreditoPromedio);
    ingresosVentas = numeroSeguro(ingresosVentas);
    activoTotal = numeroSeguro(activoTotal);

    return {
        "Rotación de activos": dividirSeguro(ingresosVentas, activoTotal),
        "Rotación de inventarios": dividirSeguro(costoVendido, inventarios),
        "Período promedio de cobro (días)": dividirSeguro(clientes, dividirSeguro(ventasCreditoPromedio, 365)),
        "Período promedio de cobro (veces)": dividirSeguro(clientes, ventasCreditoPromedio),
        "Período promedio de pago (días)": dividirSeguro(cuentasPorPagar, dividirSeguro(comprasCreditoPromedio, 365)),
        "Período promedio de pago (veces)": dividirSeguro(cuentasPorPagar, comprasCreditoPromedio),
    };
};

// ---------------------------------
// Ratios de endeudamiento
// ---------------------------------
const obtenerRatiosEndeudamiento = (utilidadOperativa, arrendamientosPagados, gastosFinancieros,
    principalTotal, activoTotal, pasivoTotal, patrimonioTotal) => {

    utilidadOperativa = numeroSeguro(utilidadOperativa);
    arrendamientosPagados = numeroSeguro(arrendamientosPagados);
    gastosFinancieros = Math.abs(numeroSeguro(gastosFinancieros));
    principalTotal = numeroSeguro(principalTotal);
    activoTotal = numeroSeguro(activoTotal);
    pasivoTotal = numeroSeguro(pasivoTotal);
    patrimonioTotal = numeroSeguro(patrimonioTotal);

    return {
        "Índice de endeudamiento": dividirSeguro(pasivoTotal, activoTotal),
        "Multiplicador de apalancamiento financiero (MAF)": dividirSeguro(activoTotal, patrimonioTotal),
        "Cobertura de pagos": dividirSeguro(
            utilidadOperativa + arrendamientosPagados,
            gastosFinancieros + arrendamientosPagados + dividirSeguro(principalTotal, (1 - 0.3))
        ),
        "Razón de carga fija": dividirSeguro(utilidadOperativa, gastosFinancieros),
    };
};

// ---------------------------------
// Ratios de rendimiento
// ---------------------------------
const obtenerRatiosRendimiento = (utilidadBruta, utilidadOperativa, utilidadNeta, ingresosVentas,
    activoTotal, maf) => {


    utilidadBruta = numeroSeguro(utilidadBruta);
    utilidadOperativa = numeroSeguro(utilidadOperativa);
    utilidadNeta = numeroSeguro(utilidadNeta);
    ingresosVentas = numeroSeguro(ingresosVentas);
    activoTotal = numeroSeguro(activoTotal);
    maf = numeroSeguro(maf);

    return {
        "Margen de utilidad bruta": dividirSeguro(utilidadBruta, ingresosVentas),
        "Margen de utilidad operativa": dividirSeguro(utilidadOperativa, ingresosVentas),
        "Margen de utilidad neta": dividirSeguro(utilidadNeta, ingresosVentas),
        "Rendimiento sobre activos (ROA)": dividirSeguro(utilidadNeta, activoTotal),
        "Retorno sobre el patrimonio (ROE)": dividirSeguro(utilidadNeta, activoTotal) * maf,
    };
};
