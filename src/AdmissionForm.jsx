import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdmissionForm() {
  const [form, setForm] = useState({
    name: "", father: "", mother: "", dob: "",
    gender: "", mobile: "", email: "",
    address: "", tenthPercent: "", tenthBoard: "",
    course: "", category: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.mobile || !form.course) {
      alert("Name, Mobile aur Course zaroor bharo!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "admissions"), {
        ...form,
        createdAt: serverTimestamp(),
        status: "Pending"
      });
      setSubmitted(true);
    } catch (e) {
      alert("Error! Dobara try karo.");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "0.7rem 1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "6px", color: "#e8e0d0",
    fontFamily: "inherit", fontSize: "1rem",
    outline: "none", marginBottom: "1rem"
  };

  const lbl = {
    display: "block", marginBottom: "0.3rem",
    fontSize: "0.85rem", color: "rgba(232,224,208,0.7)",
    textTransform: "uppercase", letterSpacing: "0.05em"
  };

  if (submitted) return (
    <div style={{
      minHeight: "60vh", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      padding: "2rem"
    }}>
      <div style={{ fontSize: "4rem" }}>🎉</div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        color: "#f0b429", fontSize: "2rem", margin: "1rem 0"
      }}>
        Application Submitted!
      </h2>
      <p style={{ color: "rgba(232,224,208,0.7)", fontSize: "1.1rem" }}>
        Aapka admission form successfully submit ho gaya hai.
      </p>
      <p style={{ color: "rgba(232,224,208,0.5)", marginTop: "0.5rem" }}>
        Hum aapko jald hi contact karenge.
      </p>
      <button onClick={() => setSubmitted(false)} style={{
        marginTop: "2rem", padding: "0.8rem 2rem",
        background: "linear-gradient(135deg, #f0b429, #c47a2b)",
        border: "none", borderRadius: "6px",
        color: "#0d1b2a", fontWeight: "700",
        fontSize: "1rem", cursor: "pointer"
      }}>
        Naya Form Bharo
      </button>
    </div>
  );

  return (
    <div style={{
      maxWidth: 800, margin: "0 auto",
      padding: "3rem 2rem",
      fontFamily: "'Crimson Pro', Georgia, serif"
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        color: "#f0b429", fontSize: "2rem",
        textAlign: "center", marginBottom: "0.5rem"
      }}>
        Admission Form 2026-27
      </h2>
      <p style={{
        textAlign: "center", color: "rgba(232,224,208,0.6)",
        marginBottom: "2.5rem"
      }}>
        Sabhi * fields bharna zaruri hai
      </p>

      {/* Personal Details */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(240,180,41,0.2)",
        borderRadius: "12px", padding: "1.5rem",
        marginBottom: "1.5rem"
      }}>
        <h3 style={{ color: "#f0b429", marginBottom: "1.2rem" }}>
          👤 Personal Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <div>
            <label style={lbl}>Student Name *</label>
            <input style={inp} name="name" value={form.name}
              onChange={handle} placeholder="Poora naam" />
          </div>
          <div>
            <label style={lbl}>Date of Birth *</label>
            <input style={inp} type="date" name="dob"
              value={form.dob} onChange={handle} />
          </div>
          <div>
            <label style={lbl}>Father's Name *</label>
            <input style={inp} name="father" value={form.father}
              onChange={handle} placeholder="Pita ka naam" />
          </div>
          <div>
            <label style={lbl}>Mother's Name</label>
            <input style={inp} name="mother" value={form.mother}
              onChange={handle} placeholder="Mata ka naam" />
          </div>
          <div>
            <label style={lbl}>Gender *</label>
            <select style={inp} name="gender"
              value={form.gender} onChange={handle}>
              <option value="">Select karo</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Category *</label>
            <select style={inp} name="category"
              value={form.category} onChange={handle}>
              <option value="">Select karo</option>
              <option>General</option>
              <option>OBC</option>
              <option>SC</option>
              <option>ST</option>
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Address *</label>
          <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }}
            name="address" value={form.address}
            onChange={handle} placeholder="Poora pata" />
        </div>
      </div>

      {/* Contact Details */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(240,180,41,0.2)",
        borderRadius: "12px", padding: "1.5rem",
        marginBottom: "1.5rem"
      }}>
        <h3 style={{ color: "#f0b429", marginBottom: "1.2rem" }}>
          📞 Contact Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <div>
            <label style={lbl}>Mobile Number *</label>
            <input style={inp} name="mobile" value={form.mobile}
              onChange={handle} placeholder="10 digit number" />
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" name="email"
              value={form.email} onChange={handle}
              placeholder="email@example.com" />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(240,180,41,0.2)",
        borderRadius: "12px", padding: "1.5rem",
        marginBottom: "1.5rem"
      }}>
        <h3 style={{ color: "#f0b429", marginBottom: "1.2rem" }}>
          🎓 Academic Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <div>
            <label style={lbl}>10th Percentage *</label>
            <input style={inp} name="tenthPercent"
              value={form.tenthPercent} onChange={handle}
              placeholder="Jaise: 75.5" />
          </div>
          <div>
            <label style={lbl}>10th Board *</label>
            <select style={inp} name="tenthBoard"
              value={form.tenthBoard} onChange={handle}>
              <option value="">Select karo</option>
              <option>BSE Odisha</option>
              <option>CBSE</option>
              <option>ICSE</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Course Choice *</label>
            <select style={inp} name="course"
              value={form.course} onChange={handle}>
              <option value="">Course select karo</option>
              <option>Civil Engineering</option>
              <option>Electrical Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Computer Science & Technology</option>
              <option>Electronics & Telecom</option>
              <option>Mining Engineering</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submit}
        disabled={loading}
        style={{
          width: "100%", padding: "1rem",
          background: loading
            ? "rgba(240,180,41,0.4)"
            : "linear-gradient(135deg, #f0b429, #c47a2b)",
          border: "none", borderRadius: "8px",
          color: "#0d1b2a", fontWeight: "800",
          fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.05em", textTransform: "uppercase"
        }}
      >
        {loading ? "Submitting..." : "Submit Application →"}
      </button>
    </div>
  );
}
