import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import * as Icon from "./Icons"; 
// ✅ Import the new PDF utility
import { generateOutingChartPDF } from "../utils/generateOutingChartPDF";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function OutingChart({ gender, outings }) {
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState("week");
  const [downloading, setDownloading] = useState(false);

  const SCREEN_COLORS = { text: "#94a3b8", grid: "rgba(148, 163, 184, 0.1)" };

  useEffect(() => {
    if (!outings || outings.length === 0) {
      setChartData(null);
      return;
    }

    const now = new Date();
    let startDate = new Date();
    
    if (view === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (view === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (view === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = null; // All time
    }

    const filteredData = outings.filter(o => {
      if (!startDate) return true;
      return new Date(o.submitted_at) >= startDate;
    });

    let labels = [];
    let dataMap = {};

    if (view === "week") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      filteredData.forEach(o => {
        const d = new Date(o.submitted_at);
        const index = d.getDay() === 0 ? 6 : d.getDay() - 1;
        dataMap[labels[index]] = (dataMap[labels[index]] || 0) + 1;
      });
    } else if (view === "month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      filteredData.forEach(o => {
        const d = new Date(o.submitted_at);
        const day = d.getDate().toString();
        dataMap[day] = (dataMap[day] || 0) + 1;
      });
    } else if (view === "year") {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      filteredData.forEach(o => {
        const d = new Date(o.submitted_at);
        const month = labels[d.getMonth()];
        dataMap[month] = (dataMap[month] || 0) + 1;
      });
    } else {
      filteredData.forEach(o => {
        const year = new Date(o.submitted_at).getFullYear().toString();
        if (!labels.includes(year)) labels.push(year);
        dataMap[year] = (dataMap[year] || 0) + 1;
      });
      labels.sort();
    }

    const counts = labels.map(l => dataMap[l] || 0);
    const barColor = gender === "Male" ? "#6366f1" : (gender === "Female" ? "#ec4899" : "#8b5cf6");

    setChartData({
      labels,
      datasets: [{
        label: "Requests",
        data: counts,
        backgroundColor: barColor,
        borderRadius: 6,
        barThickness: view === 'month' ? 6 : 'flex',
        maxBarThickness: 40
      }]
    });
  }, [gender, view, outings]);

  // ✅ Theme Color Logic (Reused for UI)
  const uiBarColor = gender === "Male" ? "#6366f1" : (gender === "Female" ? "#ec4899" : "#8b5cf6");

  // ✅ New Download Handler
  const handleDownload = () => {
    if (!chartData) return;
    setDownloading(true);
    try {
      generateOutingChartPDF(chartData, view, gender);
    } catch (err) {
      console.error("PDF Generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false }, ticks: { color: SCREEN_COLORS.text } },
      y: { grid: { color: SCREEN_COLORS.grid, borderDash: [4, 4] }, ticks: { precision: 0 }, beginAtZero: true }
    },
  };

  return (
    <div className="glass-card">
      <div className="chart-header">
        <h3 className="chart-title">Outing Trends</h3>
        <div className="chart-controls">
          <div className="view-switcher">
            {['week', 'month', 'year', 'all'].map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v)} 
                className={`view-btn ${view === v ? 'active' : ''}`} 
                style={{ backgroundColor: view === v ? uiBarColor : 'transparent' }}
              >
                {v}
              </button>
            ))}
          </div>
          <button 
            onClick={handleDownload} 
            disabled={downloading || !chartData} 
            className="icon-btn"
            title="Download Chart PDF"
          >
            {downloading ? "..." : <Icon.Download />}
          </button>
        </div>
      </div>
      <div className="chart-container" style={{ height: '200px' }}>
        {chartData ? <Bar data={chartData} options={options} /> : <div className="state-message">No activity found.</div>}
      </div>
    </div>
  );
}