import Gallery from "./Gallery";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AdmissionForm from "./AdmissionForm";
import DepartmentPage from "./Departmentpage";
import AdminUpload from "./AdminUpload";
import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const NAV_LINKS = ["Home", "About", "Courses", "Faculty", "Admissions", "Gallery", "Contact"];

const COURSES = [
  { name: "Civil Engineering", duration: "3 Years", seats: 60, icon: "🏗️", color: "#1a4a6b" },
  { name: "Electrical Engineering", duration: "3 Years", seats: 60, icon: "⚡", color: "#c47a2b" },
  { name: "Mechanical Engineering", duration: "3 Years", seats: 60, icon: "⚙️", color: "#2b6b4a" },
  { name: "Computer Science & Tech", duration: "3 Years", seats: 60, icon: "💻", color: "#4a2b6b" },
  { name: "Electronics & Telecom", duration: "3 Years", seats: 60, icon: "📡", color: "#6b2b2b" },
  { name: "Mining Engineering", duration: "3 Years", seats: 40, icon: "⛏️", color: "#3a3a1a" },
];

const STATS = [
  { label: "Students Enrolled", value: 1200, suffix: "+" },
  { label: "Faculty Members", value: 48, suffix: "" },
  { label: "Years of Excellence", value: 25, suffix: "+" },
  { label: "Placement Rate", value: 87, suffix: "%" },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ stat, animate }) {
  const count = useCountUp(stat.value, 1800, animate);
  return (
    <div style={{
      textAlign: "center",
      padding: "2rem 1.5rem",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.12)",
      backdropFilter: "blur(10px)",
      transition: "transform 0.3s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "3rem", fontWeight: "800", color: "#f0b429", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
        {animate ? count : 0}{stat.suffix}
      </div>
      <div style={{ marginTop: "0.5rem", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {stat.label}
      </div>
    </div>
  );
}

function MainSite() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // ── Firebase data ──
  const [notices, setNotices] = useState([]);
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Fetch notices + faculty from Firestore ──
  useEffect(() => {
    // Notices
    getDocs(collection(db, "notices")).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Latest pehle
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotices(data);
    }).catch(err => console.error("Notices fetch error:", err));

    // Faculty — HODs + regular faculty dono
    Promise.all([
      getDocs(collection(db, "hods")),
      getDocs(collection(db, "faculty")),
    ]).then(([hodSnap, facSnap]) => {
      setFaculty([
        ...hodSnap.docs.map(d => ({ id: d.id, ...d.data(), type: "hod" })),
        ...facSnap.docs.map(d => ({ id: d.id, ...d.data(), type: "faculty" })),
      ]);
    }).catch(err => console.error("Faculty fetch error:", err));
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", background: "#0d1b2a", color: "#e8e0d0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Playfair+Display:wght@700;900&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1b2a; }
        ::-webkit-scrollbar-thumb { background: #f0b429; border-radius: 3px; }
        html { scroll-behavior: smooth; }
        .nav-link { 
          color: rgba(255,255,255,0.8); 
          text-decoration: none; 
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          letter-spacing: 0.05em;
          padding: 0.4rem 0;
          border-bottom: 2px solid transparent;
          transition: all 0.25s;
          cursor: pointer;
        }
        .nav-link:hover, .nav-link.active { color: #f0b429; border-bottom-color: #f0b429; }
        .btn-primary {
          background: linear-gradient(135deg, #f0b429, #c47a2b);
          color: #0d1b2a;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 4px;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(240,180,41,0.4); }
        .btn-outline {
          background: transparent;
          color: #f0b429;
          border: 2px solid #f0b429;
          padding: 0.75rem 1.8rem;
          border-radius: 4px;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
        }
        .btn-outline:hover { background: rgba(240,180,41,0.1); transform: translateY(-2px); }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          color: #f0b429;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .section-subtitle {
          text-align: center;
          color: rgba(232,224,208,0.65);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }
        .course-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.3s;
          cursor: pointer;
        }
        .course-card:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          border-color: rgba(240,180,41,0.3);
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .divider-line {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #f0b429, #c47a2b);
          margin: 0.75rem auto 2rem;
          border-radius: 2px;
        }
        .faculty-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }
        .faculty-card:hover {
          transform: translateY(-6px);
          border-color: rgba(240,180,41,0.3);
          background: rgba(255,255,255,0.07);
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0d1b2a;
          background: linear-gradient(135deg, #f0b429, #c47a2b);
          overflow: hidden;
        }
        input, textarea {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          padding: 0.9rem 1.2rem;
          color: #e8e0d0;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }
        input:focus, textarea:focus { border-color: #f0b429; }
        input::placeholder, textarea::placeholder { color: rgba(232,224,208,0.4); }
        label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; color: rgba(232,224,208,0.7); letter-spacing: 0.05em; text-transform: uppercase; }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg, #1a3a5c, #0d2035)", borderBottom: "1px solid rgba(240,180,41,0.2)", padding: "0.5rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem", color: "rgba(232,224,208,0.7)" }}>
            <span>📞 06678-234567</span>
            <span>✉️ gpnuapada@odisha.gov.in</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.3)", borderRadius: "4px", padding: "0.2rem 0.8rem", fontSize: "0.8rem", color: "#f0b429" }}>
              📢 Admissions Open 2026-27
            </div>
          </div>
        </div>
      </div>

      {/* Logo + College Name Block */}
      <div style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        height: "10vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(13,27,42,0.75)", zIndex: 1 }} />
        <div style={{
          position: "relative", zIndex: 2, maxWidth: "800px",
          padding: "0.3rem 0.8rem", background: "rgba(26,74,107,0.55)",
          borderRadius: "8px", border: "1px solid rgba(240,180,41,0.5)",
          backdropFilter: "blur(6px)", boxShadow: "0 3px 12px rgba(0,0,0,0.5)",
          textAlign: "center", transition: "all 0.3s ease",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={{ fontSize: "2.2rem", marginBottom: "0.15rem" }}>🏛️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.3rem, 3vw, 1.6rem)", color: "#f0b429", marginBottom: "0.1rem", textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>
            Govt. Polytechnic Nuapada
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(232,224,208,0.9)", marginBottom: "0.4rem", lineHeight: "1.1" }}>
            Dept. of Tech. Education, Odisha
          </p>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,27,42,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(240,180,41,0.2)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)", height: "80px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }} onClick={() => scrollTo("home")}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #1a3a5c, #0d2035)", border: "2px solid #f0b429", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>🏛️</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#f0b429" }}>Govt. Polytechnic</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(232,224,208,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Nuapada, Odisha</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {NAV_LINKS.map(link => (
              <span key={link} className={`nav-link ${activeNav === link ? "active" : ""}`}
                onClick={() => { setActiveNav(link); scrollTo(link.toLowerCase().replace(" ", "")); }}>
                {link}
              </span>
            ))}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: "#f0b429", fontSize: "1.5rem", cursor: "pointer", display: "none" }}
            className="hamburger">☰</button>
        </div>
        {menuOpen && (
          <div style={{ background: "rgba(13,27,42,0.98)", padding: "1rem 2rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid rgba(240,180,41,0.1)" }}>
            {NAV_LINKS.map(link => (
              <span key={link} className="nav-link" onClick={() => { setActiveNav(link); scrollTo(link.toLowerCase()); }}>{link}</span>
            ))}
          </div>
        )}
      </nav>

      {/* Gallery */}
      <section id="gallery" style={{ padding: "0rem 2rem", background: "#0d1b2a" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto" }}>
          <Gallery />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{ background: "linear-gradient(135deg, #1a3a5c, #0d2035)", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {STATS.map(stat => <StatCard key={stat.label} stat={stat} animate={statsVisible} />)}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: "6rem 2rem", background: "#0d1b2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="section-title">About the Institution</h2>
          <div className="divider-line" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p style={{ color: "rgba(232,224,208,0.8)", lineHeight: 1.9, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Government Polytechnic Nuapada is a premier technical institution established under the Department of Technical Education & Training, Government of Odisha. Located in the tribal-dominated district of Nuapada, the college has been instrumental in bringing quality technical education to the aspirants of this region.
              </p>
              <p style={{ color: "rgba(232,224,208,0.8)", lineHeight: 1.9, fontSize: "1.05rem", marginBottom: "2rem" }}>
                Approved by AICTE and affiliated to SCTE&VT Odisha, we offer 3-year diploma programmes in engineering and technology. Our state-of-the-art laboratories, experienced faculty, and industry collaborations ensure students are job-ready upon graduation.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {["AICTE Approved", "SCTE&VT Affiliated", "ISO Certified", "Govt. of Odisha"].map(badge => (
                  <div key={badge} style={{ background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: "6px", padding: "0.7rem 1rem", fontSize: "0.9rem", color: "#f0b429", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>✓</span> {badge}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(240,180,41,0.15)", borderRadius: "16px", padding: "2.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#f0b429", marginBottom: "1.5rem" }}>Principal's Message</h3>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #f0b429, #c47a2b)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#0d1b2a", fontWeight: 700, marginBottom: "1.2rem" }}>SP</div>
              <p style={{ color: "rgba(232,224,208,0.75)", lineHeight: 1.9, fontSize: "1rem", fontStyle: "italic" }}>
                "Our mission is to provide quality technical education that transforms students into competent professionals. We believe in nurturing talent and creating opportunities for every student, regardless of their background."
              </p>
              <p style={{ marginTop: "1rem", color: "#f0b429", fontSize: "0.9rem", fontWeight: 600 }}>— Dr. S. K. Panda, Principal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" style={{ padding: "6rem 2rem", background: "linear-gradient(180deg, #0d1b2a, #0d2035)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="section-title">Diploma Programmes</h2>
          <div className="divider-line" />
          <p className="section-subtitle">3-Year full-time diploma programmes approved by AICTE and affiliated to SCTE&VT Odisha</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {COURSES.map(course => (
              <div key={course.name} className="course-card" onClick={() => navigate(`/department/${encodeURIComponent(course.name)}`)}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{course.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#e8e0d0", marginBottom: "0.5rem" }}>{course.name}</h3>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <span style={{ background: "rgba(240,180,41,0.1)", color: "#f0b429", padding: "0.25rem 0.75rem", borderRadius: "4px", fontSize: "0.8rem" }}>⏱ {course.duration}</span>
                  <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,224,208,0.7)", padding: "0.25rem 0.75rem", borderRadius: "4px", fontSize: "0.8rem" }}>👥 {course.seats} Seats</span>
                </div>
                <div style={{ height: 3, marginTop: "1.2rem", borderRadius: 2, background: `linear-gradient(90deg, ${course.color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty — Firebase se */}
      <section id="faculty" style={{ padding: "6rem 2rem", background: "#0d1b2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="section-title">Our Faculty</h2>
          <div className="divider-line" />
          <p className="section-subtitle">Experienced educators dedicated to shaping the next generation of engineers</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {faculty.length === 0 ? (
              <p style={{ textAlign: "center", color: "rgba(232,224,208,0.4)", gridColumn: "1/-1" }}>
                Faculty data load ho raha hai...
              </p>
            ) : faculty.map(f => (
              <div key={f.id} className="faculty-card">
                <div className="avatar">
                  {f.photoUrl
                    ? <img src={f.photoUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (f.name || "").split(" ").map(w => w[0]).join("").slice(0, 2)
                  }
                </div>
                <h3 style={{ fontSize: "1.1rem", color: "#e8e0d0", fontWeight: 600, marginBottom: "0.25rem" }}>{f.name}</h3>
                <p style={{ color: "#f0b429", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {f.role || (f.type === "hod" ? "HOD" : "Faculty")}
                </p>
                <p style={{ color: "rgba(232,224,208,0.5)", fontSize: "0.85rem" }}>{f.department}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions */}
      <section id="admissions" style={{ padding: "6rem 2rem", background: "linear-gradient(135deg, #1a3a5c, #0d2035)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="section-title">Admissions 2026–27</h2>
          <div className="divider-line" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#f0b429", fontSize: "1.4rem", marginBottom: "1.5rem" }}>Eligibility & Process</h3>
              {[
                { step: "01", title: "Eligibility", desc: "10th pass with Mathematics & Science. Minimum 35% marks." },
                { step: "02", title: "Apply Online", desc: "Visit SAMS Odisha portal to submit your application." },
                { step: "03", title: "Merit List", desc: "Selection based on SAMS merit cum choice preference." },
                { step: "04", title: "Document Verification", desc: "Report with original documents for verification." },
              ].map(item => (
                <div key={item.step} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f0b429", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ color: "#e8e0d0", fontWeight: 600, marginBottom: "0.2rem" }}>{item.title}</div>
                    <div style={{ color: "rgba(232,224,208,0.6)", fontSize: "0.9rem", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#f0b429", fontSize: "1.4rem", marginBottom: "1.5rem" }}>Important Dates</h3>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                {[
                  { event: "Online Registration Starts", date: "Mar 1, 2026" },
                  { event: "Last Date to Apply", date: "Apr 15, 2026" },
                  { event: "Merit List Publication", date: "May 5, 2026" },
                  { event: "Document Verification", date: "May 10–20, 2026" },
                  { event: "Classes Commence", date: "Jul 1, 2026" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.2rem", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ color: "rgba(232,224,208,0.8)", fontSize: "0.9rem" }}>{item.event}</span>
                    <span style={{ color: "#f0b429", fontSize: "0.85rem", fontWeight: 600, flexShrink: 0, marginLeft: "1rem" }}>{item.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <a href="https://samsodisha.gov.in" target="_blank" rel="noreferrer">
                  <button className="btn-primary" style={{ width: "100%" }}>Apply via SAMS Odisha Portal →</button>
                </a>
                <AdmissionForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notices — Firebase se */}
      <section style={{ padding: "5rem 2rem", background: "#0d1b2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          <div>
            <h2 className="section-title" style={{ textAlign: "left" }}>Notices & Updates</h2>
            <div style={{ width: 80, height: 3, background: "linear-gradient(90deg, #f0b429, #c47a2b)", borderRadius: 2, marginBottom: "1.5rem" }} />
            {notices.length === 0 ? (
              <p style={{ color: "rgba(232,224,208,0.4)", fontSize: "0.95rem" }}>
                Koi notice nahi hai abhi. Admin panel se add karein.
              </p>
            ) : notices.map((notice) => (
              <div key={notice.id} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#f0b429", fontSize: "0.78rem", fontWeight: 600, flexShrink: 0, marginTop: 2, letterSpacing: "0.05em" }}>
                  {notice.date}
                </div>
                <div style={{ color: "rgba(232,224,208,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  📄 {notice.text}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div id="contact">
            <h2 className="section-title" style={{ textAlign: "left" }}>Contact Us</h2>
            <div style={{ width: 80, height: 3, background: "linear-gradient(90deg, #f0b429, #c47a2b)", borderRadius: 2, marginBottom: "1.5rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div><label>Your Name</label><input type="text" placeholder="Full Name" /></div>
              <div><label>Email Address</label><input type="email" placeholder="email@example.com" /></div>
              <div><label>Message</label><textarea rows={4} placeholder="Write your message here..." style={{ resize: "vertical" }} /></div>
              <button className="btn-primary">Send Message →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#060f18", borderTop: "1px solid rgba(240,180,41,0.1)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem", marginBottom: "2.5rem" }}>
            <div>
              <h4 style={{ fontFamily: "'Playfair Display', serif", color: "#f0b429", fontSize: "1.2rem", marginBottom: "1rem" }}>Govt. Polytechnic Nuapada</h4>
              <p style={{ color: "rgba(232,224,208,0.5)", fontSize: "0.9rem", lineHeight: 1.8 }}>Department of Technical Education & Training, Government of Odisha</p>
            </div>
            <div>
              <h4 style={{ color: "#f0b429", marginBottom: "1rem", fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick Links</h4>
              {["SAMS Odisha", "SCTE&VT Odisha", "AICTE", "Dept. of Tech. Education"].map(link => (
                <div key={link} style={{ color: "rgba(232,224,208,0.5)", fontSize: "0.9rem", marginBottom: "0.5rem", cursor: "pointer" }}>→ {link}</div>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#f0b429", marginBottom: "1rem", fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Address</h4>
              <p style={{ color: "rgba(232,224,208,0.5)", fontSize: "0.9rem", lineHeight: 1.8 }}>
                Government Polytechnic<br />Nuapada – 766105<br />Odisha, India<br />📞 06678-234567
              </p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", textAlign: "center", color: "rgba(232,224,208,0.35)", fontSize: "0.85rem" }}>
            © 2026 Government Polytechnic Nuapada. All rights reserved. | Designed with 🏛️ for the students of Nuapada
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/department/:deptName" element={<DepartmentPage />} />
        <Route path="/admin" element={<AdminUpload />} />
      </Routes>
    </BrowserRouter>
  );
}
