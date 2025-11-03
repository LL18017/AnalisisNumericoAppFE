import express from "express";
import {
    getRegistros,
    createRegistro,
    updateRegistro,
    deleteRegistro,
    buscarRegistro,
    getRegistrosBalance,
    getRegistrosEstadoResultados,
    getRegistrosEstadoResultadosComparativo,
    getRegistrosBalanceComparativo,
    obtenerSumaPorCodigoEndpoint,
    getResumenCuentasParaRatio
} from "../controllers/registro.controller.js";

const router = express.Router();

router.get("/", getRegistros);
router.get("/buscar", buscarRegistro);
router.post("/", createRegistro);
router.put("/:id", updateRegistro);
router.delete("/:id", deleteRegistro);
router.get("/balance", getRegistrosBalance);
router.get("/balanceComparativo", getRegistrosBalanceComparativo);
router.get("/balance/suma", obtenerSumaPorCodigoEndpoint);
router.get("/estadoResultado", getRegistrosEstadoResultados);
router.get("/estadoResultadoComparativo", getRegistrosEstadoResultadosComparativo);
router.get("/ratios/cuentas", getResumenCuentasParaRatio);

export default router;
