import express from "express";
import {
    getRegistros,
    createRegistro,
    updateRegistro,
    deleteRegistro,
    buscarRegistro,
    getRegistrosBalance,
    obtenerSumaPorCodigoEndpoint
} from "../controllers/registro.controller.js";

const router = express.Router();

router.get("/", getRegistros);
router.get("/buscar", buscarRegistro);
router.post("/", createRegistro);
router.put("/:id", updateRegistro);
router.delete("/:id", deleteRegistro);
router.get("/balance", getRegistrosBalance);
router.get("/balance/suma", obtenerSumaPorCodigoEndpoint);

export default router;
