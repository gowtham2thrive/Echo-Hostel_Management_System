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
import { supabase } from "../supabaseClient";
import * as Icon from "./Icons";
import { generateComplaintChartPDF } from "../utils/generateComplaintChartPDF";
import GlassDropdown from "./ui/GlassDropdown";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Complaints_chart({ gender }) {
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState("category"); 
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [downloading, setDownloading] = useState(false);

  const SCREEN_COLORS = {
    text: "#94a3b8",
    grid: "rgba(148, 163, 184, 0.1)",
  };

  const timeOptions = [
    { value: "All Time", label: "All Time" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
    { value: "This Year", label: "This Year" }
  ];

  useEffect(() => { loadAnalytics(); }, [gender, view, timeFilter]);

  async function loadAnalytics() {
    // --- DEMO MODE GENERATOR ---
    if (sessionStorage.getItem('demo_mode') === 'true') {
        const categories = ['Maintenance', 'Food', 'Hygiene', 'Discipline', 'other'];
        const statuses = ['submitted', 'acknowledged', 'resolved'];
        const demoData = [];
        const now = new Date();

        // Generate 45 Mock Complaints distributed over the last year
        for (let i = 0; i < 45; i++) {
            const randomDaysAgo = Math.floor(Math.random() * 365);
            const date = new Date();
            date.setDate(now.getDate() - randomDaysAgo);
            
            demoData.push({
                category: categories[Math.floor(Math.random() * categories.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                user_id: `user_${i}`,
                submitted_at: date.toISOString(),
                // Mock gender distribution (approx 50/50)
                gender: Math.random() > 0.5 ? 'Male' : 'Female'
            });
        }

        // Apply Time Filter
        let filtered = demoData;
        if (timeFilter !== "All Time") {
            let startDate = new Date();
            if (timeFilter === "This Week") {
                const day = now.getDay(); 
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                startDate.setDate(diff); startDate.setHours(0,0,0,0);
            } else if (timeFilter === "This Month") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (timeFilter === "This Year") startDate = new Date(now.getFullYear(), 0, 1);
            
            filtered = demoData.filter(d => new Date(d.submitted_at) >= startDate);
        }

        // Apply Gender Filter
        const finalData = filtered.filter(d => d.gender === gender);
        
        if (finalData.length === 0) {
            setChartData({ empty: true, message: `No ${gender} data for ${timeFilter}.` });
            return;
        }

        // Build Chart Data
        if (view === "category") {
            const counts = {};
            finalData.forEach(d => counts[d.category] = (counts[d.category] || 0) + 1);
            setChartData({
                labels: Object.keys(counts),
                datasets: [{ 
                    label: "Complaints", data: Object.values(counts), 
                    backgroundColor: gender === "Male" ? "#6366f1" : "#ec4899", 
                    borderRadius: 6, barThickness: 30 
                }],
            });
        } else if (view === "pending") {
            const counts = {};
            finalData.filter(d => d.status === 'submitted').forEach(d => counts[d.category] = (counts[d.category] || 0) + 1);
            if (Object.keys(counts).length === 0) { setChartData({ empty: true, message: "No pending issues!" }); return; }
            setChartData({
                labels: Object.keys(counts),
                datasets: [{ 
                    label: "Pending", data: Object.values(counts), 
                    backgroundColor: "#f59e0b", borderRadius: 6, barThickness: 30 
                }],
            });
        } else {
            const counts = { submitted: 0, acknowledged: 0, resolved: 0 };
            finalData.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
            setChartData({
                labels: ["Pending", "Acknowledged", "Resolved"],
                datasets: [{ 
                    label: "Count", data: [counts.submitted, counts.acknowledged, counts.resolved], 
                    backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"], 
                    borderRadius: 6, barThickness: 40 
                }],
            });
        }
        return;
    }
    // ---------------------------

    try {
      const { data: rawData, error } = await supabase
        .from("complaints")
        .select("category, status, user_id, submitted_at"); 
      
      if (error) { console.error(error); throw error; }

      if (!rawData || rawData.length === 0) { 
        setChartData({ empty: true, message: "No complaints found." }); 
        return; 
      }

      const now = new Date();
      let filteredByTime = rawData;

      if (timeFilter !== "All Time") {
        let startDate = new Date();
        if (timeFilter === "This Week") {
            const day = now.getDay(); 
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0,0,0,0);
        } else if (timeFilter === "This Month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (timeFilter === "This Year") {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        
        filteredByTime = rawData.filter(d => {
            if (!d.submitted_at) return true; 
            return new Date(d.submitted_at) >= startDate;
        });
      }

      if (filteredByTime.length === 0) {
        setChartData({ empty: true, message: `No data for ${timeFilter}.` });
        return;
      }

      const userIds = [...new Set(filteredByTime.map(d => d.user_id))];
      const { data: profiles, error: profileError } = await supabase
        .from("students") 
        .select("id, gender")
        .in("id", userIds);

      if (profileError) throw profileError;

      const genderMap = {};
      profiles?.forEach(p => genderMap[p.id] = p.gender);

      const finalData = filteredByTime.filter(d => genderMap[d.user_id] === gender);

      if (finalData.length === 0) {
         setChartData({ empty: true, message: `No ${gender} data found.` });
         return;
      }

      if (view === "category") {
        const counts = {};
        finalData.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
        
        setChartData({
          labels: Object.keys(counts),
          datasets: [{ 
            label: "Total Complaints", 
            data: Object.values(counts), 
            backgroundColor: gender === "Male" ? "#6366f1" : "#ec4899", 
            borderRadius: 6, 
            barThickness: 30 
          }],
        });
      } else if (view === "pending") {
        const counts = {};
        const pendingItems = finalData.filter(d => d.status === 'submitted');
        pendingItems.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
        const labels = Object.keys(counts);
        
        if (labels.length === 0) { 
            setChartData({ empty: true, message: "No pending issues!" }); 
            return; 
        }

        setChartData({
          labels: labels,
          datasets: [{ 
            label: "Pending Issues", 
            data: Object.values(counts), 
            backgroundColor: "#f59e0b", 
            borderRadius: 6, 
            barThickness: 30 
          }],
        });
      } else {
        const counts = { submitted: 0, acknowledged: 0, resolved: 0 };
        finalData.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
        
        setChartData({
          labels: ["Pending", "Acknowledged", "Resolved"],
          datasets: [{ 
            label: "Count", 
            data: [counts.submitted, counts.acknowledged, counts.resolved], 
            backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"], 
            borderRadius: 6, 
            barThickness: 40 
          }],
        });
      }
    } catch (err) { 
      console.error("Analytics Error:", err); 
      setChartData({ empty: true, message: "Error loading data." });
    }
  }

  const handleDownload = () => {
    if (!chartData || chartData.empty) return;
    setDownloading(true);
    try {
        generateComplaintChartPDF(chartData, view, gender, timeFilter);
    } catch (e) { console.error(e); } finally { setDownloading(false); }
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "rgba(15, 23, 42, 0.9)", cornerRadius: 8 } },
    scales: { 
        x: { grid: { display: false }, ticks: { color: SCREEN_COLORS.text } }, 
        y: { grid: { color: SCREEN_COLORS.grid, borderDash: [4, 4] }, ticks: { color: SCREEN_COLORS.text, precision: 0 }, beginAtZero: true } 
    },
  };

  const activeColor = gender === 'Male' ? '#6366f1' : '#ec4899';

  return (
    <div className="glass-card">
      <div className="chart-header">
        <h3 className="chart-title">Analytics</h3>
        
        <div className="chart-controls" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 130 }}>
             <GlassDropdown options={timeOptions} value={timeFilter} onChange={setTimeFilter} compact />
          </div>

          <div className="view-switcher">
            <button onClick={() => setView('category')} className={`view-btn ${view === 'category' ? 'active' : ''}`} style={{ backgroundColor: view === 'category' ? activeColor : 'transparent' }}>All</button>
            <button onClick={() => setView('pending')} className={`view-btn ${view === 'pending' ? 'active' : ''}`} style={{ backgroundColor: view === 'pending' ? '#f59e0b' : 'transparent', color: view === 'pending' ? '#fff' : 'var(--text-muted)' }}>Pending</button>
            <button onClick={() => setView('status')} className={`view-btn ${view === 'status' ? 'active' : ''}`} style={{ backgroundColor: view === 'status' ? activeColor : 'transparent' }}>Status</button>
          </div>
          
          <button onClick={handleDownload} disabled={downloading || !chartData || chartData.empty} className="icon-btn">
            {downloading ? "..." : <Icon.Download />}
          </button>
        </div>
      </div>
      <div className="chart-container">
        {chartData && !chartData.empty ? 
            <Bar data={chartData} options={options} /> : 
            <div className="state-message">{chartData?.message || "No analytics available."}</div>
        }
      </div>
    </div>
  );
}