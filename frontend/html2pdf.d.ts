// Minimal type declaration for html2pdf.js for TypeScript
// Place this in your project to avoid TS errors if you use html2pdf.js via CDN or as a global

interface Html2Pdf {
  from(element: HTMLElement | string): Html2Pdf;
  set(options: any): Html2Pdf;
  save(): Promise<void>;
  output(type: string): Promise<any>;
}

declare const html2pdf: {
  (): Html2Pdf;
  from(element: HTMLElement | string): Html2Pdf;
};
