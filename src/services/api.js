import { supabase } from "../supabaseClient";
import { COMPLAINT_STATUS, OUTING_STATUS } from "../constants";

// Helper to check demo mode safely
const isDemoMode = () => sessionStorage.getItem('demo_mode') === 'true';

export const complaintService = {
  async fetchAll(userId = null, page = 1, limit = 20) {
    if (isDemoMode()) return { data: [], count: 0 }; 
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("complaints")
      .select(`
        *,
        profile:students(*),
        resolved_staff:staff!fk_complaints_resolved_staff(id, name, email, phone, designation),
        ack_staff:staff!fk_complaints_ack_staff(id, name, email, phone, designation)
      `, { count: "exact" }) 
      .order("submitted_at", { ascending: false }) 
      .range(from, to);

    if (userId) query = query.eq("user_id", userId);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, count };
  },

  async create(complaintData, userId) {
    if (isDemoMode()) return; 
    const { error } = await supabase.from("complaints").insert({
      user_id: userId,
      category: complaintData.category,
      severity: complaintData.severity,
      description: complaintData.description.trim(),
      status: COMPLAINT_STATUS.SUBMITTED,
      submitted_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async updateStatus(complaintId, status, staffId, note = null) {
    if (isDemoMode()) return; 
    const updatePayload = { status };
    const now = new Date().toISOString();
    
    if (status === COMPLAINT_STATUS.ACKNOWLEDGED) {
        updatePayload.acknowledged_by_id = staffId;
        updatePayload.acknowledged_at = now;
    } else if (status === COMPLAINT_STATUS.RESOLVED) {
        updatePayload.resolved_by_id = staffId;
        updatePayload.resolved_at = now;
        if (note) updatePayload.closing_note = note; 
    }

    const { error } = await supabase
      .from("complaints")
      .update(updatePayload)
      .eq("id", complaintId);

    if (error) throw error;
  }
};

export const outingService = {
  async fetchAll(userId = null, page = 1, limit = 20) {
    if (isDemoMode()) return { data: [], count: 0 };
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("outing_requests")
      .select(`
        *,
        profile:students!outing_requests_user_id_fkey(*),
        approver:staff!outing_requests_approved_by_fkey(id, name, email, phone, designation)
      `, { count: "exact" })
      .order("submitted_at", { ascending: false }) 
      .range(from, to);

    if (userId) query = query.eq("user_id", userId);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, count };
  },

  async fetchActive() {
    if (isDemoMode()) return []; 
    const { data, error } = await supabase
      .from("outing_requests")
      .select("user_id, status, return_time") 
      .eq("status", OUTING_STATUS.APPROVED);
      
    if (error) throw error;
    return data || [];
  },

  async create(outingData, userId) {
    if (isDemoMode()) return;
    let isoTimestamp = null;
    if (outingData.return_date && outingData.return_time) {
        const combined = new Date(`${outingData.return_date}T${outingData.return_time}`);
        if (!isNaN(combined.getTime())) {
            isoTimestamp = combined.toISOString();
        }
    }

    const { error } = await supabase.from("outing_requests").insert({
      user_id: userId,
      submitted_at: new Date().toISOString(),
      return_date: isoTimestamp, 
      return_time: isoTimestamp,
      purpose: outingData.purpose.trim(),
      status: OUTING_STATUS.SUBMITTED
    });
    if (error) throw error;
  },

  async updateStatus(outingId, status, staffId) {
    if (isDemoMode()) return;
    const { error } = await supabase
      .from("outing_requests")
      .update({ 
        status, 
        approved_by: staffId, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", outingId);

    if (error) throw error;
  }
};

export const aiService = {
  async fetchStoredSummaries(gender = null) {
    if (isDemoMode()) {
        // ✅ FIXED: Return summaries that match the new Demo Complaints (Maintenance, Hygiene)
        return [
            { id: 1, category: 'Maintenance', summary: 'DEMO: High frequency of window repairs reported in Block A.', generated_at: new Date().toISOString() },
            { id: 2, category: 'Hygiene', summary: 'DEMO: Multiple requests for washroom cleaning on the 2nd floor.', generated_at: new Date().toISOString() },
            { id: 3, category: 'Food', summary: 'DEMO: Consistent feedback about lunch quality on weekends.', generated_at: new Date().toISOString() }
        ];
    }
    let query = supabase.from('category_summaries').select('*');
    if (gender) query = query.eq('gender', gender);
    const { data, error } = await query.order('generated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async generateSummary(complaintsList) {
    if (isDemoMode()) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { category: 'Maintenance', summary: 'AI Analysis (Demo): There is a recurring issue with plumbing on the 2nd floor.' },
                    { category: 'Hygiene', summary: 'AI Analysis (Demo): Sanitation reports have increased by 20%.' }
                ]);
            }, 1500);
        });
    }

    const minified = complaintsList.map(c => ({
      id: c.id,
      category: c.category,
      description: c.description
    }));

    const { data, error } = await supabase.functions.invoke('summarize-complaints', {
      body: { complaints: minified }
    });

    if (error) throw new Error("AI Service Failed: " + error.message);
    return data.summaries; 
  },

  async saveSummaries(summaries, gender = null) {
    if (isDemoMode()) return; 

    let deleteQuery = supabase.from('category_summaries').delete();
    if (gender) {
       deleteQuery = deleteQuery.eq('gender', gender);
    } else {
       deleteQuery = deleteQuery.is('gender', null); 
    }
    await deleteQuery;

    const payload = summaries.map(s => ({
        category: s.category,
        summary: s.summary || s.description,
        gender: gender,
        generated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('category_summaries').insert(payload);
    if (error) throw error;
  },

  async rewriteComplaint(text) {
    if (isDemoMode()) return "Demo Mode: This text has been professionally rewritten by AI.";
    const { data, error } = await supabase.functions.invoke('rewrite-complaint', { body: { text } });
    if (error) throw new Error(error.message);
    return data.suggestion;
  }
};