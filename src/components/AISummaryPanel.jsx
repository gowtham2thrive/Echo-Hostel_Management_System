import { useState, useEffect, useMemo } from "react";
import { aiService } from "../services/api"; 
import { COMPLAINT_STATUS } from "../constants";
import { useToast } from "../context/ToastContext"; 
import { 
  AlertCircle, TrendingUp, Check, CheckCheck, 
  Utensils, Droplet, Wrench, FileText, ShieldAlert, Loader2,
  Cpu, RefreshCw
} from "lucide-react";

export default function AISummaryPanel({ complaints = [], onBatchAction }) {
  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const toast = useToast();
  
  const genderContext = complaints.length > 0 ? complaints[0].profile?.gender : null;

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const loadStored = async () => {
        try {
            const stored = await aiService.fetchStoredSummaries(genderContext);
            if (stored && stored.length > 0) {
                setAiData(stored);
            }
        } catch (e) {
            console.error("Failed to load stored summaries", e);
        }
    };
    loadStored();
  }, [genderContext]);

  // --- 2. REGENERATE HANDLER ---
  const handleRegenerate = async () => {
    setLoadingAi(true);
    try {
        const pendingComplaints = complaints.filter(c => c.status === COMPLAINT_STATUS.SUBMITTED);
        
        if (pendingComplaints.length === 0) {
            toast.info("Up to Date", "No submitted complaints to analyze.");
            setLoadingAi(false);
            return;
        }

        const newSummaries = await aiService.generateSummary(pendingComplaints);
        
        if (newSummaries) {
            await aiService.saveSummaries(newSummaries, genderContext);
            setAiData(newSummaries);
            toast.success("Analysis Complete", "Fresh insights generated successfully.");
        }
    } catch (err) {
        console.error("AI Generation Failed:", err);
        toast.error("Generation Failed", err.message || "Could not save summaries to database.");
    } finally {
        setLoadingAi(false);
    }
  };

  // --- 3. SMART ENGINE ---
  const insights = useMemo(() => {
    const getDynamicMeta = (category) => {
        const matching = complaints.filter(c => 
            (c.category || "").toLowerCase() === (category || "").toLowerCase() &&
            c.status === COMPLAINT_STATUS.SUBMITTED
        );
        return {
            count: matching.length,
            ids: matching.map(c => c.id)
        };
    };

    if (aiData && aiData.length > 0) {
      return aiData.map(item => {
        const meta = getDynamicMeta(item.category);
        if (meta.count === 0) return null; 

        return {
            type: 'ai_generated',
            title: `${item.category} Issues`,
            desc: item.summary || item.description, 
            category: item.category,
            count: meta.count,
            ids: meta.ids, 
            color: meta.count > 3 ? "red" : "blue"
        };
      }).filter(Boolean).sort((a, b) => b.count - a.count);
    }

    return null; 
  }, [complaints, aiData]);

  // --- HELPER: ICONS ---
  const getCategoryIcon = (category) => {
    const lower = category?.toLowerCase() || "";
    if (lower.includes("hygiene") || lower.includes("net")) return <Droplet size={18} />;
    if (lower.includes("food") || lower.includes("mess")) return <Utensils size={18} />;
    if (lower.includes("discipline") || lower.includes("light")) return <ShieldAlert size={18} />;
    if (lower.includes("water") || lower.includes("plumb")) return <Droplet size={18} />;
    if (lower.includes("maintenance") || lower.includes("repair")) return <Wrench size={18} />;
    if (lower.includes("critical")) return <ShieldAlert size={18} />;
    return <FileText size={18} />;
  };

  // --- EMPTY STATE ---
  if (!insights || insights.length === 0) {
     if(loadingAi) return <div className="ai-wrapper"><div style={{padding:20, textAlign:'center'}}>Analyzing...</div></div>;
     
     return (
        <div className="ai-wrapper empty-state">
             <Cpu size={32} style={{opacity:0.3}} />
             <p>No active patterns detected.</p>
             {/* ✅ RESTORED: Small pill-shaped button from uploaded file style */}
             <button className="regen-btn-small" onClick={handleRegenerate}>
                 <RefreshCw size={14} /> Analyze
             </button>
        </div>
     );
  }

  // --- CARD COMPONENT ---
  const InsightCard = ({ data, index }) => {
    const isRed = data.color === "red";
    const bgClass = isRed ? "bg-critical" : "bg-info";
    const isTop3 = index < 3;

    return (
        <div className={`insight-card ${bgClass}`}>
            <div className="card-top">
                <div className="badges-wrapper">
                   {isTop3 && (
                      <div className="icon-badge trending"><TrendingUp size={18} /></div>
                   )}
                   <div className="icon-badge category">
                      {data.type === 'critical' ? <AlertCircle size={18} /> : getCategoryIcon(data.category)}
                   </div>
                </div>
                <span className="count-badge">{data.count}</span>
            </div>
            
            <div className="card-content">
                <h5>{data.title}</h5>
                <p title={data.desc}>{data.desc}</p> 
            </div>

            <div className="card-actions">
                <button 
                    className="action-btn ack-btn"
                    onClick={() => onBatchAction(data.ids, COMPLAINT_STATUS.ACKNOWLEDGED)}
                    title="Acknowledge All"
                >
                    <Check size={20} strokeWidth={3} />
                </button>
                <div className="divider-v"></div>
                <button 
                    className="action-btn resolve-btn"
                    onClick={() => onBatchAction(data.ids, "BATCH_RESOLVE_INTENT")} 
                    title="Resolve All"
                >
                    <CheckCheck size={20} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="ai-wrapper animate-fade">
      <div className="ai-header">
         <div className="title-section">
            <div className="icon-box-ai"><Cpu size={20} /></div>
            <div>
               <h3>Live Intelligence</h3>
               <span className="subtitle">AI-driven pattern detection</span>
            </div>
         </div>
         
         <div className="header-actions">
             <div className="live-indicator">
                {loadingAi ? <Loader2 size={14} className="animate-spin text-primary" /> : <span className="dot"></span>}
                <span className="text-xs font-bold text-primary">
                    {loadingAi ? "Analyzing..." : "Live"}
                </span>
             </div>

             {/* ✅ FIXED: Changed from icon-only to clear text button */}
             <button 
                className="regen-btn-header" 
                onClick={handleRegenerate} 
                disabled={loadingAi}
             >
                <RefreshCw size={16} className={loadingAi ? "animate-spin" : ""} />
             </button>
         </div>
      </div>

      <div className="insights-grid">
         {insights.map((group, idx) => (
            <InsightCard key={idx} data={group} index={idx} />
         ))}
      </div>

      <style>{`
        /* PRESERVED STYLES */
        .ai-wrapper {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 24px; padding: 24px; margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.05);
            backdrop-filter: blur(12px);
        }
        .ai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .title-section { display: flex; align-items: center; gap: 12px; }
        .icon-box-ai { 
            width: 42px; height: 42px; border-radius: 12px; 
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); 
            color: #8b5cf6; display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .ai-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
        .subtitle { font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 2px; }
        
        .header-actions { display: flex; align-items: center; gap: 10px; }
        .live-indicator { 
            display: flex; align-items: center; gap: 6px; 
            background: rgba(var(--primary-rgb), 0.1); padding: 4px 10px; border-radius: 20px;
        }
        .dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 8px var(--primary); animation: pulse 2s infinite; }

        /* ✅ ADDED: New Header Button Style (Clear & Clickable) */
        .regen-btn-header {
            height: 36px; padding: 0 16px; border-radius: 18px; border: none;
            background: var(--glass-field-bg); color: var(--text-main);
            display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.85rem;
            cursor: pointer; transition: 0.2s;
            border: 1px solid var(--glass-border);
        }
        .regen-btn-header:hover { background: var(--glass-border); color: var(--primary); transform: translateY(-1px); }
        .regen-btn-header:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* OLD ROUND BUTTON STYLE (Removed/Deprecated to fix UI) */
        /* .icon-btn-round { ... } */

        /* ✅ RESTORED: Empty State & Small Button Styles */
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--text-muted); padding: 20px 0; }
        .regen-btn-small { 
            background: var(--glass-border); border: none; padding: 6px 12px; 
            border-radius: 20px; color: var(--text-main); cursor: pointer; display: flex; gap: 6px; align-items: center; font-size: 0.85rem;
        }
        .regen-btn-small:hover { background: var(--primary); color: white; }

        .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }

        .insight-card {
            border-radius: 18px; padding: 20px;
            display: flex; flex-direction: column; gap: 14px;
            border: 1px solid transparent;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .insight-card:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }

        .bg-critical { background: linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .bg-info { background: linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)); border-color: rgba(59, 130, 246, 0.3); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; min-height: 40px; }
        .badges-wrapper { display: flex; gap: 8px; }
        .icon-badge { 
            width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.1);
        }
        .icon-badge.trending { background: rgba(99, 102, 241, 0.2); color: #818cf8; border-color: rgba(99, 102, 241, 0.3); }
        .count-badge { font-size: 1.8rem; font-weight: 800; color: var(--text-main); line-height: 1; }

        .card-content h5 { margin: 0 0 6px 0; font-size: 1rem; font-weight: 700; color: var(--text-main); }
        .card-content p { 
            margin: 0; font-size: 0.85rem; color: var(--text-muted); 
            line-height: 1.5; opacity: 1; 
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }

        .card-actions { 
            margin-top: auto; padding-top: 14px; 
            display: flex; gap: 12px; align-items: center; justify-content: flex-end;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        @media (prefers-color-scheme: light) { .card-actions { border-top-color: rgba(0,0,0,0.1); } }

        .action-btn {
            width: 44px; height: 44px; border-radius: 12px; border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
        }
        .ack-btn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .resolve-btn { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .action-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .divider-v { width: 1px; height: 28px; background: rgba(255,255,255,0.15); }

        @media (prefers-color-scheme: light) {
            .ai-wrapper { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .bg-critical { background: #fff5f5; border-color: #fed7d7; }
            .bg-info { background: #f0f9ff; border-color: #bae6fd; }
            .ai-header h3 { color: #0f172a !important; }
            .subtitle { color: #64748b !important; }
            .card-content h5 { color: #1e293b !important; }
            .card-content p { color: #475569 !important; font-weight: 500 !important; }
            .count-badge { color: #0f172a !important; }
            .icon-badge { background: #ffffff !important; border: 1px solid #e2e8f0 !important; color: #475569 !important; }
            .icon-badge.trending { background: #f1f5f9 !important; color: #0f172a !important; border-color: #cbd5e1 !important; }
            .ack-btn { background: #fffbeb !important; border-color: #fbbf24 !important; color: #d97706 !important; }
            .resolve-btn { background: #ecfdf5 !important; border-color: #34d399 !important; color: #059669 !important; }
            .divider-v { background: #cbd5e1 !important; }
        }
      `}</style>
    </div>
  );
}