import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, Check, X } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  data: any[];
  columns: { key: string; label: string }[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  data,
  columns,
}) => {
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    // Header row
    const headers = columns.map((col) => col.label).join(",");
    // Data rows
    const rows = data.map((row) =>
      columns
        .map((col) => {
          let val = row[col.key] || "";
          if (typeof val === "object") val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GEC_Arsikere_${reportTitle.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  const handleDownloadPDF = () => {
    // Generate styled printable HTML report window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableHeaders = columns.map((col) => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #002147; color: #D4AF37; text-align: left;">${col.label}</th>`).join("");
    const tableRows = data
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => `<td style="border: 1px solid #ddd; padding: 8px;">${row[col.key] || "-"}</td>`)
            .join("")}</tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle} - GEC Arsikere</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #002147; margin-bottom: 5px; }
            p { color: #666; font-size: 12px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            .footer { margin-top: 30px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>Government Engineering College, Arsikere</h2>
          <p>Official Academic Report: <strong>${reportTitle}</strong> • Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">Confidential College Record • GEC Arsikere ERP System</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-[#D4AF37]" /> Export Report
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Select preferred report format for <strong>{reportTitle}</strong> ({data.length} records).
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setFormat("csv")}
            className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center space-y-1 transition-all ${
              format === "csv"
                ? "border-[#002147] bg-[#002147]/5 text-[#002147] dark:text-amber-400 font-bold"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            <FileSpreadsheet className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-xs">Excel / CSV</span>
          </button>

          <button
            onClick={() => setFormat("pdf")}
            className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center space-y-1 transition-all ${
              format === "pdf"
                ? "border-[#002147] bg-[#002147]/5 text-[#002147] dark:text-amber-400 font-bold"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            <FileText className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-xs">PDF Document</span>
          </button>
        </div>

        <button
          onClick={format === "csv" ? handleDownloadCSV : handleDownloadPDF}
          className="w-full py-2.5 rounded-xl bg-[#002147] hover:bg-[#001530] text-[#D4AF37] font-bold text-xs shadow-md flex items-center justify-center space-x-2 border border-[#D4AF37]/30"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Report Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()} Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
