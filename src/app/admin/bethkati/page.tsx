"use client";

import { FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  errorMessage,
} from "~/components/admin/ui";
import { uploadFile } from "~/lib/upload";
import { api } from "~/trpc/react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function BethkatiAdmin() {
  const utils = api.useUtils();
  const list = api.misc.getAllBethkati.useQuery();
  const create = api.misc.createBethkati.useMutation({
    onSuccess: () => utils.misc.getAllBethkati.invalidate(),
  });
  const remove = api.misc.deleteBethkati.useMutation({
    onSuccess: () => utils.misc.getAllBethkati.invalidate(),
  });

  const now = new Date();
  const [month, setMonth] = useState(MONTHS[now.getMonth()]!);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function publish() {
    if (!file) return toast.warning("Choose the PDF file");
    const y = Number(year);
    if (!Number.isInteger(y) || y < 2000) return toast.warning("Enter a valid year");
    setUploading(true);
    try {
      const url = await uploadFile(file, "bethkati");
      await create.mutateAsync({ pdfUrl: url, year: y, month, fileName: file.name });
      toast.success(`Bethkati ${month} ${y} published`);
      setFile(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Bethkati" description="Publish each month's parish newsletter as a PDF." />

      <Card className="mb-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Month">
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field label="Year">
            <Input type="number" min={2000} value={year} onChange={(e) => setYear(e.target.value)} />
          </Field>
          <Field label="PDF file">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center gap-2 truncate rounded-xl border border-dashed border-accent/30 bg-cream/60 px-4 py-2.5 text-left text-sm text-ink hover:border-accent"
            >
              <Upload size={16} className="shrink-0 text-accent" />
              <span className="truncate">{file ? file.name : "Choose PDF…"}</span>
            </button>
          </Field>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button className="mt-5" onClick={publish} loading={uploading} disabled={!file}>
          {uploading ? "Uploading…" : "Publish issue"}
        </Button>
      </Card>

      {list.isLoading ? (
        <Spinner />
      ) : !list.data?.length ? (
        <EmptyState>No issues published yet.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.data.map((issue) => (
            <li key={issue.id}>
              <Card className="flex items-center gap-3 !p-4">
                <FileText className="shrink-0 text-accent" />
                <a href={issue.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold text-ink hover:underline">
                  {issue.month} {issue.year}
                </a>
                <ConfirmButton onConfirm={() => remove.mutateAsync({ id: issue.id })} />
              </Card>
            </li>
          ))}
        </ul>
      )}
      {uploading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-textcolor/70">
          <Loader2 size={14} className="animate-spin" /> Large PDFs can take a minute to upload.
        </p>
      )}
    </div>
  );
}
