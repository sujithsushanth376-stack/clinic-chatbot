import { useState } from "react";
import { createRoot } from "react-dom/client";

const DOCTORS = [
  { id: 1, name: "Dr. Rajesh Sharma", spec: "General Physician", avatar: "RS", color: "#0d6efd", fee: "₹300", phone: "9876543210" },
  { id: 2, name: "Dr. Priya Nair", spec: "Gynecologist", avatar: "PN", color: "#d63384", fee: "₹500", phone: "9812345678" },
  { id: 3, name: "Dr. Amit Verma", spec: "Orthopedics", avatar: "AV", color: "#198754", fee: "₹400", phone: "9898765432" }
];

const ALL_SLOTS = ["9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const STATUS_STYLE = {
  Confirmed: { bg: "#d1fae5", fg: "#065f46", dot: "#10b981" },
  Pending: { bg: "#fef9c3", fg: "#854d0e", dot: "#eab308" },
  Waiting: { bg: "#dbeafe", fg: "#1e40af", dot: "#3b82f6" },
  Cancelled: { bg: "#fee2e2", fg: "#991b1b", dot: "#ef4444" },
  Completed: { bg: "#f3f4f6", fg: "#374151", dot: "#9ca3af" }
};

const INIT_APPTS = [
  { id:"A001", doctorId:1, date:"today+0", slot:"9:00", patient:"Suresh Kumar", phone:"9812345678", reason:"Fever & cold", status:"Confirmed" },
  { id:"A002", doctorId:1, date:"today+0", slot:"10:00", patient:"Meena Joshi", phone:"9654321098", reason:"BP checkup", status:"Waiting" },
  { id:"A003", doctorId:2, date:"today+0", slot:"9:30", patient:"Anita Sharma", phone:"9876543210", reason:"Routine checkup", status:"Confirmed" },
  { id:"A004", doctorId:2, date:"today+0", slot:"11:00", patient:"Lakshmi Devi", phone:"9765432109", reason:"Follow-up", status:"Pending" },
  { id:"A005", doctorId:3, date:"today+0", slot:"10:30", patient:"Ramesh Patel", phone:"9543210987", reason:"Knee pain", status:"Confirmed" },
  { id:"A006", doctorId:1, date:"today+1", slot:"9:00", patient:"Vikram Singh", phone:"9432109876", reason:"Back pain", status:"Confirmed" },
  { id:"A007", doctorId:1, date:"today+1", slot:"11:00", patient:"Pooja Verma", phone:"9321098765", reason:"Diabetes review", status:"Pending" },
  { id:"A008", doctorId:2, date:"today+1", slot:"10:00", patient:"Sunita Rao", phone:"9210987654", reason:"Prenatal checkup", status:"Confirmed" },
  { id:"A009", doctorId:3, date:"today+2", slot:"14:00", patient:"Kiran Reddy", phone:"9109876543", reason:"Shoulder injury", status:"Confirmed" },
  { id:"A010", doctorId:1, date:"today+2", slot:"15:00", patient:"Arjun Mehta", phone:"9098765432", reason:"General checkup", status:"Pending" }
];

const INIT_AVAIL = {
  1: { Mon:["9:00","9:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00"], Tue:["9:00","9:30","10:00","10:30","11:00","11:30","14:00","14:30"], Wed:["9:00","9:30","10:00","10:30","11:00"], Thu:["9:00","9:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30"], Fri:["9:00","9:30","10:00","10:30","11:00","11:30","14:00"], Sat:["9:00","9:30","10:00","10:30"], Sun:[] },
  2: { Mon:["9:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30"], Tue:["9:30","10:00","10:30","11:00","11:30","12:00"], Wed:["9:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00"], Thu:["9:30","10:00","10:30","11:00"], Fri:["9:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30"], Sat:["9:30","10:00","10:30"], Sun:[] },
  3: { Mon:["10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00"], Tue:["10:00","10:30","11:00","11:30","14:00","14:30","15:00"], Wed:["10:00","10:30","11:00"], Thu:["10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30"], Fri:["10:00","10:30","11:00","11:30","14:00","14:30"], Sat:["10:00","10:30","11:00"], Sun:[] }
};

function resolveDate(dateKey) {
  if (dateKey.startsWith("today+")) {
    const offset = parseInt(dateKey.replace("today+", ""));
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toDateString();
  }
  return new Date(dateKey).toDateString();
}

function formatSlot(s) {
  const [h, m] = s.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function DoctorAvatar({ doc, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${doc.color}22`, border: `2px solid ${doc.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 800, color: doc.color, flexShrink: 0, fontFamily: "Georgia, serif" }}>
      {doc.avatar}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  return (
    <span style={{ background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function ClinicDashboard() {
  const [tab, setTab] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [appointments, setAppointments] = useState(INIT_APPTS);
  const [availability, setAvailability] = useState(INIT_AVAIL);
  const [addOpen, setAddOpen] = useState(false);
  const [filterDoc, setFilterDoc] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const [newAppt, setNewAppt] = useState({ doctorId: 1, date: "", slot: "9:00", patient: "", phone: "", reason: "", status: "Confirmed" });

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toDateString();

  const resolvedAppts = appointments.map(a => ({
    ...a,
    resolvedDate: resolveDate(a.date)
  }));

  const getAppts = (dateStr, docId) =>
    resolvedAppts.filter(a => a.resolvedDate === dateStr && (docId ? a.doctorId === docId : true));

  const filteredAppts = resolvedAppts.filter(a =>
    (filterDoc === "all" || a.doctorId === parseInt(filterDoc)) &&
    (filterStatus === "all" || a.status === filterStatus) &&
    (a.patient.toLowerCase().includes(searchQ.toLowerCase()) || a.reason.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const toggleSlot = (docId, day, slot) => {
    setAvailability(prev => {
      const current = prev[docId][day] || [];
      const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot].sort();
      return { ...prev, [docId]: { ...prev[docId], [day]: updated } };
    });
  };

  const updateStatus = (id, status) =>
    setAppointments(p => p.map(a => a.id === id ? { ...a, status } : a));

  const addAppointment = () => {
    if (!newAppt.patient || !newAppt.date || !newAppt.slot) return;
    const id = `A${String(appointments.length + 1).padStart(3, "0")}`;
    setAppointments(p => [...p, { ...newAppt, id, doctorId: parseInt(newAppt.doctorId), date: newAppt.date }]);
    setAddOpen(false);
    setNewAppt({ doctorId: 1, date: "", slot: "9:00", patient: "", phone: "", reason: "", status: "Confirmed" });
  };

  const todayAppts = resolvedAppts.filter(a => a.resolvedDate === today);
  const confirmedCount = appointments.filter(a => a.status === "Confirmed").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;

  const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fafafa" };
  const labelSt = { fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 4 };

  const NAV = [
    { id: "calendar", icon: "📅", label: "Calendar" },
    { id: "availability", icon: "🕐", label: "Availability" },
    { id: "appointments", icon: "📋", label: "All Bookings" },
    { id: "doctors", icon: "👨‍⚕️", label: "Doctors" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>MedCare Clinic</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2 }}>APPOINTMENT MANAGER</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>🟢 Clinic Open</div>
          <button onClick={() => setAddOpen(true)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
            ➕ New Booking
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", gap: 4 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            padding: "13px 18px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13.5, fontWeight: tab === n.id ? 700 : 500,
            color: tab === n.id ? "#1d4ed8" : "#6b7280",
            borderBottom: tab === n.id ? "2.5px solid #1d4ed8" : "2.5px solid transparent",
            transition: "all .15s", display: "flex", alignItems: "center", gap: 7
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", padding: "14px 24px", display: "flex", gap: 16, borderBottom: "1px solid #e5e7eb", flexWrap: "wrap" }}>
        {[
          { label: "Today's Appointments", value: todayAppts.length, icon: "📅", color: "#1d4ed8" },
          { label: "Confirmed", value: confirmedCount, icon: "✅", color: "#059669" },
          { label: "Pending", value: pendingCount, icon: "⏳", color: "#d97706" },
          { label: "Doctors Available", value: DOCTORS.length, icon: "👨‍⚕️", color: "#7c3aed" }
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, background: `${s.color}0d`, border: `1px solid ${s.color}22`, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {tab === "calendar" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} – {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[0].getFullYear()}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setWeekOffset(0)} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>Today</button>
                <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 16 }}>‹</button>
                <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 16 }}>›</button>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px repeat(7,1fr)", borderBottom: "2px solid #e5e7eb" }}>
                <div style={{ padding: "14px 16px", background: "#f8fafc", fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>DOCTOR</div>
                {weekDates.map((d, i) => {
                  const isToday = d.toDateString() === today;
                  return (
                    <div key={i} style={{ padding: "12px 8px", textAlign: "center", background: isToday ? "#1d4ed8" : "#f8fafc", borderLeft: "1px solid #e5e7eb" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? "rgba(255,255,255,0.8)" : "#9ca3af", letterSpacing: 1 }}>{DAYS[i]}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? "#fff" : "#1e293b", marginTop: 2 }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {DOCTORS.map((doc, di) => (
                <div key={doc.id} style={{ display: "grid", gridTemplateColumns: "160px repeat(7,1fr)", borderBottom: di < DOCTORS.length - 1 ? "1px solid #e5e7eb" : "none", minHeight: 100 }}>
                  <div style={{ padding: "14px 16px", background: "#fafafa", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                    <DoctorAvatar doc={doc} size={32} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}>{doc.name.replace("Dr. ", "Dr.")}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>{doc.spec}</div>
                  </div>

                  {weekDates.map((d, i) => {
                    const dateStr = d.toDateString();
                    const dayAppts = getAppts(dateStr, doc.id);
                    const isToday = dateStr === today;
                    return (
                      <div key={i} onClick={() => { setSelectedDate(dateStr); setSelectedDoc(doc.id); }} style={{
                        padding: "8px 6px", borderLeft: "1px solid #e5e7eb",
                        background: isToday ? "#eff6ff" : "#fff",
                        cursor: "pointer", transition: "background .15s",
                        minHeight: 90
                      }}>
                        {dayAppts.length === 0 ? (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>No bookings</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {dayAppts.slice(0, 3).map(a => (
                              <div key={a.id} style={{ background: STATUS_STYLE[a.status]?.bg || "#f3f4f6", borderLeft: `3px solid ${STATUS_STYLE[a.status]?.dot || "#9ca3af"}`, borderRadius: 6, padding: "4px 6px" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatSlot(a.slot)}</div>
                                <div style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.patient.split(" ")[0]}</div>
                              </div>
                            ))}
                            {dayAppts.length > 3 && <div style={{ fontSize: 10, color: "#6b7280", textAlign: "center" }}>+{dayAppts.length - 3} more</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {selectedDate && selectedDoc && (
              <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
                      {DOCTORS.find(d => d.id === selectedDoc)?.name} — {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{getAppts(selectedDate, selectedDoc).length} appointments</div>
                  </div>
                  <button onClick={() => setSelectedDate(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#6b7280" }}>✕ Close</button>
                </div>

                {getAppts(selectedDate, selectedDoc).length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>No appointments for this day</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {getAppts(selectedDate, selectedDoc).map(a => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa" }}>
                        <div style={{ textAlign: "center", background: "#eff6ff", borderRadius: 10, padding: "8px 12px", minWidth: 70 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8" }}>{formatSlot(a.slot)}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{a.patient}</div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>📞 {a.phone} · 🩺 {a.reason}</div>
                        </div>
                        <Badge status={a.status} />
                        <div style={{ display: "flex", gap: 6 }}>
                          {a.status === "Pending" && <button onClick={() => updateStatus(a.id, "Confirmed")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#d1fae5", color: "#065f46", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✅ Confirm</button>}
                          {a.status !== "Completed" && a.status !== "Cancelled" && <button onClick={() => updateStatus(a.id, "Completed")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#dbeafe", color: "#1e40af", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✓ Done</button>}
                          {a.status !== "Cancelled" && <button onClick={() => updateStatus(a.id, "Cancelled")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#991b1b", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✕</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "availability" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Doctor Availability</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Click slots to toggle availability. Green = available, Grey = off.</div>
            </div>

            {DOCTORS.map(doc => (
              <div key={doc.id} style={{ background: "#fff", borderRadius: 20, padding: 22, marginBottom: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                  <DoctorAvatar doc={doc} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{doc.spec} · Fee: {doc.fee}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: doc.color, background: `${doc.color}11`, padding: "6px 14px", borderRadius: 20, border: `1px solid ${doc.color}33` }}>
                    {Object.values(availability[doc.id]).flat().length} slots/week
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12 }}>
                  {DAYS.map(day => (
                    <div key={day}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textAlign: "center", marginBottom: 8, background: "#f8fafc", borderRadius: 6, padding: "4px 0" }}>{day}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {ALL_SLOTS.map(slot => {
                          const on = (availability[doc.id][day] || []).includes(slot);
                          return (
                            <button key={slot} onClick={() => toggleSlot(doc.id, day, slot)} style={{
                              padding: "5px 4px", borderRadius: 7, border: `1.5px solid ${on ? doc.color + "55" : "#e5e7eb"}`,
                              background: on ? `${doc.color}15` : "#f9fafb",
                              color: on ? doc.color : "#cbd5e1",
                              fontSize: 10, fontWeight: on ? 700 : 400,
                              cursor: "pointer", transition: "all .12s",
                              textAlign: "center"
                            }}>
                              {formatSlot(slot)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={() => setAvailability(p => ({ ...p, [doc.id]: Object.fromEntries(DAYS.map(d => [d, ALL_SLOTS])) }))} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${doc.color}`, background: "transparent", color: doc.color, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✅ Enable All</button>
                  <button onClick={() => setAvailability(p => ({ ...p, [doc.id]: Object.fromEntries(DAYS.map(d => [d, []])) }))} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>❌ Clear All</button>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map(d => (
                    <button key={d} onClick={() => setAvailability(p => ({ ...p, [doc.id]: { ...p[doc.id], [d]: p[doc.id][d]?.length > 0 ? [] : [...ALL_SLOTS] } }))} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f8fafc", color: "#374151", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                      Toggle {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "appointments" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Search patient or reason..." style={{ flex: 1, minWidth: 200, ...inputSt }} />
              <select value={filterDoc} onChange={e => setFilterDoc(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fafafa" }}>
                <option value="all">All Doctors</option>
                {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fafafa" }}>
                <option value="all">All Status</option>
                {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, overflowX: "auto", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["ID","Patient","Doctor","Date","Time","Reason","Status","Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppts.map((a, i) => {
                    const doc = DOCTORS.find(d => d.id === a.doctorId);
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{a.id}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{a.patient}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>📞 {a.phone}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <DoctorAvatar doc={doc} size={26} />
                            <div style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{doc?.name.replace("Dr. ", "")}</div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#374151" }}>{new Date(a.resolvedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>{formatSlot(a.slot)}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", maxWidth: 140 }}>{a.reason}</td>
                        <td style={{ padding: "12px 14px" }}><Badge status={a.status} /></td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            {a.status === "Pending" && <button onClick={() => updateStatus(a.id, "Confirmed")} style={{ padding: "4px 8px", borderRadius: 7, border: "none", background: "#d1fae5", color: "#065f46", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✅</button>}
                            {a.status !== "Completed" && a.status !== "Cancelled" && <button onClick={() => updateStatus(a.id, "Completed")} style={{ padding: "4px 8px", borderRadius: 7, border: "none", background: "#dbeafe", color: "#1e40af", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✓</button>}
                            {a.status !== "Cancelled" && <button onClick={() => updateStatus(a.id, "Cancelled")} style={{ padding: "4px 8px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#991b1b", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✕</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAppts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>No appointments found</div>}
            </div>
          </div>
        )}

        {tab === "doctors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {DOCTORS.map(doc => {
              const docAppts = resolvedAppts.filter(a => a.doctorId === doc.id);
              const todayDocAppts = docAppts.filter(a => a.resolvedDate === today);
              const totalSlots = Object.values(availability[doc.id]).flat().length;
              return (
                <div key={doc.id} style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: `1px solid ${doc.color}22`, borderTop: `4px solid ${doc.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <DoctorAvatar doc={doc} size={52} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{doc.spec}</div>
                      <div style={{ fontSize: 12, color: doc.color, fontWeight: 700, marginTop: 2 }}>{doc.fee} / visit</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Today", value: todayDocAppts.length, color: doc.color },
                      { label: "Total", value: docAppts.length, color: "#374151" },
                      { label: "Slots/wk", value: totalSlots, color: "#059669" }
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: "center", padding: "10px 6px", background: "#f8fafc", borderRadius: 10 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setTab("availability")} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1.5px solid ${doc.color}`, background: "transparent", color: doc.color, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🕐 Edit Slots</button>
                    <button onClick={() => setTab("calendar")} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: doc.color, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>📅 Calendar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {addOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 20 }}>➕ New Appointment</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelSt}>Doctor</label>
                <select value={newAppt.doctorId} onChange={e => setNewAppt(p => ({ ...p, doctorId: e.target.value }))} style={inputSt}>
                  {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.spec}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelSt}>Date</label>
                  <input type="date" value={newAppt.date} onChange={e => setNewAppt(p => ({ ...p, date: e.target.value }))} style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Time Slot</label>
                  <select value={newAppt.slot} onChange={e => setNewAppt(p => ({ ...p, slot: e.target.value }))} style={inputSt}>
                    {ALL_SLOTS.map(s => <option key={s} value={s}>{formatSlot(s)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelSt}>Patient Name</label>
                <input value={newAppt.patient} onChange={e => setNewAppt(p => ({ ...p, patient: e.target.value }))} placeholder="e.g. Rahul Sharma" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Phone Number</label>
                <input value={newAppt.phone} onChange={e => setNewAppt(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Reason for Visit</label>
                <input value={newAppt.reason} onChange={e => setNewAppt(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Fever, checkup, follow-up" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Status</label>
                <select value={newAppt.status} onChange={e => setNewAppt(p => ({ ...p, status: e.target.value }))} style={inputSt}>
                  {["Confirmed", "Pending", "Waiting"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setAddOpen(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}>Cancel</button>
              <button onClick={addAppointment} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1d4ed8,#1e40af)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 14px rgba(29,78,216,0.35)" }}>
                ✅ Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicDashboard;

createRoot(document.getElementById("root")).render(<ClinicDashboard />);
