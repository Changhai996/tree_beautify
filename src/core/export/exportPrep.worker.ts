import { applyPdfExportFixesToSvgString, type PdfExportFixOptions } from "./pdfFixes";

type RequestMessage = {
  id: string;
  svgString: string;
  pdfFixes?: PdfExportFixOptions;
};

type ResponseMessage = {
  id: string;
  svgString?: string;
  error?: string;
};

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const msg = event.data;
  try {
    const next = applyPdfExportFixesToSvgString(msg.svgString, msg.pdfFixes);
    const resp: ResponseMessage = { id: msg.id, svgString: next };
    self.postMessage(resp);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const resp: ResponseMessage = { id: msg.id, error };
    self.postMessage(resp);
  }
};
