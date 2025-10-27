import express from "express";
import {
    getCuentas,
    createCuenta,
    updateCuenta,
    deleteCuenta,
    buscarCuenta,
} from "../controllers/cuenta.controller.js";

const router = express.Router();

router.get("/", getCuentas);
router.get("/buscar", buscarCuenta);
router.post("/", createCuenta);
router.put("/:id", updateCuenta);
router.delete("/:id", deleteCuenta);

export default router;
