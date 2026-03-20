import { useState } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const departments = ["Civil", "Electrical", "Mechanical", "Computer Science", "Electronics", "Mining"];
const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

export default function TimetableAdmin() {
  const [dept, setDept] = useState("");
  const [sem, setSem] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!dept || !sem || !link) {
      alert("Sab fields bharo!");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "timetables", `${dept}_${sem}`), {
        department: dept,
        semester: sem,
        driveLink: link,
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
      setLink("");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <h2>Timetable Upload (Admin)</h2>

      <select value={dept} onChange={e => setDept(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}>
        <option value="">Department Select Karo</option>
        {departments.map(d => <option key={d}>{d}</option>)}
      </select>

      <select value={sem} onChange={e => setSem(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}>
        <option value="">Semester Select Karo</option>
        {semesters.map(s => <option key={s}>{s}</option>)}
      </select>

      <input
        placeholder="Google Drive Link paste karo"
        value={link}
        onChange={e => setLink(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: "100%", padding: "0.8rem", background: "#f0b429", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
        {loading ? "Saving..." : "Save Timetable Link"}
      </button>

      {success && <p style={{ color: "green", marginTop: "1rem" }}>✅ Timetable link save ho gaya!</p>}
    </div>
  );
}