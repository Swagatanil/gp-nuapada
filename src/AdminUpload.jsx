import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, setDoc, doc, serverTimestamp,
  getDocs, deleteDoc, getDoc
} from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
  "Computer Science & Tech", "Electronics & Telecom", "Mining Engineering",
];
const SEMESTERS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];
const CATEGORIES = ["General", "SC", "ST", "OBC", "EWS"];
const NOTICE_TYPES = ["General", "Admission", "Exam", "Placement", "Event"];
const PAGE_SIZE = 6;

// ─── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080e14;
    --surface: #0f1c2a;
    --surface2: #162536;
    --border: rgba(240,180,41,0.18);
    --gold: #f0b429;
    --gold-dim: rgba(240,180,41,0.12);
    --gold-glow: rgba(240,180,41,0.35);
    --text: #e8e0d0;
    --text-dim: #8a9ab0;
    --danger: #e05555;
    --success: #3ecf8e;
    --info: #4a90d9;
    --radius: 12px;
    --radius-sm: 8px;
    --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .admin-wrap {
    min-height: 100vh;
    background: var(--bg);
    padding: 0 0 4rem;
  }

  .admin-header {
    background: linear-gradient(135deg, #0d1b2a 0%, #0f2540 100%);
    border-bottom: 1px solid var(--border);
    padding: 1.4rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .admin-logo {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--gold);
    letter-spacing: 0.04em;
  }
  .admin-logo span { color: var(--text-dim); font-weight: 400; font-size: 0.85rem; display: block; letter-spacing: 0.02em; }

  .back-btn {
    background: var(--gold-dim);
    border: 1px solid var(--border);
    color: var(--gold);
    padding: 0.5rem 1.1rem;
    border-radius: 99px;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: var(--transition);
    display: flex; align-items: center; gap: 0.4rem;
  }
  .back-btn:hover { background: var(--gold); color: #080e14; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }
  .modal-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 3rem 2.5rem;
    max-width: 460px;
    width: 90%;
    box-shadow: 0 0 60px rgba(240,180,41,0.1);
    animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gold);
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .modal-sub {
    color: var(--text-dim);
    text-align: center;
    font-size: 0.9rem;
    margin-bottom: 2.5rem;
  }
  .modal-options { display: flex; flex-direction: column; gap: 1rem; }
  .modal-btn {
    padding: 1.1rem;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  }
  .modal-btn-primary { background: var(--gold); color: #080e14; }
  .modal-btn-primary:hover { background: #ffc93c; transform: translateY(-2px); box-shadow: 0 8px 24px var(--gold-glow); }
  .modal-btn-danger { background: rgba(224,85,85,0.15); color: var(--danger); border: 1px solid rgba(224,85,85,0.3); }
  .modal-btn-danger:hover { background: var(--danger); color: white; transform: translateY(-2px); }

  .main-content {
    max-width: 900px;
    margin: 2.5rem auto;
    padding: 0 1.5rem;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gold);
    margin-bottom: 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid var(--border);
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.4rem;
  }
  .tab-btn {
    padding: 0.55rem 1.1rem;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    flex: 1; min-width: max-content;
    color: var(--text-dim);
    background: transparent;
  }
  .tab-btn.active {
    background: var(--gold);
    color: #080e14;
    box-shadow: 0 2px 12px var(--gold-glow);
  }
  .tab-btn:hover:not(.active) { background: var(--gold-dim); color: var(--gold); }

  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    animation: fadeIn 0.3s ease;
  }
  .form-group { margin-bottom: 1.2rem; }
  .form-label {
    display: block;
    margin-bottom: 0.45rem;
    color: var(--gold);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    transition: var(--transition);
    outline: none;
  }
  .form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-dim); }
  .form-input::placeholder { color: var(--text-dim); }
  select.form-input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23f0b429' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.5rem; }
  select.form-input option { background: var(--surface); }

  .checkbox-row {
    display: flex; align-items: center; gap: 0.7rem;
    color: var(--text-dim);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.7rem 0;
  }
  .checkbox-row input[type=checkbox] { accent-color: var(--gold); width: 16px; height: 16px; cursor: pointer; }

  .submit-btn {
    width: 100%;
    padding: 0.9rem;
    background: var(--gold);
    color: #080e14;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    margin-top: 0.5rem;
    letter-spacing: 0.03em;
  }
  .submit-btn:hover:not(:disabled) { background: #ffc93c; box-shadow: 0 6px 20px var(--gold-glow); transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .msg {
    margin-top: 1rem;
    padding: 0.8rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
  }
  .msg-success { background: rgba(62,207,142,0.12); color: var(--success); border: 1px solid rgba(62,207,142,0.25); }
  .msg-error { background: rgba(224,85,85,0.12); color: var(--danger); border: 1px solid rgba(224,85,85,0.25); }

  .search-row {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
  }
  .search-input {
    flex: 1; min-width: 200px;
    padding: 0.7rem 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: var(--transition);
  }
  .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-dim); }
  .search-input::placeholder { color: var(--text-dim); }

  .list-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem 1.2rem;
    margin-bottom: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    transition: var(--transition);
    animation: fadeIn 0.25s ease;
  }
  .list-item:hover { border-color: rgba(240,180,41,0.4); transform: translateX(2px); }
  .list-item-info { flex: 1; min-width: 0; }
  .list-item-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .list-item-meta {
    font-size: 0.8rem;
    color: var(--text-dim);
    margin-top: 0.25rem;
    display: flex; flex-wrap: wrap; gap: 0.5rem;
  }
  .meta-tag {
    background: var(--gold-dim);
    color: var(--gold);
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .list-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
  .list-btn {
    padding: 0.45rem 0.9rem;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: var(--transition);
  }
  .list-btn-edit { background: rgba(74,144,217,0.15); color: var(--info); border: 1px solid rgba(74,144,217,0.25); }
  .list-btn-edit:hover { background: var(--info); color: white; }
  .list-btn-del { background: rgba(224,85,85,0.12); color: var(--danger); border: 1px solid rgba(224,85,85,0.22); }
  .list-btn-del:hover { background: var(--danger); color: white; }

  .pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 0.4rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }
  .page-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text-dim);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: var(--transition);
  }
  .page-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
  .page-btn.active { background: var(--gold); color: #080e14; border-color: var(--gold); }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-dim);
  }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.8rem; }
  .empty-state p { font-size: 0.95rem; }

  .edit-modal-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    max-width: 580px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 0 60px rgba(0,0,0,0.5);
    animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .edit-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .edit-modal-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--gold); }
  .close-btn {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-dim);
    font-size: 1.1rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition);
  }
  .close-btn:hover { background: var(--danger); color: white; border-color: var(--danger); }

  .confirm-card {
    background: var(--surface);
    border: 1px solid rgba(224,85,85,0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 380px;
    width: 90%;
    text-align: center;
    animation: slideUp 0.3s ease;
  }
  .confirm-icon { font-size: 2.5rem; margin-bottom: 1rem; }
  .confirm-text { color: var(--text); font-size: 1rem; margin-bottom: 0.5rem; font-weight: 600; }
  .confirm-sub { color: var(--text-dim); font-size: 0.85rem; margin-bottom: 1.8rem; }
  .confirm-actions { display: flex; gap: 0.8rem; justify-content: center; }
  .confirm-yes { padding: 0.7rem 1.5rem; background: var(--danger); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition); }
  .confirm-yes:hover { background: #f06060; }
  .confirm-no { padding: 0.7rem 1.5rem; background: var(--gold-dim); color: var(--gold); border: 1px solid var(--border); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition); }
  .confirm-no:hover { background: var(--gold); color: #080e14; }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(240,180,41,0.2);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block; vertical-align: middle; margin-right: 6px;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .admin-header { padding: 1rem 1rem; }
    .main-content { margin: 1.5rem auto; padding: 0 1rem; }
    .form-card { padding: 1.3rem; }
    .list-item { flex-direction: column; align-items: flex-start; }
    .list-actions { width: 100%; }
    .list-btn { flex: 1; text-align: center; }
    .tabs { gap: 0.35rem; }
    .tab-btn { font-size: 0.78rem; padding: 0.45rem 0.7rem; }
    .modal-card { padding: 2rem 1.5rem; }
    .section-title { font-size: 1.2rem; }
    .search-row { flex-direction: column; }
  }
`;

function paginate(arr, page) {
  const start = (page - 1) * PAGE_SIZE;
  return arr.slice(start, start + PAGE_SIZE);
}

function Spinner() { return <span className="spinner" />; }

function ConfirmDialog({ text, subText, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <div className="confirm-text">{text}</div>
        <div className="confirm-sub">{subText}</div>
        <div className="confirm-actions">
          <button className="confirm-no" onClick={onCancel}>Cancel</button>
          <button className="confirm-yes" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ total, page, setPage }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <p>{text}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminUpload() {
  const [showModal, setShowModal] = useState(true);
  const [mode, setMode] = useState(null);
  const [activeTab, setActiveTab] = useState("student");

  // Form state
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [subject, setSubject] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [studentCategory, setStudentCategory] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffQualification, setStaffQualification] = useState("");
  const [staffExperience, setStaffExperience] = useState("");
  const [staffPhotoUrl, setStaffPhotoUrl] = useState("");
  const [isHod, setIsHod] = useState(false);

  // Notice state
  const [noticeText, setNoticeText] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [noticeType, setNoticeType] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Lists
  const [studentsList, setStudentsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [timetablesList, setTimetablesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [pyqsList, setPyqsList] = useState([]);
  const [noticesList, setNoticesList] = useState([]);

  // Edit modal
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Confirm dialog
  const [confirmData, setConfirmData] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [pages, setPages] = useState({ student: 1, staff: 1, timetable: 1, material: 1, pyq: 1, notice: 1 });

  // ── Fetch ──
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const [studentSnap, facultySnap, hodSnap, materialSnap, pyqSnap, noticeSnap] = await Promise.all([
        getDocs(collection(db, "admissions")),
        getDocs(collection(db, "faculty")),
        getDocs(collection(db, "hods")),
        getDocs(collection(db, "study-materials")),
        getDocs(collection(db, "pyq")),
        getDocs(collection(db, "notices")),
      ]);
      setStudentsList(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStaffList([
        ...facultySnap.docs.map(d => ({ id: d.id, ...d.data(), type: "faculty" })),
        ...hodSnap.docs.map(d => ({ id: d.id, ...d.data(), type: "hod" })),
      ]);
      setMaterialsList(materialSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPyqsList(pyqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setNoticesList(noticeSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Timetables
      let ttList = [];
      await Promise.all(
        DEPARTMENTS.flatMap(dept =>
          SEMESTERS.map(async sem => {
            const ttId = `${dept}_${sem}`;
            const ttDoc = await getDoc(doc(db, "timetables", ttId));
            if (ttDoc.exists()) ttList.push({ id: ttId, ...ttDoc.data() });
          })
        )
      );
      setTimetablesList(ttList);
    } catch (err) {
      setMessage({ text: "Error loading data: " + err.message, type: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (mode === "edit-delete") fetchLists();
  }, [mode, fetchLists]);

  // ── Filter helper ──
  const filterList = (list, fields) => {
    const q = searchQuery.toLowerCase();
    return list.filter(item => {
      const matchSearch = !q || fields.some(f => (item[f] || "").toLowerCase().includes(q));
      const matchDept = !filterDept || (item.department || item.course || "") === filterDept;
      return matchSearch && matchDept;
    });
  };

  // ── Reset form ──
  const resetForm = () => {
    setDepartment(""); setSemester(""); setTitle(""); setDriveLink(""); setSubject("");
    setStudentName(""); setStudentMobile(""); setStudentCategory("");
    setStaffName(""); setStaffRole(""); setStaffEmail(""); setStaffPhone("");
    setStaffQualification(""); setStaffExperience(""); setStaffPhotoUrl(""); setIsHod(false);
    setNoticeText(""); setNoticeDate(""); setNoticeType("");
    setEditingItem(null);
  };

  // ── Submit (Add) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      if (activeTab === "student") {
        await addDoc(collection(db, "admissions"), {
          course: department, name: studentName, mobile: studentMobile,
          category: studentCategory, semester, enrolledAt: serverTimestamp(),
        });
        setMessage({ text: "✅ Student added successfully!", type: "success" });
      } else if (activeTab === "staff") {
        const staffData = {
          name: staffName, role: staffRole || (isHod ? "HOD" : "Faculty/Staff"),
          email: staffEmail, phone: staffPhone, qualification: staffQualification,
          experience: staffExperience, photoUrl: staffPhotoUrl, department,
          addedAt: serverTimestamp(),
        };
        if (isHod) {
          await setDoc(doc(db, "hods", department), staffData);
          setMessage({ text: "✅ HOD added/updated!", type: "success" });
        } else {
          await addDoc(collection(db, "faculty"), staffData);
          setMessage({ text: "✅ Staff member added!", type: "success" });
        }
      } else if (activeTab === "timetable") {
        await setDoc(doc(db, "timetables", `${department}_${semester}`), {
          department, semester, driveLink,
          title: title || `Timetable - ${semester}`, uploadedAt: serverTimestamp(),
        });
        setMessage({ text: "✅ Timetable added/updated!", type: "success" });
      } else if (activeTab === "study-material") {
        await addDoc(collection(db, "study-materials"), {
          department, semester, subject, title, driveLink, uploadedAt: serverTimestamp(),
        });
        setMessage({ text: "✅ Study Material added!", type: "success" });
      } else if (activeTab === "pyq") {
        await addDoc(collection(db, "pyq"), {
          department, semester, title, driveLink, uploadedAt: serverTimestamp(),
        });
        setMessage({ text: "✅ PYQ added!", type: "success" });
      } else if (activeTab === "notice") {
        await addDoc(collection(db, "notices"), {
          text: noticeText,
          date: noticeDate,
          type: noticeType,
          uploadedAt: serverTimestamp(),
        });
        setMessage({ text: "✅ Notice added!", type: "success" });
      }
      resetForm();
    } catch (err) {
      setMessage({ text: "❌ Error: " + err.message, type: "error" });
    }
    setLoading(false);
  };

  // ── Start Edit ──
  const startEdit = (type, item) => {
    setEditingItem({ type, id: item.id, data: item });
    setDepartment(item.course || item.department || "");
    setSemester(item.semester || "");
    setTitle(item.title || "");
    setDriveLink(item.driveLink || "");
    setSubject(item.subject || "");
    setStudentName(item.name || "");
    setStudentMobile(item.mobile || "");
    setStudentCategory(item.category || "");
    setStaffName(item.name || "");
    setStaffRole(item.role || "");
    setStaffEmail(item.email || "");
    setStaffPhone(item.phone || "");
    setStaffQualification(item.qualification || "");
    setStaffExperience(item.experience || "");
    setStaffPhotoUrl(item.photoUrl || "");
    setIsHod(item.type === "hod");
    setNoticeText(item.text || "");
    setNoticeDate(item.date || "");
    setNoticeType(item.type || "");
    setShowEditModal(true);
  };

  // ── Save Edit ──
  const saveEdit = async () => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const { type, id, data } = editingItem;
      let collName =
        type === "student" ? "admissions" :
        type === "staff" ? data.type :
        type === "study-material" ? "study-materials" :
        type === "timetable" ? "timetables" :
        type === "notice" ? "notices" : "pyq";
      const ref = doc(db, collName, id);
      await setDoc(ref, {
        ...data,
        department, semester, title, driveLink, subject,
        name: studentName || staffName,
        mobile: studentMobile, category: studentCategory,
        course: type === "student" ? department : undefined,
        role: staffRole, email: staffEmail, phone: staffPhone,
        qualification: staffQualification, experience: staffExperience,
        photoUrl: staffPhotoUrl,
        text: noticeText, date: noticeDate,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setMessage({ text: "✅ Updated successfully!", type: "success" });
      setShowEditModal(false);
      resetForm();
      fetchLists();
    } catch (err) {
      setMessage({ text: "❌ Update error: " + err.message, type: "error" });
    }
    setLoading(false);
  };

  // ── Delete ──
  const confirmDelete = (type, id, label) => {
    setConfirmData({ type, id, label });
  };

  const executeDelete = async () => {
    if (!confirmData) return;
    const { type, id } = confirmData;
    setLoading(true);
    setConfirmData(null);
    try {
      const collName =
        type === "student" ? "admissions" :
        type === "staff" ? "faculty" :
        type === "study-material" ? "study-materials" :
        type === "timetable" ? "timetables" :
        type === "notice" ? "notices" : "pyq";
      await deleteDoc(doc(db, collName, id));
      setMessage({ text: "✅ Deleted successfully!", type: "success" });
      fetchLists();
    } catch (err) {
      setMessage({ text: "❌ Delete error: " + err.message, type: "error" });
    }
    setLoading(false);
  };

  // ── Tab change resets page ──
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setFilterDept("");
  };

  // ── Filtered lists ──
  const filteredStudents = filterList(studentsList, ["name", "mobile", "course"]);
  const filteredStaff = filterList(staffList, ["name", "role", "email"]);
  const filteredTimetables = filterList(timetablesList, ["title", "department", "semester"]);
  const filteredMaterials = filterList(materialsList, ["subject", "title", "department"]);
  const filteredPyqs = filterList(pyqsList, ["title", "department"]);
  const filteredNotices = filterList(noticesList, ["text", "type", "date"]);

  const getKey = () => {
    if (activeTab === "edit-student") return "student";
    if (activeTab === "edit-staff") return "staff";
    if (activeTab === "timetable") return "timetable";
    if (activeTab === "study-material") return "material";
    if (activeTab === "pyq") return "pyq";
    if (activeTab === "notice") return "notice";
    return "student";
  };
  const curPage = pages[getKey()] || 1;
  const setPage = (fn) => setPages(p => ({ ...p, [getKey()]: typeof fn === "function" ? fn(p[getKey()] || 1) : fn }));

  const needsSemester = ["student", "timetable", "study-material", "pyq"].includes(activeTab);
  const needsDriveLink = ["timetable", "study-material", "pyq"].includes(activeTab);

  return (
    <>
      <style>{css}</style>
      <div className="admin-wrap">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-logo">
            ⚙️ AdminCP
            <span>Polytechnic College Management</span>
          </div>
          {!showModal && (
            <button className="back-btn" onClick={() => { setShowModal(true); setMode(null); resetForm(); setMessage({ text: "", type: "" }); }}>
              ← Back
            </button>
          )}
        </div>

        {/* Mode Selection Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-title">Admin Control Panel</div>
              <div className="modal-sub">Choose an action to proceed</div>
              <div className="modal-options">
                <button className="modal-btn modal-btn-primary" onClick={() => { setMode("add"); setShowModal(false); setActiveTab("student"); }}>
                  ➕ Add New Data
                </button>
                <button className="modal-btn modal-btn-danger" onClick={() => { setMode("edit-delete"); setShowModal(false); setActiveTab("edit-student"); }}>
                  ✏️ Edit or Delete Existing Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {confirmData && (
          <ConfirmDialog
            text={`Delete this ${confirmData.label}?`}
            subText="This action cannot be undone."
            onConfirm={executeDelete}
            onCancel={() => setConfirmData(null)}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="edit-modal-card" onClick={e => e.stopPropagation()}>
              <div className="edit-modal-header">
                <div className="edit-modal-title">✏️ Edit {editingItem.type}</div>
                <button className="close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
              </div>
              <EditFormFields
                type={editingItem.type}
                state={{
                  department, setDepartment, semester, setSemester, title, setTitle,
                  driveLink, setDriveLink, subject, setSubject,
                  studentName, setStudentName, studentMobile, setStudentMobile, studentCategory, setStudentCategory,
                  staffName, setStaffName, staffRole, setStaffRole, staffEmail, setStaffEmail,
                  staffPhone, setStaffPhone, staffQualification, setStaffQualification,
                  staffExperience, setStaffExperience, staffPhotoUrl, setStaffPhotoUrl, isHod, setIsHod,
                  noticeText, setNoticeText, noticeDate, setNoticeDate, noticeType, setNoticeType,
                }}
              />
              <button className="submit-btn" onClick={saveEdit} disabled={loading} style={{ marginTop: "1rem" }}>
                {loading ? <><Spinner /> Saving...</> : "💾 Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!showModal && (
          <div className="main-content">

            {/* ─── ADD MODE ─── */}
            {mode === "add" && (
              <>
                <div className="section-title">Add New Data</div>
                <div className="tabs">
                  {["student", "staff", "timetable", "study-material", "pyq", "notice"].map(t => (
                    <button key={t} className={`tab-btn${activeTab === t ? " active" : ""}`} onClick={() => handleTabChange(t)}>
                      {t === "study-material" ? "Study Material" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="form-card">
                  <form onSubmit={handleSubmit}>
                    {/* Department — sabke liye except notice */}
                    {activeTab !== "notice" && (
                      <FormField label="Department">
                        <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)} required>
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </FormField>
                    )}

                    {needsSemester && (
                      <FormField label="Semester">
                        <select className="form-input" value={semester} onChange={e => setSemester(e.target.value)} required>
                          <option value="">Select Semester</option>
                          {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </FormField>
                    )}

                    {activeTab === "student" && (
                      <>
                        <FormField label="Student Name">
                          <input className="form-input" type="text" value={studentName} onChange={e => setStudentName(e.target.value)} required placeholder="Full name" />
                        </FormField>
                        <FormField label="Mobile Number">
                          <input className="form-input" type="tel" value={studentMobile} onChange={e => setStudentMobile(e.target.value)} required placeholder="10-digit number" />
                        </FormField>
                        <FormField label="Category">
                          <select className="form-input" value={studentCategory} onChange={e => setStudentCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </FormField>
                      </>
                    )}

                    {activeTab === "staff" && (
                      <>
                        <FormField label="Staff Name">
                          <input className="form-input" type="text" value={staffName} onChange={e => setStaffName(e.target.value)} required placeholder="Full name" />
                        </FormField>
                        <FormField label="Role / Designation">
                          <input className="form-input" type="text" value={staffRole} onChange={e => setStaffRole(e.target.value)} placeholder="e.g. Lecturer, Assistant Professor" />
                        </FormField>
                        <FormField label="Email">
                          <input className="form-input" type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="name@college.edu" />
                        </FormField>
                        <FormField label="Phone">
                          <input className="form-input" type="tel" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} placeholder="Contact number" />
                        </FormField>
                        <FormField label="Qualification">
                          <input className="form-input" type="text" value={staffQualification} onChange={e => setStaffQualification(e.target.value)} placeholder="e.g. M.Tech, Ph.D" />
                        </FormField>
                        <FormField label="Experience">
                          <input className="form-input" type="text" value={staffExperience} onChange={e => setStaffExperience(e.target.value)} placeholder="e.g. 5 years" />
                        </FormField>
                        <FormField label="Photo URL (Google Drive direct link)">
                          <input className="form-input" type="url" value={staffPhotoUrl} onChange={e => setStaffPhotoUrl(e.target.value)} placeholder="https://drive.google.com/uc?id=..." />
                        </FormField>
                        <label className="checkbox-row">
                          <input type="checkbox" checked={isHod} onChange={e => setIsHod(e.target.checked)} />
                          This person is HOD (Head of Department)
                        </label>
                      </>
                    )}

                    {activeTab === "study-material" && (
                      <FormField label="Subject">
                        <input className="form-input" type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Subject name" />
                      </FormField>
                    )}

                    {needsDriveLink && (
                      <>
                        <FormField label="Title (optional)">
                          <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Descriptive title" />
                        </FormField>
                        <FormField label="Google Drive Link">
                          <input className="form-input" type="url" value={driveLink} onChange={e => setDriveLink(e.target.value)} required placeholder="https://drive.google.com/..." />
                        </FormField>
                      </>
                    )}

                    {/* ── Notice Fields ── */}
                    {activeTab === "notice" && (
                      <>
                        <FormField label="Notice Text">
                          <textarea
                            className="form-input"
                            rows={3}
                            value={noticeText}
                            onChange={e => setNoticeText(e.target.value)}
                            required
                            placeholder="Notice content..."
                            style={{ resize: "vertical" }}
                          />
                        </FormField>
                        <FormField label="Date">
                          <input
                            className="form-input"
                            type="date"
                            value={noticeDate}
                            onChange={e => setNoticeDate(e.target.value)}
                            required
                          />
                        </FormField>
                        <FormField label="Type">
                          <select className="form-input" value={noticeType} onChange={e => setNoticeType(e.target.value)}>
                            <option value="">Select Type</option>
                            {NOTICE_TYPES.map(n => <option key={n}>{n}</option>)}
                          </select>
                        </FormField>
                      </>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? <><Spinner /> Saving...</> : "💾 Save Now"}
                    </button>

                    {message.text && (
                      <div className={`msg ${message.type === "error" ? "msg-error" : "msg-success"}`}>{message.text}</div>
                    )}
                  </form>
                </div>
              </>
            )}

            {/* ─── EDIT/DELETE MODE ─── */}
            {mode === "edit-delete" && (
              <>
                <div className="section-title">Edit / Delete Data</div>
                <div className="tabs">
                  {[
                    { key: "edit-student", label: "Students" },
                    { key: "edit-staff", label: "Staff" },
                    { key: "timetable", label: "Timetables" },
                    { key: "study-material", label: "Study Materials" },
                    { key: "pyq", label: "PYQs" },
                    { key: "notice", label: "Notices" },
                  ].map(({ key, label }) => (
                    <button key={key} className={`tab-btn${activeTab === key ? " active" : ""}`} onClick={() => handleTabChange(key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {message.text && (
                  <div className={`msg ${message.type === "error" ? "msg-error" : "msg-success"}`} style={{ marginBottom: "1rem" }}>{message.text}</div>
                )}

                <div className="search-row">
                  <input
                    className="search-input"
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  />
                  {activeTab !== "notice" && (
                    <select className="search-input" style={{ maxWidth: 200 }} value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
                      <option value="">All Departments</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  )}
                  <button className="list-btn list-btn-edit" onClick={fetchLists} disabled={loading} style={{ padding: "0.7rem 1rem", flexShrink: 0 }}>
                    {loading ? <Spinner /> : "↻ Refresh"}
                  </button>
                </div>

                {/* Students */}
                {activeTab === "edit-student" && (
                  <>
                    {filteredStudents.length === 0 ? <EmptyState text="No students found." /> :
                      paginate(filteredStudents, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.name}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.course}</span>
                              <span className="meta-tag">{item.semester}</span>
                              <span className="meta-tag">{item.category}</span>
                              <span>📱 {item.mobile}</span>
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("student", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("student", item.id, item.name)}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredStudents.length} page={curPage} setPage={setPage} />
                  </>
                )}

                {/* Staff */}
                {activeTab === "edit-staff" && (
                  <>
                    {filteredStaff.length === 0 ? <EmptyState text="No staff found." /> :
                      paginate(filteredStaff, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.name}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.type === "hod" ? "HOD" : "Faculty"}</span>
                              <span className="meta-tag">{item.department}</span>
                              {item.role && <span>{item.role}</span>}
                              {item.email && <span>✉️ {item.email}</span>}
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("staff", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("staff", item.id, item.name)}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredStaff.length} page={curPage} setPage={setPage} />
                  </>
                )}

                {/* Timetables */}
                {activeTab === "timetable" && (
                  <>
                    {filteredTimetables.length === 0 ? <EmptyState text="No timetables found." /> :
                      paginate(filteredTimetables, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.title || "Timetable"}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.department}</span>
                              <span className="meta-tag">{item.semester}</span>
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("timetable", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("timetable", item.id, item.title || item.id)}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredTimetables.length} page={curPage} setPage={setPage} />
                  </>
                )}

                {/* Study Materials */}
                {activeTab === "study-material" && (
                  <>
                    {filteredMaterials.length === 0 ? <EmptyState text="No study materials found." /> :
                      paginate(filteredMaterials, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.title || item.subject}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.department}</span>
                              <span className="meta-tag">{item.semester}</span>
                              {item.subject && <span>📚 {item.subject}</span>}
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("study-material", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("study-material", item.id, item.title || item.subject)}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredMaterials.length} page={curPage} setPage={setPage} />
                  </>
                )}

                {/* PYQs */}
                {activeTab === "pyq" && (
                  <>
                    {filteredPyqs.length === 0 ? <EmptyState text="No PYQs found." /> :
                      paginate(filteredPyqs, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.title}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.department}</span>
                              <span className="meta-tag">{item.semester}</span>
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("pyq", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("pyq", item.id, item.title)}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredPyqs.length} page={curPage} setPage={setPage} />
                  </>
                )}

                {/* Notices */}
                {activeTab === "notice" && (
                  <>
                    {filteredNotices.length === 0 ? <EmptyState text="No notices found." /> :
                      paginate(filteredNotices, curPage).map(item => (
                        <div className="list-item" key={item.id}>
                          <div className="list-item-info">
                            <div className="list-item-title">{item.text}</div>
                            <div className="list-item-meta">
                              <span className="meta-tag">{item.date}</span>
                              {item.type && <span className="meta-tag">{item.type}</span>}
                            </div>
                          </div>
                          <div className="list-actions">
                            <button className="list-btn list-btn-edit" onClick={() => startEdit("notice", item)}>Edit</button>
                            <button className="list-btn list-btn-del" onClick={() => confirmDelete("notice", item.id, item.text?.slice(0, 30))}>Delete</button>
                          </div>
                        </div>
                      ))
                    }
                    <Pagination total={filteredNotices.length} page={curPage} setPage={setPage} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Edit Form Fields ─────────────────────────────────────────────────────────
function EditFormFields({ type, state }) {
  const {
    department, setDepartment, semester, setSemester, title, setTitle,
    driveLink, setDriveLink, subject, setSubject,
    studentName, setStudentName, studentMobile, setStudentMobile, studentCategory, setStudentCategory,
    staffName, setStaffName, staffRole, setStaffRole, staffEmail, setStaffEmail,
    staffPhone, setStaffPhone, staffQualification, setStaffQualification,
    staffExperience, setStaffExperience, staffPhotoUrl, setStaffPhotoUrl, isHod, setIsHod,
    noticeText, setNoticeText, noticeDate, setNoticeDate, noticeType, setNoticeType,
  } = state;

  return (
    <div>
      {type !== "notice" && (
        <FormField label="Department">
          <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">Select</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FormField>
      )}

      {(type === "student" || type === "timetable" || type === "study-material" || type === "pyq") && (
        <FormField label="Semester">
          <select className="form-input" value={semester} onChange={e => setSemester(e.target.value)}>
            <option value="">Select</option>
            {SEMESTERS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      )}

      {type === "student" && (
        <>
          <FormField label="Name"><input className="form-input" value={studentName} onChange={e => setStudentName(e.target.value)} /></FormField>
          <FormField label="Mobile"><input className="form-input" value={studentMobile} onChange={e => setStudentMobile(e.target.value)} /></FormField>
          <FormField label="Category">
            <select className="form-input" value={studentCategory} onChange={e => setStudentCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
        </>
      )}

      {type === "staff" && (
        <>
          <FormField label="Name"><input className="form-input" value={staffName} onChange={e => setStaffName(e.target.value)} /></FormField>
          <FormField label="Role"><input className="form-input" value={staffRole} onChange={e => setStaffRole(e.target.value)} /></FormField>
          <FormField label="Email"><input className="form-input" type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} /></FormField>
          <FormField label="Phone"><input className="form-input" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} /></FormField>
          <FormField label="Qualification"><input className="form-input" value={staffQualification} onChange={e => setStaffQualification(e.target.value)} /></FormField>
          <FormField label="Experience"><input className="form-input" value={staffExperience} onChange={e => setStaffExperience(e.target.value)} /></FormField>
          <FormField label="Photo URL"><input className="form-input" type="url" value={staffPhotoUrl} onChange={e => setStaffPhotoUrl(e.target.value)} /></FormField>
          <label className="checkbox-row"><input type="checkbox" checked={isHod} onChange={e => setIsHod(e.target.checked)} /> Is HOD</label>
        </>
      )}

      {(type === "timetable" || type === "study-material" || type === "pyq") && (
        <>
          {type === "study-material" && <FormField label="Subject"><input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} /></FormField>}
          <FormField label="Title"><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} /></FormField>
          <FormField label="Drive Link"><input className="form-input" type="url" value={driveLink} onChange={e => setDriveLink(e.target.value)} /></FormField>
        </>
      )}

      {type === "notice" && (
        <>
          <FormField label="Notice Text">
            <textarea className="form-input" rows={3} value={noticeText} onChange={e => setNoticeText(e.target.value)} style={{ resize: "vertical" }} />
          </FormField>
          <FormField label="Date">
            <input className="form-input" type="date" value={noticeDate} onChange={e => setNoticeDate(e.target.value)} />
          </FormField>
          <FormField label="Type">
            <select className="form-input" value={noticeType} onChange={e => setNoticeType(e.target.value)}>
              <option value="">Select Type</option>
              {NOTICE_TYPES.map(n => <option key={n}>{n}</option>)}
            </select>
          </FormField>
        </>
      )}
    </div>
  );
}
