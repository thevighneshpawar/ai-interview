import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

// Tell pdf.js to use the bundled worker
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer })
      .promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += "\n" + pageText;
    }
    return text;
  } catch (err) {
    console.error("Error extracting text from PDF:", err);
    throw new Error("Failed to extract text from PDF");
  }
}
