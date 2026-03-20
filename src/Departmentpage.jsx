import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function DepartmentPage() {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [hodData, setHodData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [students, setStudents] = useState([]);
  const [timetables, setTimetables] = useState({});
  const [materials, setMaterials] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

  useEffect(() => {
    fetchAllData();
  }, [deptName]);

  const fetchAllData = async () => {
    setLoading(true);
    const dept = decodeURIComponent(deptName);
    try {
      // HOD
      const hodDoc = await getDoc(doc(db, "hods", deptName));
      if (hodDoc.exists()) setHodData(hodDoc.data());

      // Faculty
      const staffSnap = await getDocs(
        query(collection(db, "faculty"), where("department", "==", dept))
      );
      setStaffList(staffSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Students
      const studentsSnap = await getDocs(
        query(collection(db, "admissions"), where("course", "==", dept))
      );
      setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Timetables
      const ttData = {};
      for (const sem of semesters) {
        const ttDoc = await getDoc(doc(db, "timetables", `${dept}_${sem}`));
        if (ttDoc.exists()) ttData[sem] = ttDoc.data().driveLink;
      }
      setTimetables(ttData);

      // Study Materials
      const materialsSnap = await getDocs(
        query(collection(db, "study-materials"), where("department", "==", dept))
      );
      setMaterials(materialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // PYQs
      const pyqSnap = await getDocs(
        query(collection(db, "pyq"), where("department", "==", dept))
      );
      setPyqs(pyqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "students", label: "👥 Students" },
    { id: "timetable", label: "📅 Timetable" },
    { id: "material", label: "📚 Study Material" },
    { id: "pyq", label: "📄 Previous Year Questions" },
    { id: "hod", label: "👨‍💼 Dept. Staff" },
  ];

  // Group materials/pyqs by semester
  const groupBySemester = (list) => {
    const grouped = {};
    semesters.forEach(sem => {
      const items = list.filter(i => i.semester === sem);
      if (items.length > 0) grouped[sem] = items;
    });
    return grouped;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", color: "#e8e0d0", fontFamily: "Georgia, serif" }}>

      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg, #1a3a5c, #0d2035)", padding: "2rem 2rem 1.5rem", borderBottom: "1px solid rgba(240,180,41,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "1px solid rgba(240,180,41,0.4)", color: "#f0b429", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer", marginBottom: "1rem" }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: "2.8rem", color: "#f0b429", marginBottom: "0.5rem" }}>
            {decodeURIComponent(deptName)}
          </h1>
          <p style={{ color: "rgba(232,224,208,0.7)", fontSize: "1.1rem" }}>
            Government Polytechnic Nuapada
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "rgba(26,58,92,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", padding: "0 2rem" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none", border: "none",
                padding: "1rem 1.5rem",
                color: activeTab === tab.id ? "#f0b429" : "rgba(232,224,208,0.7)",
                borderBottom: activeTab === tab.id ? "3px solid #f0b429" : "3px solid transparent",
                cursor: "pointer", fontSize: "1rem", whiteSpace: "nowrap",
                fontWeight: activeTab === tab.id ? "600" : "normal",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#f0b429", fontSize: "1.5rem" }}>
            Loading...
          </div>
        ) : (
          <>
            {/* ── Dept. Staff ── */}
            {activeTab === "hod" && (
              <div>
                <h2 style={{ color: "#f0b429", fontSize: "2rem", marginBottom: "2rem" }}>Department Staff</h2>

                <div style={{ marginBottom: "3rem" }}>
                  <h3 style={{ color: "#f0b429", fontSize: "1.6rem", marginBottom: "1rem" }}>Head of Department (HOD)</h3>
                  {hodData ? (
                    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 12 }}>
                      {hodData.photoUrl && (
                        <img
                          src={hodData.photoUrl}
                          alt="HOD"
                          style={{ width: 160, height: 160, borderRadius: 12, objectFit: "cover", border: "3px solid #f0b429" }}
                        />
                      )}
                      <div>
                        <h4 style={{ color: "#f0b429", fontSize: "1.4rem" }}>{hodData.name}</h4>
                        <p style={{ margin: "0.5rem 0" }}>Head of Department</p>
                        <p>📧 {hodData.email || "Not available"}</p>
                        <p>📞 {hodData.phone || "Not available"}</p>
                        <p>🎓 {hodData.qualification || "Not available"}</p>
                        <p>💼 {hodData.experience || "Not available"}</p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "rgba(232,224,208,0.6)" }}>HOD details not available yet.</p>
                  )}
                </div>

                <h3 style={{ color: "#f0b429", fontSize: "1.6rem", marginBottom: "1rem" }}>Other Faculty / Staff Members</h3>
                {staffList.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {staffList.map(staff => (
                      <div key={staff.id} style={{ background: "rgba(255,255,255,0.03)", padding: "1.2rem", borderRadius: 10, border: "1px solid rgba(240,180,41,0.15)" }}>
                        {staff.photoUrl && (
                          <img src={staff.photoUrl} alt={staff.name} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #f0b429", marginBottom: "0.8rem" }} />
                        )}
                        <h4 style={{ color: "#f0b429", fontSize: "1.1rem", marginBottom: "0.4rem" }}>{staff.name}</h4>
                        <p style={{ color: "rgba(232,224,208,0.9)", marginBottom: "0.4rem" }}>{staff.role || "Faculty/Staff"}</p>
                        {staff.email && <p style={{ fontSize: "0.9rem" }}>📧 {staff.email}</p>}
                        {staff.phone && <p style={{ fontSize: "0.9rem" }}>📞 {staff.phone}</p>}
                        {staff.qualification && <p style={{ fontSize: "0.9rem" }}>🎓 {staff.qualification}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "rgba(232,224,208,0.5)" }}>No other staff members added yet.</p>
                )}
              </div>
            )}

            {/* ── Students ── */}
            {activeTab === "students" && (
              <div>
                <div style={{ background: "rgba(240,180,41,0.1)", border: "1px solid rgba(240,180,41,0.3)", borderRadius: 8, padding: "1rem 1.5rem", marginBottom: "2rem", display: "inline-block" }}>
                  <span style={{ color: "#f0b429", fontSize: "1.5rem", fontWeight: "bold" }}>{students.length}</span>
                  <span style={{ color: "rgba(232,224,208,0.7)", marginLeft: "0.5rem" }}>Total Students</span>
                </div>
                {students.length === 0 ? (
                  <p style={{ color: "rgba(232,224,208,0.5)" }}>No students enrolled yet.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(26,58,92,0.8)" }}>
                        <th style={{ padding: "0.8rem", textAlign: "left", color: "rgba(232,224,208,0.7)" }}>#</th>
                        <th style={{ padding: "0.8rem", textAlign: "left", color: "rgba(232,224,208,0.7)" }}>Name</th>
                        <th style={{ padding: "0.8rem", textAlign: "left", color: "rgba(232,224,208,0.7)" }}>Semester</th>
                        <th style={{ padding: "0.8rem", textAlign: "left", color: "rgba(232,224,208,0.7)" }}>Mobile</th>
                        <th style={{ padding: "0.8rem", textAlign: "left", color: "rgba(232,224,208,0.7)" }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                          <td style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(232,224,208,0.5)" }}>{i + 1}</td>
                          <td style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{s.name}</td>
                          <td style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{s.semester}</td>
                          <td style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{s.mobile}</td>
                          <td style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{s.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── Timetable ── */}
            {activeTab === "timetable" && (
              <div>
                <h2 style={{ color: "#f0b429", fontSize: "2rem", marginBottom: "2rem" }}>Timetables</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
                  {semesters.map(sem => (
                    <div key={sem} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1.5rem" }}>
                      <h3 style={{ color: "#f0b429", marginBottom: "1rem" }}>{sem}</h3>
                      {timetables[sem] ? (
                        <a
                          href={timetables[sem]}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block", padding: "0.7rem", background: "rgba(240,180,41,0.1)", color: "#f0b429", borderRadius: 6, textDecoration: "none", textAlign: "center" }}
                        >
                          📅 View Timetable
                        </a>
                      ) : (
                        <p style={{ color: "rgba(232,224,208,0.4)", fontSize: "0.9rem" }}>Not uploaded yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Study Material ── */}
            {activeTab === "material" && (
              <div>
                <h2 style={{ color: "#f0b429", fontSize: "2rem", marginBottom: "2rem" }}>Study Materials</h2>
                {materials.length === 0 ? (
                  <p style={{ color: "rgba(232,224,208,0.5)" }}>Koi study material nahi hai abhi. Admin panel se add karein.</p>
                ) : (
                  Object.entries(groupBySemester(materials)).map(([sem, items]) => (
                    <div key={sem} style={{ marginBottom: "2.5rem" }}>
                      <h3 style={{ color: "#f0b429", fontSize: "1.3rem", marginBottom: "1rem", borderBottom: "1px solid rgba(240,180,41,0.2)", paddingBottom: "0.5rem" }}>
                        {sem}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {items.map(m => (
                          <div key={m.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1.2rem" }}>
                            <h4 style={{ color: "#e8e0d0", marginBottom: "0.4rem", fontSize: "1rem" }}>{m.title || m.subject}</h4>
                            <p style={{ color: "rgba(232,224,208,0.5)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>📚 {m.subject}</p>
                            <a
                              href={m.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block", padding: "0.6rem", background: "rgba(240,180,41,0.1)", color: "#f0b429", borderRadius: 6, textDecoration: "none", textAlign: "center", fontSize: "0.9rem" }}
                            >
                              📥 Open in Drive
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── PYQ ── */}
            {activeTab === "pyq" && (
              <div>
                <h2 style={{ color: "#f0b429", fontSize: "2rem", marginBottom: "2rem" }}>Previous Year Questions</h2>
                {pyqs.length === 0 ? (
                  <p style={{ color: "rgba(232,224,208,0.5)" }}>Koi PYQ nahi hai abhi. Admin panel se add karein.</p>
                ) : (
                  Object.entries(groupBySemester(pyqs)).map(([sem, items]) => (
                    <div key={sem} style={{ marginBottom: "2.5rem" }}>
                      <h3 style={{ color: "#f0b429", fontSize: "1.3rem", marginBottom: "1rem", borderBottom: "1px solid rgba(240,180,41,0.2)", paddingBottom: "0.5rem" }}>
                        {sem}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {items.map(p => (
                          <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1.2rem" }}>
                            <h4 style={{ color: "#e8e0d0", marginBottom: "0.8rem", fontSize: "1rem" }}>{p.title}</h4>
                            <a
                              href={p.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block", padding: "0.6rem", background: "rgba(240,180,41,0.1)", color: "#f0b429", borderRadius: 6, textDecoration: "none", textAlign: "center", fontSize: "0.9rem" }}
                            >
                              📥 Open in Drive
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
