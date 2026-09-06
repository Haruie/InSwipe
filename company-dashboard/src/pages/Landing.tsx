import { useState } from "react";
import { BrandLockup, BrandMark } from "../components/Brand";

interface Props {
  onHiring: () => void;
  onSignIn: () => void;
}

/**
 * Footer link. With an `href` it scrolls to that section. Without one there's no page to
 * go to yet, so it stays inert rather than using href="#", which jumped to the top.
 */
function FooterLink({ label, href }: { label: string; href?: string }) {
  const base = { fontSize: 13, color: "#6B7280", textDecoration: "none", transition: "color 0.15s" } as const;
  const hover = (e: React.MouseEvent<HTMLElement>, on: boolean) =>
    (e.currentTarget.style.color = on ? "#fff" : "#6B7280");

  if (!href) {
    return (
      <span
        title="Not part of this prototype"
        style={{ ...base, cursor: "default" }}
        onMouseEnter={(e) => hover(e, true)}
        onMouseLeave={(e) => hover(e, false)}
      >
        {label}
      </span>
    );
  }
  return (
    <a href={href} style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
      {label}
    </a>
  );
}

export default function Landing({ onHiring, onSignIn }: Props) {
  const [_mobileMenu, setMobileMenu] = useState(false);
  void setMobileMenu;

  // No overflow-x on the root div: it would make it a scroll container and the sticky
  // nav would stick to it instead of the viewport. Handled on html/body in index.css.
  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F7F7FB", minHeight: "100vh" }}>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .float-card { animation: floatCard 4s ease-in-out infinite; }
        .fade-in-1 { animation: fadeInUp 0.6s ease both; }
        .fade-in-2 { animation: fadeInUp 0.6s 0.15s ease both; }
        .fade-in-3 { animation: fadeInUp 0.6s 0.3s ease both; }
        .nav-link:hover { color: #4F46E5; }
        .btn-outline-indigo:hover { background: #EEF0FF; }
        .btn-indigo:hover { background: #4338CA; }
        html { scroll-behavior: smooth; }
        /* Clear the 64px sticky nav when jumping to a section */
        section[id] { scroll-margin-top: 64px; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E8E8EF", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={36} />
            <span style={{ fontWeight: 700, fontSize: 18, color: "#0F1117", letterSpacing: -0.4 }}>InSwipe</span>
          </div>
          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "For students", href: "#for-students" },
              { label: "For companies", href: "#for-companies" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none", transition: "color 0.15s" }}>{l.label}</a>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onSignIn} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151", padding: "8px 12px" }} className="nav-link">
              Sign in
            </button>
            <button onClick={onHiring} className="btn-indigo" style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 40px 80px", display: "flex", alignItems: "center", gap: 80 }}>
        {/* Left */}
        <div style={{ flex: "0 0 520px" }} className="fade-in-1">
          {/* The lockup carries the tagline, so it stands in for the pill that used to
              say the same thing here. This is the one slot wide enough to read it. */}
          <div style={{ marginBottom: 28 }}>
            <BrandLockup width={380} />
          </div>
          <h1 style={{ fontSize: 68, fontWeight: 800, color: "#0F1117", lineHeight: 1.08, letterSpacing: -2, marginBottom: 24 }}>
            Find the internship<br />that fits <span style={{ color: "#4F46E5" }}>you.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#374151", lineHeight: 1.65, marginBottom: 40, maxWidth: 460 }}>
            AI-powered matchmaking between students and the companies looking for their next intern.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={onHiring} className="btn-indigo" style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", boxShadow: "0 4px 12px rgba(79,70,229,.3)" }}>
              Start hiring
            </button>
            <a href="#how-it-works" className="btn-outline-indigo" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#4F46E5", border: "2px solid #4F46E5", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", textDecoration: "none" }}>
              See how it works
            </a>
          </div>
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex" }}>
              {["#6C5CE7", "#4F46E5", "#A78BFA", "#818CF8", "#C4B5FD"].map((c, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8 }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#6B7280" }}><strong style={{ color: "#0F1117" }}>18,000+</strong> students already matched</p>
          </div>
        </div>

        {/* Right — hero card */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
          <div className="float-card" style={{ width: 340, boxShadow: "0 8px 24px rgba(15,17,23,.10), 0 0 60px rgba(79,70,229,.18)", borderRadius: 20, overflow: "hidden", background: "#fff" }}>
            {/* Card photo area */}
            <div style={{ height: 160, background: "linear-gradient(135deg, #1B1730 0%, #3B2A6E 50%, #4F46E5 100%)", position: "relative" }}>
              {/* Fit pill */}
              <div style={{ position: "absolute", top: 12, right: 12, background: "#DCFCE7", color: "#15803D", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                92% fit
              </div>
              {/* Logo tile */}
              <div style={{ position: "absolute", bottom: -18, left: 16, width: 44, height: 44, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.12)", fontWeight: 800, fontSize: 18, color: "#4F46E5" }}>
                T
              </div>
            </div>
            {/* Card body */}
            <div style={{ padding: "28px 16px 16px" }}>
              {/* Company */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0F1117" }}>TechNova</span>
                <span style={{ background: "#EEF0FF", color: "#4F46E5", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>✓ Verified</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>📍 Bangalore · Hybrid</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1117", marginBottom: 12 }}>Frontend Developer Intern</div>
              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {[{ label: "React", fit: true }, { label: "JavaScript", fit: true }, { label: "REST APIs", fit: true }, { label: "Docker", fit: false }, { label: "PostgreSQL", fit: false }].map((s) => (
                  <span key={s.label} style={{
                    fontSize: 12, fontWeight: 500, borderRadius: 999, padding: "3px 10px",
                    background: s.fit ? "#DCFCE7" : "transparent",
                    color: s.fit ? "#15803D" : "#EA580C",
                    border: s.fit ? "none" : "1.5px solid #EA580C"
                  }}>
                    {s.fit ? "✓ " : "○ "}{s.label}
                  </span>
                ))}
              </div>
              {/* Footer row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #E8E8EF" }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>3 months</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>₹20,000/month</span>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>Tap for full requirements</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "#fff", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#0F1117", letterSpacing: -1, marginBottom: 14 }}>How it works</h2>
            <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 480, margin: "0 auto" }}>Two sides, one platform — connected by AI</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, justifyContent: "center" }}>
            {/* Students column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-end", flex: 1, maxWidth: 340 }}>
              <div style={{ marginBottom: 12, padding: "6px 14px", background: "#EEF0FF", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>For Students</div>
              {[
                { icon: "📄", label: "Upload resume" },
                { icon: "🤖", label: "AI builds profile" },
                { icon: "👆", label: "Swipe jobs" },
                { icon: "✅", label: "Apply" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F7F7FB", border: "1px solid #E8E8EF", borderRadius: 12, padding: "12px 18px", width: 220, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{step.label}</span>
                    <span style={{ fontSize: 20 }}>{step.icon}</span>
                  </div>
                  {i < 3 && (
                    <div style={{ width: 2, height: 24, background: "#E8E8EF", marginRight: 24, marginTop: 0 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Center node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px", paddingTop: 44 }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #6C5CE7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(79,70,229,.3)", textAlign: "center", padding: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>Conversation<br />starts 🎉</span>
              </div>
            </div>

            {/* Companies column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-start", flex: 1, maxWidth: 340 }}>
              <div style={{ marginBottom: 12, padding: "6px 14px", background: "#EEF0FF", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>For Companies</div>
              {[
                { icon: "📝", label: "Post a job" },
                { icon: "📊", label: "See ranked applicants" },
                { icon: "👇", label: "Select" },
                { icon: "💬", label: "Talk" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F7F7FB", border: "1px solid #E8E8EF", borderRadius: 12, padding: "12px 18px", width: 220 }}>
                    <span style={{ fontSize: 20 }}>{step.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{step.label}</span>
                  </div>
                  {i < 3 && (
                    <div style={{ width: 2, height: 24, background: "#E8E8EF", marginLeft: 24, marginTop: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOR STUDENTS */}
      <section id="for-students" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 80 }}>
          {/* Left text */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EEF0FF", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>For Students</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: "#0F1117", letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>
              Your resume,<br />understood.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              Stop sending the same resume to 50 companies. Let AI match you to the roles where you actually fit — and tell you exactly why.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "⚡", title: "Resume understood in seconds", desc: "Upload once, AI extracts your skills, projects, and strengths automatically." },
                { icon: "🎯", title: "Jobs ranked by your fit", desc: "See a personalised fit score for every role — no more guessing." },
                { icon: "💡", title: "Know exactly what you match", desc: "Skill-by-skill breakdown shows your strengths and gaps per job." },
              ].map((b) => (
                <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F1117", marginBottom: 3 }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div style={{ flex: "0 0 320px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 260, height: 500, borderRadius: 36, background: "#1B1730", boxShadow: "0 24px 48px rgba(15,17,23,.2)", padding: 10, position: "relative" }}>
              {/* Phone notch */}
              <div style={{ width: 80, height: 24, background: "#0F1117", borderRadius: 12, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#333" }} />
              </div>
              {/* Screen */}
              <div style={{ background: "#F7F7FB", borderRadius: 26, height: "calc(100% - 32px)", overflow: "hidden", padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 10, textAlign: "center" }}>3 jobs for you today</div>
                {/* Mini card stack */}
                <div style={{ position: "relative", height: 280 }}>
                  {[{ rotate: -2, y: 10, z: 0 }, { rotate: 1, y: 5, z: 1 }, { rotate: 0, y: 0, z: 2 }].map((c, i) => (
                    <div key={i} style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      transform: `rotate(${c.rotate}deg) translateY(${c.y}px)`,
                      zIndex: c.z,
                      background: "#fff",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(15,17,23,.08)"
                    }}>
                      <div style={{ height: 90, background: "linear-gradient(135deg, #1B1730, #4F46E5)" }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#0F1117" }}>Frontend Developer Intern</div>
                        <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 6 }}>TechNova · Bangalore</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ fontSize: 9, background: "#DCFCE7", color: "#15803D", borderRadius: 999, padding: "2px 7px" }}>✓ React</span>
                          <span style={{ fontSize: 9, background: "#DCFCE7", color: "#15803D", borderRadius: 999, padding: "2px 7px" }}>✓ JS</span>
                          <span style={{ fontSize: 9, color: "#EA580C", border: "1px solid #EA580C", borderRadius: 999, padding: "2px 7px" }}>○ Docker</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Swipe buttons */}
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(220,38,38,.15)" }}>✕</div>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(245,158,11,.15)" }}>🔖</div>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(22,163,74,.15)" }}>✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR COMPANIES */}
      <section id="for-companies" style={{ background: "#fff", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 80 }}>
          {/* Left: mockup */}
          <div style={{ flex: "0 0 440px" }}>
            <div style={{ background: "#F7F7FB", border: "1px solid #E8E8EF", borderRadius: 20, padding: 20, boxShadow: "0 4px 12px rgba(15,17,23,.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1117", marginBottom: 14 }}>Applicants — Frontend Developer Intern</div>
              {[
                { name: "Priya S.", score: 94, skills: ["React", "JS", "REST APIs"], gap: [] },
                { name: "Arjun M.", score: 88, skills: ["React", "JS"], gap: ["Docker"] },
                { name: "Sneha K.", score: 79, skills: ["JS", "REST APIs"], gap: ["React", "Docker"] },
                { name: "Rahul T.", score: 71, skills: ["JS"], gap: ["React", "Docker", "PostgreSQL"] },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 12, marginBottom: 8, border: "1px solid #E8E8EF" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#4F46E5", flexShrink: 0 }}>
                    {a.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0F1117" }}>{a.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {a.skills.map((s) => <span key={s} style={{ fontSize: 10, background: "#DCFCE7", color: "#15803D", borderRadius: 999, padding: "1px 7px" }}>✓ {s}</span>)}
                      {a.gap.map((s) => <span key={s} style={{ fontSize: 10, color: "#EA580C", border: "1px solid #EA580C", borderRadius: 999, padding: "1px 7px" }}>○ {s}</span>)}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: 14,
                    color: a.score >= 85 ? "#16A34A" : a.score >= 70 ? "#4F46E5" : "#6B7280"
                  }}>
                    {a.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right text */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EEF0FF", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>For Companies</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: "#0F1117", letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>
              Every applicant,<br />ranked by fit.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              Stop sifting through hundreds of unranked CVs. InSwipe shows you who fits your role — and exactly why.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "📊", title: "See every applicant ranked by fit", desc: "AI scores each candidate against your exact job requirements." },
                { icon: "🔍", title: "Exact skill-by-skill breakdown", desc: "See what each candidate has and lacks before the first call." },
                { icon: "⚡", title: "Select and start talking instantly", desc: "One click to shortlist. Built-in chat starts the conversation." },
              ].map((b) => (
                <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F1117", marginBottom: 3 }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onHiring} className="btn-indigo" style={{ marginTop: 36, background: "#4F46E5", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Post a role →
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section style={{ background: "linear-gradient(135deg, #6C5CE7, #A78BFA)", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: "2,400+", label: "Jobs posted" },
            { value: "18,000+", label: "Students" },
            { value: "890+", label: "Selections made" },
            { value: "<48h", label: "Time to first conversation" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 10, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LOGOS */}
      <section style={{ background: "#fff", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>Trusted by teams at</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {["Razorpay", "Zomato", "Swiggy", "Nexora Labs", "PixelForge", "Zerodha"].map((name) => (
              <span key={name} style={{ fontSize: 16, fontWeight: 700, color: "#D1D5DB", letterSpacing: -0.3 }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ padding: "96px 40px", background: "#F7F7FB" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: "#0F1117", letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
            Ready to find your<br />next intern?
          </h2>
          <p style={{ fontSize: 16, color: "#374151", marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of companies and students already using InSwipe.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button onClick={onHiring} className="btn-indigo" style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,.3)" }}>
              Post your first role
            </button>
            <button onClick={onSignIn} className="btn-outline-indigo" style={{ background: "#fff", color: "#4F46E5", border: "2px solid #4F46E5", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0F1117", padding: "64px 40px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <BrandMark size={32} />
                <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>InSwipe</span>
              </div>
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, maxWidth: 220 }}>AI-powered internship matching for the next generation of talent.</p>
            </div>
            {/* Link columns */}
            {[
              { heading: "Product", links: [
                { label: "How it works", href: "#how-it-works" },
                { label: "Changelog" },
                { label: "Status" },
              ] },
              { heading: "For Students", links: [
                { label: "Browse jobs", href: "#for-students" },
                { label: "Resume tips" },
                { label: "Fit scores explained", href: "#for-students" },
                { label: "Help center" },
              ] },
              { heading: "Company", links: [
                { label: "About", href: "#for-companies" },
                { label: "Blog" },
                { label: "Careers" },
                { label: "Press" },
              ] },
              { heading: "Legal", links: [
                { label: "Privacy" },
                { label: "Terms" },
                { label: "Cookie policy" },
                { label: "Security" },
              ] },
            ].map((col) => (
              <div key={col.heading}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>{col.heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <FooterLink key={l.label} label={l.label} href={l.href} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1F2937", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#4B5563" }}>© 2026 InSwipe Technologies Pvt. Ltd. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "#4B5563" }}>Made with ♥ in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
