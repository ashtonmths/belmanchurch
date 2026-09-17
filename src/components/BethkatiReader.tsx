/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

export default function BethkatiViewer({
  file,
  onClose,
}: {
  file: string;
  onClose: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(700);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const resize = () =>
      setPageWidth(Math.max(260, Math.min(frame.clientWidth - 32, 820)));
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    resize();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-[75dvh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#14100d]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <p className="font-medium text-white">Bethkati reader</p>
          <p className="mt-0.5 text-xs text-white/45">
            Page {pageNumber} of {numPages || "…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={file}
            download
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70"
            aria-label="Download Bethkati"
          >
            <Download size={17} />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70"
            aria-label="Close reader"
          >
            <X size={18} />
          </button>
        </div>
      </header>
      <div ref={frameRef} className="flex-1 overflow-auto bg-black/25 p-4">
        <Document
          file={file}
          loading={
            <div className="grid h-full place-items-center text-sm text-white/50">
              Preparing publication…
            </div>
          }
          error={
            <div className="grid h-full place-items-center text-sm text-red-200">
              This publication could not be opened.
            </div>
          }
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        >
          <div className="mx-auto w-fit overflow-hidden rounded-lg shadow-2xl">
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={pageWidth}
            />
          </div>
        </Document>
      </div>
      <footer className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
          disabled={pageNumber === 1}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-30"
        >
          <ChevronLeft size={17} />
          Previous
        </button>
        <span className="min-w-16 text-center text-sm text-white/55">
          {pageNumber} / {numPages || "–"}
        </span>
        <button
          type="button"
          onClick={() => setPageNumber((page) => Math.min(numPages, page + 1))}
          disabled={!numPages || pageNumber === numPages}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-30"
        >
          Next
          <ChevronRight size={17} />
        </button>
      </footer>
    </div>
  );
}
