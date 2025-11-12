import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cuentaRoutes from "./routes/cuenta.routes.js";
import registroRoutes from "./routes/registro.routes.js";
import estadosRoutes from "./routes/estados.route.js"
import cors from "cors";
import bodyParser from "body-parser";
import pdfRouter from "./routes/pdf.routes.js";

// import { generarPDFCuentas } from "./src/utils/pdfGenerator.js";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/cuentas", cuentaRoutes);
app.use("/api/registros", registroRoutes);
app.use("/api/registros", estadosRoutes);
app.use("/pdf", pdfRouter);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// Generar PDF
// app.get("/api/pdf/cuentas", async (req, res) => {
//     try {
//         const pdf = await generarPDFCuentas();
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "attachment; filename=reporte_cuentas.pdf");
//         res.send(pdf);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

app.listen(process.env.PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT}`);
});
