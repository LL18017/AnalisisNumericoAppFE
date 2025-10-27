import puppeteer from "puppeteer";

export async function generarPDF(html) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm" },
    });

    await browser.close();
    return pdfBuffer;
}
