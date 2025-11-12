import express from "express";
import {
    getRegistrosBalance,
    getRegistrosEstadoResultados,
    getRegistrosEstadoResultadosComparativo,
    getRegistrosBalanceComparativo,
    getResumenCuentasParaRatio
} from "../controllers/estados.controller.js";

const router = express.Router();

router.get("/balance", getRegistrosBalance);
router.get("/balanceComparativo", getRegistrosBalanceComparativo);
router.get("/estadoResultado", getRegistrosEstadoResultados);
router.get("/estadoResultadoComparativo", getRegistrosEstadoResultadosComparativo);
router.get("/ratios/cuentas", getResumenCuentasParaRatio);

export default router;
