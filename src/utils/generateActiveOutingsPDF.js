import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ FIX: Import as a named/default object

export const generateActiveOutingsPDF = (outings, gender) => {
  const doc = new jsPDF();
  const title = "Active Outings Report";
  const timestamp = new Date().toLocaleString();

  // Theme: Pink for Female, Indigo for Male/All
  const themeColor = gender === "Female" ? [236, 72, 153] : [99, 102, 241];

  // --- HEADER ---
  doc.setFontSize(18);
  doc.setTextColor(...themeColor);
  doc.text(title.toUpperCase(), 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${timestamp}`, 14, 28);
  doc.text(`Category: ${gender} Students`, 14, 33);
  doc.text(`Total Active: ${outings.length}`, 14, 38);

  // --- TABLE DATA ---
  const tableColumn = ["#", "Name", "Roll No", "Room", "Course", "Purpose", "Out Time"];
  const tableRows = outings.map((o, index) => {
    const profile = o.profile || {};
    const outTime = new Date(o.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return [
      index + 1,
      profile.name || "N/A",
      profile.roll_no || "N/A",
      profile.room_number || "N/A",
      profile.course || "-",
      o.purpose || "-",
      outTime
    ];
  });

  // --- GENERATE TABLE (Functional usage) ---
  // ✅ FIX: Use autoTable(doc, options) instead of doc.autoTable(options)
  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 9, textColor: [50, 50, 50] },
    headStyles: { 
      fillColor: themeColor, 
      textColor: [255, 255, 255], 
      fontStyle: "bold" 
    },
    alternateRowStyles: { fillColor: [250, 250, 255] },
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

  doc.save(`Active_Outings_${gender}_${new Date().toISOString().slice(0, 10)}.pdf`);
};