import pdfPlacement from '!!./pdf_placement.ts?raw';

import { demo } from "../../misc";

export const PDFPlacement = {
    ...demo("pdf_placement", "pdf_placement", pdfPlacement, { enablePreviewCanvas: true }, 'Use two reference points on both the model and the PDF to place and scale the PDF in 3D space.'),
};
