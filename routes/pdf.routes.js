import express from "express";
import { generarPDF } from "../utils/pdfGenerator.js";

const router = express.Router();

/**
 * Ruta general: genera PDF de cualquier tipo.
 * Ejemplo: POST /pdf/balance
 *          POST /pdf/estado-resultados
 */
router.post("/:tipo", async (req, res) => {
    const { tipo } = req.params;
    const { html } = req.body;

    if (!html) {
        return res.status(400).json({ error: "Falta el contenido HTML" });
    }

    try {
        const pdfBuffer = await generarPDF(html);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${tipo}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generando el PDF" });
    }
});

export default router;
