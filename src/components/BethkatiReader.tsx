/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import Button from "./Button";

interface BethkatiViewerProps {
  file: string;
  onClose: () => void;
}

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

export default function BethkatiViewer({ file, onClose }: BethkatiViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth] = useState(340); 

  useEffect(() => {
    const updateWidth = () => {
      const isMobile = window.innerWidth <= 768;
      setWidth(isMobile ? 330 : 350);
    };

    updateWidth(); // Set on mount
    window.addEventListener("resize", updateWidth); // Update on resize

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const goNext = () =>
    setPageNumber((prev) => (numPages && prev < numPages ? prev + 1 : prev));
  const goPrev = () => setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="absolute flex flex-col justify-center items-center w-[90%]">
      <Button
        onClick={onClose}
        className="mb-5 -mt-5"
      >
        Close
      </Button>
      <div className="flex flex-col items-center">
          <Document
            file={file}
            onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={width}
            />
          </Document>
        <div className="mt-4 flex gap-4">
          <Button
            onClick={goPrev}
            disabled={pageNumber === 1}
          >
            Prev
          </Button>
          <span className="text-primary text-base">
            Page {pageNumber} of {numPages ?? "?"}
          </span>
          <Button
            onClick={goNext}
            disabled={numPages === null || pageNumber === numPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
