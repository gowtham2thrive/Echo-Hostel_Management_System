import jsPDF from "jspdf";

export const generateComplaintChartPDF = (chartData, view, gender, timeFilter) => {
  if (!chartData || chartData.empty) return;

  // --- 1. SETUP & THEME ---
  const doc = new jsPDF("l", "mm", "a4"); // Landscape
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Modern SaaS Color Palette
  const colors = {
    male: [99, 102, 241],     // Indigo-500
    female: [236, 72, 153],   // Pink-500
    all: [139, 92, 246],      // Violet-500
    pending: [245, 158, 11],  // Amber-500
    textMain: [30, 41, 59],   // Slate-800
    textMuted: [100, 116, 139], // Slate-500
    border: [226, 232, 240],  // Slate-200
    bgBody: [248, 250, 252],  // Slate-50
    white: [255, 255, 255]
  };

  // Select Primary Color
  let primary = gender === "Male" ? colors.male : colors.female;
  if (view === 'pending') primary = colors.pending; 

  const setFill = (c) => doc.setFillColor(...c);
  const setText = (c) => doc.setTextColor(...c);
  const setDraw = (c) => doc.setDrawColor(...c);

  // --- 2. LAYOUT ---
  setFill(colors.bgBody);
  doc.rect(0, 0, width, height, "F");

  // Top Nav
  setFill(colors.white);
  doc.rect(0, 0, width, 22, "F");
  setDraw(colors.border);
  doc.setLineWidth(0.5);
  doc.line(0, 22, width, 22);

  // --- 3. HEADER ---
  let reportTitle = "Complaints Analysis";
  if (view === "category") reportTitle = "Complaints by Category";
  if (view === "status") reportTitle = "Resolution Status Overview";
  if (view === "pending") reportTitle = "Pending Issues Report";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setText(colors.textMain);
  doc.text(reportTitle, 15, 12);

  // Metadata with Time Filter
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(colors.textMuted);
  const dateStr = new Date().toLocaleDateString();
  // ✅ Shows Time Filter in Header
  doc.text(`Generated: ${dateStr}  |  Group: ${gender}  |  Time: ${timeFilter}`, width - 15, 12, { align: "right" });

  setFill(primary);
  doc.rect(15, 16, 10, 1, "F");

  // --- 4. METRICS ---
  const data = chartData.datasets[0].data;
  const labels = chartData.labels;
  const total = data.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...data, 0);
  const maxIndex = data.indexOf(maxVal);
  const topLabel = labels[maxIndex] || "-";

  const drawStatCard = (label, value, x) => {
    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(x, 32, 60, 24, 2, 2, "FD");
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); setText(colors.textMuted);
    doc.text(label.toUpperCase(), x + 8, 41);
    doc.setFontSize(14); setText(colors.textMain);
    doc.text(String(value), x + 8, 50);
  };

  drawStatCard("Total Issues", total, 15);
  drawStatCard("Highest Count", maxVal, 80);
  drawStatCard("Top Category", topLabel.substring(0, 15), 145);

  // --- 5. CHART ---
  const chartTop = 90;
  const chartBottom = height - 25;
  const chartHeight = chartBottom - chartTop;
  const chartLeft = 25;
  const chartRight = width - 20;
  const chartWidth = chartRight - chartLeft;

  setFill(colors.white);
  setDraw(colors.border);
  doc.roundedRect(15, 65, width - 30, height - 75, 3, 3, "FD");

  doc.setFontSize(11); doc.setFont("helvetica", "bold"); setText(colors.textMain);
  doc.text("Visual Breakdown", 25, 76);

  setDraw(colors.border);
  doc.setLineWidth(0.1);
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = chartBottom - ((chartHeight / steps) * i);
    if (i !== 0) doc.line(chartLeft, y, chartRight, y);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); setText(colors.textMuted);
    const yValue = Math.round((maxVal / steps) * i);
    doc.text(String(yValue), chartLeft - 4, y + 1, { align: "right" });
  }

  setDraw(colors.textMuted); doc.setLineWidth(0.2);
  doc.line(chartLeft, chartBottom, chartRight, chartBottom);

  const barCount = data.length;
  const slotWidth = chartWidth / barCount;
  const barWidth = Math.min(slotWidth * 0.5, 25); 
  const spacing = (slotWidth - barWidth) / 2;

  const bgColors = chartData.datasets[0].backgroundColor;
  const getBarColor = (i) => {
    if (Array.isArray(bgColors)) {
       const hex = bgColors[i];
       const r = parseInt(hex.slice(1, 3), 16);
       const g = parseInt(hex.slice(3, 5), 16);
       const b = parseInt(hex.slice(5, 7), 16);
       return [r, g, b];
    }
    return primary;
  };

  data.forEach((val, i) => {
    const barH = (val / (maxVal || 1)) * chartHeight;
    const x = chartLeft + (i * slotWidth) + spacing;
    const y = chartBottom - barH;

    if (val > 0) {
        setFill(getBarColor(i));
        doc.rect(x, y, barWidth, barH, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); setText(colors.textMain);
        doc.text(String(val), x + (barWidth / 2), y - 2, { align: "center" });
    }

    doc.setFontSize(8); doc.setFont("helvetica", "normal"); setText(colors.textMuted);
    let label = String(labels[i]);
    if (label.length > 12) label = label.substring(0, 10) + "..";
    doc.text(label, x + (barWidth / 2), chartBottom + 6, { align: "center" });
  });

  doc.setFontSize(7); setText(colors.border);
  doc.text("Echo Management System • Confidential", width - 20, height - 5, { align: "right" });
  
  doc.save(`Echo_Complaints_${gender}_${view}_${timeFilter.replace(/\s/g, '')}.pdf`);
};