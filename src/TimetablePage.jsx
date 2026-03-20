import { useState } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const departments = ["Civil", "Electrical", "Mechanical", "Computer Science", "Electronics", "Mining"];
const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

export default function TimetablePage() {
  const [dept, setDept] = useState("");
  const [sem, setSem] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!dept || !sem) {
      alert("Department aur Semester select karo!");
      return;
    }
    setLoading(true);
    setLink("");
    setNotFound(false);
    try {
      const docRef = doc(db, "timetables", `${dept}_${sem}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLink(docSnap.data().driveLink);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <h2>📅 Timetable Dekho</h2>

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

      <button onClick={handleSearch} disabled={loading}
        style={{ width: "100%", padding: "0.8rem", background: "#f0b429", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
        {loading ? "Dhundh raha hai..." : "Timetable Dekho 🔍"}
      </button>

      {link && (
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "green" }}>✅ Timetable mil gaya!</p>
          <a href={link} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", padding: "0.8rem", background: "#0d1b2a", color: "#f0b429", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
            📄 Timetable Kholein
          </a>
        </div>
      )}

      {notFound && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ Is department ka timetable abhi upload nahi hua!
        </p>
      )}
    </div>
  );
}