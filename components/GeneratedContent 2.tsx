import React from 'react';
import jsPDF from 'jspdf';
import { FaDownload } from 'react-icons/fa'; // Import the download icon

interface GeneratedItem {
  fileName: string;
  content: string;
}

interface GeneratedContentProps {
  title: string;
  items: GeneratedItem[];
  selectedIndex: number | null;
  onItemSelect: (index: number | null) => void;
  colorClass: string;
}

export function GeneratedContent({
  title,
  items,
  selectedIndex,
  onItemSelect,
  colorClass,
}: GeneratedContentProps) {
  const handleDownloadPDF = (item: GeneratedItem) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const margin = 40; // Margin from each edge
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 14; // Height of each line
    const fontSize = 12;
    const textColor = '#000000';
    const fontName = 'Helvetica';

    doc.setFont(fontName);
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor);

    // Explicitly assert that 'lines' is a string array
    const lines = doc.splitTextToSize(item.content, maxLineWidth) as string[];

    let cursorY = margin;

    lines.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }

      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save(`${item.fileName}-${title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          <ul className="list-disc pl-5">
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                <button
                  className={`${colorClass} hover:underline`}
                  onClick={() => onItemSelect(index)}
                >
                  {item.fileName} - {title} {index + 1}
                </button>
                {/* Download PDF Button */}
                <button
                  onClick={() => handleDownloadPDF(item)}
                  className="ml-4 text-gray-900 dark:text-gray-100 hover:text-gray-700"
                  title="Download PDF"
                >
                  <FaDownload size={16} />
                </button>
              </li>
            ))}
          </ul>

          {selectedIndex !== null && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold">
                  {items[selectedIndex].fileName} - {title} {selectedIndex + 1}
                </h4>
                <div className="flex items-center">
                  {/* Download PDF Button */}
                  <button
                    onClick={() => handleDownloadPDF(items[selectedIndex])}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                    title="Download PDF"
                  >
                    <FaDownload size={20} />
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => onItemSelect(null)}
                    title="Close"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap">{items[selectedIndex].content}</pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4">
          No {title.toLowerCase()} generated yet
        </p>
      )}
    </>
  );
}