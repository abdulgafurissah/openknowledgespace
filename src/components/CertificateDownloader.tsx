"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";

export default function CertificateDownloader({ courseTitle, studentName }: { courseTitle: string, studentName: string }) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    const certificateElement = document.getElementById("certificate-node");
    if (!certificateElement) return;

    setDownloading(true);
    try {
      // Capture the element as canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Calculate A4 landscape dimensions
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasRatio = canvas.height / canvas.width;
      const pdfRatio = pdfHeight / pdfWidth;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;

      if (canvasRatio > pdfRatio) {
        // Image is taller than PDF (relatively)
        finalWidth = pdfHeight / canvasRatio;
      } else {
        // Image is wider than PDF
        finalHeight = pdfWidth * canvasRatio;
      }

      // Center the image
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      
      // Save the PDF
      pdf.save(`Certificate - ${courseTitle} - ${studentName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '1rem', zIndex: 100 }}>
      <Link 
        href="/dashboard" 
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-full)',
          textDecoration: 'none',
          fontWeight: '500',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        Back to Dashboard
      </Link>
      <button 
        onClick={downloadPDF}
        disabled={downloading}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--gold-border)',
          color: 'var(--bg-primary)',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          fontWeight: '600',
          cursor: downloading ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--shadow-md)',
          opacity: downloading ? 0.7 : 1
        }}
      >
        {downloading ? "Generating PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
