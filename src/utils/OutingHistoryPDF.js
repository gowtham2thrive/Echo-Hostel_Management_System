import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateOutingHistoryPDF = (outings, gender) => {
  const doc = new jsPDF();
  const title = "Outing History Report";
  const timestamp = new Date().toLocaleString();

  // Gender-based Branding
  const themeColor = gender === "Female" ? [236, 72, 153] : [99, 102, 241]; // Pink or Indigo

  // --- HEADER ---
  doc.setFontSize(18);
  doc.setTextColor(...themeColor);
  doc.text(title.toUpperCase(), 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${timestamp}`, 14, 28);
  doc.text(`Filter Group: ${gender} Students`, 14, 33);
  doc.text(`Total Records: ${outings.length}`, 14, 38);

  // --- TABLE COLUMNS ---
  const tableColumn = [
    "#", 
    "Student", 
    "Roll No", 
    "Status", 
    "Purpose", 
    "Out Date", 
    "Return Date",
    "Approver"
  ];

  // --- TABLE DATA ---
  const tableRows = outings.map((o, index) => {
    const profile = o.profile || {};
    const approver = o.approver?.name || "System"; // Staff name
    
    // Format Dates
    const outDate = new Date(o.submitted_at).toLocaleDateString() + " " + 
                    new Date(o.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const returnInfo = o.return_date 
        ? new Date(o.return_date).toLocaleDateString() 
        : o.return_time || "-";

    return [
      index + 1,
      profile.name || "N/A",
      profile.roll_no || "N/A",
      (o.status || "Pending").toUpperCase(),
      o.purpose || "-",
      outDate,
      returnInfo,
      approver
    ];
  });

  // --- GENERATE TABLE ---
  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { 
        fontSize: 8, 
        textColor: [50, 50, 50], 
        cellPadding: 3 
    },
    headStyles: { 
      fillColor: themeColor, 
      textColor: [255, 255, 255], 
      fontStyle: "bold",
      halign: 'center'
    },
    columnStyles: {
        0: { cellWidth: 10 },  // Index
        3: { fontStyle: "bold" }, // Status
        4: { cellWidth: 40 },  // Purpose (wider)
    },
    alternateRowStyles: { 
        fillColor: [250, 250, 255] 
    },
  });

  // --- FOOTER ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
  }

  doc.save(`Outing_History_${gender}_${new Date().toISOString().slice(0, 10)}.pdf`);
};