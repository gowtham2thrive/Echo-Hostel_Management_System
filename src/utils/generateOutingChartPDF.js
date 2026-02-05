import jsPDF from "jspdf";

export const generateOutingChartPDF = (chartData, view, gender) => {
  if (!chartData) return;

  // --- 1. CONFIGURATION ---
  const doc = new jsPDF("l", "mm", "a4"); // Landscape
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Modern SaaS Color Palette
  const colors = {
    male: [99, 102, 241],     // Indigo-500
    female: [236, 72, 153],   // Pink-500
    all: [139, 92, 246],      // Violet-500
    textMain: [30, 41, 59],   // Slate-800
    textMuted: [100, 116, 139], // Slate-500
    border: [226, 232, 240],  // Slate-200
    bgBody: [248, 250, 252],  // Slate-50
    white: [255, 255, 255]
  };

  // Determine Primary Brand Color
  const primary = gender === "Male" ? colors.male : (gender === "Female" ? colors.female : colors.all);

  // Helpers
  const setFill = (c) => doc.setFillColor(...c);
  const setText = (c) => doc.setTextColor(...c);
  const setDraw = (c) => doc.setDrawColor(...c);

  // --- 2. BASE LAYOUT ---
  
  // Page Background
  setFill(colors.bgBody);
  doc.rect(0, 0, width, height, "F");

  // Top Navigation Bar
  setFill(colors.white);
  doc.rect(0, 0, width, 22, "F");
  setDraw(colors.border);
  doc.setLineWidth(0.5);
  doc.line(0, 22, width, 22);

  // --- 3. HEADER CONTENT ---
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setText(colors.textMain);
  doc.text("Outing Trends Analytics", 15, 12);

  // Metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(colors.textMuted);
  const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${dateStr}  |  View: ${view.toUpperCase()}`, width - 15, 12, { align: "right" });

  // Accent Line
  setFill(primary);
  doc.rect(15, 16, 10, 1, "F");


  // --- 4. KPI METRICS ---
  
  const data = chartData.datasets[0].data;
  const labels = chartData.labels;
  const total = data.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / (data.length || 1));
  const maxVal = Math.max(...data, 0);

  const drawStatCard = (label, value, x) => {
    setFill(colors.white);
    setDraw(colors.border);
    doc.roundedRect(x, 32, 60, 24, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setText(colors.textMuted);
    doc.text(label.toUpperCase(), x + 8, 41);

    doc.setFontSize(14);
    setText(colors.textMain);
    doc.text(String(value), x + 8, 50);
  };

  drawStatCard("Total Requests", total, 15);
  drawStatCard("Average Volume", avg, 80);
  drawStatCard("Peak Activity", maxVal, 145);


  // --- 5. CHART SECTION (FIXED LAYOUT) ---

  // Card Dimensions
  const cardTop = 65;
  const cardBottom = height - 15;
  const cardLeft = 15;
  const cardWidth = width - 30;

  // Chart Drawing Dimensions (Inside Card)
  // ✅ FIX: Moved chartTop down to 90 (was 75) to give title breathing room
  const chartTop = 90; 
  const chartBottom = cardBottom - 15; // Padding from bottom of card
  const chartHeight = chartBottom - chartTop;
  const chartLeft = 25;
  const chartRight = width - 20;
  const chartWidth = chartRight - chartLeft;

  // Draw Chart Card
  setFill(colors.white);
  setDraw(colors.border);
  doc.roundedRect(cardLeft, cardTop, cardWidth, cardBottom - cardTop + 10, 3, 3, "FD");

  // Chart Title (Safe position)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setText(colors.textMain);
  doc.text("Activity Breakdown", 25, 76);

  // Horizontal Grid Lines & Y-Axis
  setDraw(colors.border);
  doc.setLineWidth(0.1);
  const steps = 5;
  
  for (let i = 0; i <= steps; i++) {
    const y = chartBottom - ((chartHeight / steps) * i);
    
    // Draw Grid Line
    if (i !== 0) doc.line(chartLeft, y, chartRight, y);
    
    // Y-Axis Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setText(colors.textMuted);
    const yValue = Math.round((maxVal / steps) * i);
    doc.text(String(yValue), chartLeft - 4, y + 1, { align: "right" });
  }

  // Draw X-Axis Line
  setDraw(colors.textMuted); 
  doc.setLineWidth(0.2);
  doc.line(chartLeft, chartBottom, chartRight, chartBottom);


  // --- 6. DRAW BARS ---
  
  const barCount = data.length;
  const slotWidth = chartWidth / barCount;
  const barWidth = Math.min(slotWidth * 0.6, 20); 
  const spacing = (slotWidth - barWidth) / 2;

  data.forEach((val, i) => {
    // Height Math
    const barH = (val / (maxVal || 1)) * chartHeight;
    const x = chartLeft + (i * slotWidth) + spacing;
    const y = chartBottom - barH;

    if (val > 0) {
        setFill(primary);
        doc.rect(x, y, barWidth, barH, "F");

        // Value Label (Top of bar)
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        setText(colors.textMain);
        doc.text(String(val), x + (barWidth / 2), y - 2, { align: "center" });
    }

    // X-Axis Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setText(colors.textMuted);
    
    let label = String(labels[i]);
    if (barCount > 15) label = label.substring(0, 3);
    
    doc.text(label, x + (barWidth / 2), chartBottom + 6, { align: "center" });
  });

  // Footer
  doc.setFontSize(7);
  setText(colors.border); 
  doc.text("Echo System Generated Report", width - 20, height - 5, { align: "right" });

  doc.save(`Echo_Analytics_${gender}_${view}.pdf`);
};