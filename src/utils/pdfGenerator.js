import { jsPDF } from "jspdf";
import { formatDate } from "./formatters";

/**
 * Generates a high-fidelity, official A4 Complaint Record.
 * Features a collision-proof layout, professional typography, and detailed timeline.
 */
export const generateComplaintPDF = (complaint) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- CONFIGURATION ---
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;
  
  // Colors (RGB)
  const COL_BRAND = [99, 102, 241];    // Indigo
  const COL_DARK = [15, 23, 42];       // Slate 900
  const COL_TEXT = [51, 65, 85];       // Slate 700
  const COL_LABEL = [100, 116, 139];   // Slate 500
  const COL_LINE = [226, 232, 240];    // Slate 200
  const COL_BG = [248, 250, 252];      // Slate 50
  const COL_NOTE_BG = [240, 253, 244]; // Light Green/Mint for closing note
  
  // Status Colors
  const COL_SUCCESS = [34, 197, 94];   // Green
  
  let y = 0;

  // ==========================================
  // 1. HEADER STRIP
  // ==========================================
  doc.setFillColor(...COL_BRAND);
  doc.rect(0, 0, pageWidth, 5, "F");
  
  y = 25;
  
  // Logo Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COL_BRAND);
  doc.text("ECHO", margin, y);
  
  doc.setFontSize(8);
  doc.setTextColor(...COL_LABEL);
  doc.text("EVIDENCE-BASED OVERSIGHT", margin, y + 5);

  // Document Title (Right)
  doc.setFontSize(14);
  doc.setTextColor(...COL_DARK);
  doc.text("OFFICIAL COMPLAINT RECORD", pageWidth - margin, y, { align: "right" });
  
  doc.setFontSize(9);
  doc.setTextColor(...COL_LABEL);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref ID: #${complaint.id.substring(0, 8).toUpperCase()}`, pageWidth - margin, y + 5, { align: "right" });

  y += 25;

  // ==========================================
  // 2. INFORMATION GRID (2 Columns)
  // ==========================================
  const colGap = 15;
  const colWidth = (pageWidth - (margin * 2) - colGap) / 2;
  const startY = y;

  // --- LEFT: STUDENT PROFILE ---
  doc.setFontSize(10);
  doc.setTextColor(...COL_BRAND);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT PROFILE", margin, y);
  
  y += 3;
  doc.setDrawColor(...COL_LINE);
  doc.line(margin, y, margin + colWidth, y);
  y += 8;

  const student = complaint.profile || {};
  const studentData = [
    { label: "Full Name", value: student.name },
    { label: "Roll Number", value: student.roll_no },
    { label: "Room / Bed", value: student.room_number },
    { label: "Course & Year", value: `${student.course || '-'} (${student.year || '-'})` },
    { label: "Contact No.", value: student.phone },
  ];

  // Render Left Column
  let leftY = y;
  studentData.forEach(item => {
    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COL_LABEL);
    doc.text(item.label.toUpperCase(), margin, leftY);
    
    // Value
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COL_DARK);
    const val = item.value || "N/A";
    doc.text(String(val), margin, leftY + 4);
    
    leftY += 12; // Spacing per item
  });

  // --- RIGHT: TICKET DATA ---
  y = startY; // Reset Y top
  const rightX = margin + colWidth + colGap;

  doc.setFontSize(10);
  doc.setTextColor(...COL_BRAND);
  doc.setFont("helvetica", "bold");
  doc.text("TICKET METADATA", rightX, y);
  
  y += 3;
  doc.line(rightX, y, pageWidth - margin, y);
  y += 8;

  const ticketData = [
    { label: "Category", value: complaint.category || "General" },
    { label: "Severity", value: (complaint.severity || "Normal").toUpperCase() },
    { label: "Date Filed", value: formatDate(complaint.submitted_at) },
    { label: "Status", value: (complaint.status || "Pending").toUpperCase() },
  ];

  // Render Right Column
  let rightY = y;
  ticketData.forEach(item => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COL_LABEL);
    doc.text(item.label.toUpperCase(), rightX, rightY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COL_DARK);
    doc.text(String(item.value), rightX, rightY + 4);
    
    rightY += 12;
  });

  // Align Y to the bottom of the tallest column
  y = Math.max(leftY, rightY) + 10;

  // ==========================================
  // 3. DESCRIPTION BOX
  // ==========================================
  doc.setFontSize(10);
  doc.setTextColor(...COL_BRAND);
  doc.setFont("helvetica", "bold");
  doc.text("ISSUE DESCRIPTION", margin, y);
  
  y += 4;
  
  // Calculate Box Height
  const descText = complaint.description || "No details provided.";
  const descWidth = pageWidth - (margin * 2) - 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const splitDesc = doc.splitTextToSize(descText, descWidth);
  const boxHeight = (splitDesc.length * 5) + 10; // Dynamic height based on lines

  // Draw Box
  doc.setFillColor(...COL_BG);
  doc.setDrawColor(...COL_LINE);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), boxHeight, 2, 2, "FD");

  // Print Text inside box
  doc.setTextColor(...COL_TEXT);
  doc.text(splitDesc, margin + 5, y + 7);

  y += boxHeight + 20;

  // ==========================================
  // 4. OFFICIAL TIMELINE
  // ==========================================
  doc.setFontSize(10);
  doc.setTextColor(...COL_BRAND);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL ACTION TIMELINE", margin, y);
  
  y += 3;
  doc.setDrawColor(...COL_LINE);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Prepare Events
  const timelineEvents = [];
  
  // 1. Raised
  timelineEvents.push({
    title: "Complaint Raised",
    actor: "",
    date: complaint.submitted_at,
    color: COL_LABEL,
    icon: "circle"
  });

  // 2. Acknowledged
  if (complaint.acknowledged_at || complaint.ack_staff?.name) {
    timelineEvents.push({
      title: "Acknowledged",
      actor: complaint.ack_staff?.name ? `Staff: ${complaint.ack_staff.name}` : "Staff (System)",
      date: complaint.acknowledged_at,
      color: COL_BRAND,
      icon: "dot"
    });
  }

  // 3. Resolved
  if (complaint.resolved_at || complaint.resolved_staff?.name) {
    timelineEvents.push({
      title: "Resolved & Closed",
      actor: complaint.resolved_staff?.name ? `Staff: ${complaint.resolved_staff.name}` : "Staff (System)",
      date: complaint.resolved_at,
      color: COL_SUCCESS,
      icon: "check"
    });
  }

  // Draw Timeline
  const lineX = margin + 4;
  
  // Connector Line
  if (timelineEvents.length > 1) {
    let totalHeight = 0;
    timelineEvents.forEach(e => { totalHeight += 18; });
    const lastEventY = y + totalHeight - 18;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(lineX, y, lineX, lastEventY);
  }

  // Render Events
  timelineEvents.forEach((event) => {
    // Icon
    doc.setFillColor(...event.color);
    if (event.icon === "check") {
        doc.circle(lineX, y, 2, "F");
    } else {
        doc.circle(lineX, y, 2, "F");
        if(event.icon === "dot") {
            doc.setFillColor(255,255,255);
            doc.circle(lineX, y, 0.8, "F");
        }
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COL_DARK);
    doc.text(event.title, lineX + 10, y + 1);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COL_TEXT);
    const dateStr = formatDate(event.date);
    doc.text(dateStr, pageWidth - margin, y + 1, { align: "right" });

    // Actor
    if (event.actor) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(...COL_LABEL);
        doc.text(event.actor, lineX + 10, y + 6);
    }

    y += 18;
  });

  // ==========================================
  // 5. OFFICIAL CLOSING NOTE (New Section)
  // ==========================================
  // ✅ Explicitly fetch 'closing_note'
  const closingNote = complaint.closing_note; 

  if (closingNote && closingNote.trim() !== "") {
    y += 5; // Add some breathing room after timeline

    doc.setFontSize(10);
    doc.setTextColor(...COL_SUCCESS); // Use Green/Success color to indicate resolution info
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RESOLUTION NOTE", margin, y);
    
    y += 4;

    // Calculate Box Height
    const noteWidth = pageWidth - (margin * 2) - 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitNote = doc.splitTextToSize(closingNote, noteWidth);
    const noteHeight = (splitNote.length * 5) + 10;

    // Draw Background Box (Light Green for distinction)
    doc.setFillColor(...COL_NOTE_BG);
    doc.setDrawColor(...COL_SUCCESS); // Green border
    doc.roundedRect(margin, y, pageWidth - (margin * 2), noteHeight, 2, 2, "FD");

    // Print Note
    doc.setTextColor(20, 83, 45); // Dark Green Text
    doc.text(splitNote, margin + 5, y + 7);
    
    y += noteHeight + 10;
  }

  // ==========================================
  // 6. FOOTER
  // ==========================================
  const footerY = pageHeight - 15;
  
  doc.setDrawColor(...COL_LINE);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COL_LABEL);
  doc.text("Generated by Echo Hostel Management System", margin, footerY);
  
  const now = new Date().toLocaleString();
  doc.text(`Timestamp: ${now}`, pageWidth - margin, footerY, { align: "right" });

  // Save
  const safeName = (student.name || "record").replace(/[^a-z0-9]/gi, '_');
  doc.save(`Echo_Record_${safeName}_${complaint.id.substring(0,6)}.pdf`);
};

// Keep helper for tables
export const generateTablePDF = (options) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Allow popups to print table.");
  
  const headers = options.columns.map(c => `<th style="text-align:left; border-bottom:2px solid #ddd; padding:8px;">${c}</th>`).join('');
  const rows = options.rows.map(r => 
    `<tr>${r.map(d => `<td style="border-bottom:1px solid #eee; padding:8px;">${d||'-'}</td>`).join('')}</tr>`
  ).join('');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${options.title}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 30px; color: #333; }
          h2 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th { color: #555; font-weight: bold; text-transform: uppercase; font-size: 12px; }
        </style>
      </head>
      <body>
        <h2>${options.title}</h2>
        <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
        <script>window.onload=()=>{window.print();window.close();}</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};