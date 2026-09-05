import { useState } from "react";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Screen = "signup" | "step1" | "step3";

export default function CompanyOnboarding({ onComplete, onBack }: Props) {
  const [screen, setScreen] = useState<Screen>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("TechNova");
  const [password, setPassword] = useState("");

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#F7F7FB" }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner { animation: spin 1s linear infinite; }
        .input-field:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        .btn-indigo:hover { background: #4338CA !important; }
        .btn-outline:hover { background: #EEF0FF !important; }
        .text-link:hover { color: #4F46E5; }
        .back-link:hover { color: #4F46E5; }
      `}</style>

      {/* Back link */}
      <div style={{ position: "fixed", top: 20, left: 24, zIndex: 200 }}>
        <button onClick={onBack} className="back-link" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#6B7280", transition: "color 0.15s" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to landing
        </button>
      </div>

      {/* Keying on `screen` remounts the panel on every transition, so each step fades and
          slides in rather than snapping — the same treatment App.tsx gives top-level views. */}
      <div key={screen} className="anim-fade-in">
        {screen === "signup" && <SignupScreen email={email} setEmail={setEmail} company={company} setCompany={setCompany} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} onNext={() => setScreen("step1")} onSignIn={onComplete} />}
        {screen === "step1" && <Step1Screen company={company} setCompany={setCompany} onNext={() => setScreen("step3")} onBack={() => setScreen("signup")} />}
        {screen === "step3" && <Step3Screen onComplete={onComplete} onBack={() => setScreen("step1")} />}
      </div>
    </div>
  );
}

/* ─── SCREEN A: Sign up ──────────────────────────────────────────────────── */

interface SignupProps {
  email: string; setEmail: (v: string) => void;
  company: string; setCompany: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  onNext: () => void;
  onSignIn: () => void;
}

function SignupScreen({ email, setEmail, company, setCompany, password, setPassword, showPassword, setShowPassword, onNext, onSignIn }: SignupProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left: form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px", background: "#fff", maxWidth: 600 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>IS</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0F1117" }}>InSwipe</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0F1117", letterSpacing: -0.8, marginBottom: 8 }}>Create your company account</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 36 }}>Start hiring your next great intern in minutes.</p>

        {/* Google SSO */}
        <button onClick={onNext} className="btn-outline" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#fff", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: 20, transition: "background 0.15s" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#E8E8EF" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#E8E8EF" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Work email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Work email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anjali@technova.in"
              style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 5 }}>Use your company email — it's how you get verified</p>
          </div>
          {/* Company name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Company name</label>
            <input
              type="text"
              className="input-field"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="TechNova"
              style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
          </div>
          {/* Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 44px 11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button onClick={onNext} className="btn-indigo" style={{ width: "100%", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 24, transition: "background 0.15s", boxShadow: "0 4px 12px rgba(79,70,229,.25)" }}>
          Create account
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 20 }}>
          Already have an account?{" "}
          <button onClick={onSignIn} className="text-link" style={{ background: "none", border: "none", cursor: "pointer", color: "#4F46E5", fontWeight: 600, fontSize: 13, transition: "color 0.15s" }}>
            Sign in
          </button>
        </p>
      </div>

      {/* Right: testimonial */}
      <div style={{ flex: 1, background: "linear-gradient(135deg, #3730A3, #4F46E5 60%, #6C5CE7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 64 }}>
        <div style={{ maxWidth: 440 }}>
          {/* Stars */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FCD34D">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <blockquote style={{ fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1.55, marginBottom: 32, letterSpacing: -0.3 }}>
            "InSwipe helped us find the right frontend intern in 3 days. The fit scores saved hours of screening."
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#4F46E5", flexShrink: 0 }}>
              AM
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Anjali Mehta</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Talent Lead · Razorpay</div>
            </div>
          </div>
          {/* Razorpay wordmark */}
          <div style={{ marginTop: 32, padding: "14px 20px", background: "rgba(255,255,255,0.12)", borderRadius: 12, display: "inline-block" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.3 }}>Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SCREEN B: Step 1 of 3 ──────────────────────────────────────────────── */

interface Step1Props {
  company: string;
  setCompany: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step1Screen({ company, setCompany, onNext, onBack }: Step1Props) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left: progress rail */}
      <ProgressRail currentStep={1} />

      {/* Right: form */}
      <div style={{ flex: 1, padding: "72px 80px", overflowY: "auto" }}>
        <div style={{ maxWidth: 580 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F1117", letterSpacing: -0.6, marginBottom: 6 }}>Company profile</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 40 }}>Tell us a bit about your company. This appears on your job posts.</p>

          {/* Logo upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Company logo</label>
            <div style={{ border: "2px dashed #D1D5DB", borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F46E5"; e.currentTarget.style.background = "#FAFBFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "transparent"; }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px" }}>
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
              </svg>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Drop your logo here or <span style={{ color: "#4F46E5", fontWeight: 600 }}>click to browse</span></p>
              <p style={{ fontSize: 11, color: "#9CA3AF" }}>PNG, SVG or JPG · Max 2 MB · Square works best</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
            <FormField label="Company name" value={company} onChange={setCompany} placeholder="TechNova" />
            <FormField label="Tagline" value="" onChange={() => {}} placeholder="AI tools for developers" />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              className="input-field"
              placeholder="Describe what your company does, your culture, and what makes you a great place to intern..."
              rows={3}
              style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", resize: "vertical", fontFamily: "Inter, sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <FormSelect label="Industry" value="AI Infrastructure" options={["AI Infrastructure", "Fintech", "EdTech", "E-commerce", "SaaS", "HealthTech", "Gaming"]} />
            <FormSelect label="Company size" value="200–400" options={["1–10", "11–50", "51–200", "200–400", "400–1000", "1000+"]} />
            <FormField label="Founded year" value="" onChange={() => {}} placeholder="2019" />
            <FormField label="Website" value="" onChange={() => {}} placeholder="https://technova.in" />
          </div>

          <div style={{ marginTop: 16 }}>
            <FormField label="HQ location" value="" onChange={() => {}} placeholder="Bangalore, India" />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <button onClick={onBack} style={{ background: "#fff", color: "#374151", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "13px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back
            </button>
            <button onClick={onNext} className="btn-indigo" style={{ flex: 1, background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SCREEN C: Step 3 — Verification ───────────────────────────────────── */

interface Step3Props {
  onComplete: () => void;
  onBack: () => void;
}

function Step3Screen({ onComplete, onBack }: Step3Props) {
  const [resent, setResent] = useState(false);
  const onResend = () => setResent(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ProgressRail currentStep={3} />
      <div style={{ flex: 1, padding: "72px 80px", display: "flex", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F1117", letterSpacing: -0.6, marginBottom: 6 }}>Verify your domain</h2>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 36 }}>
            {"We'll send a confirmation to your company email to verify you represent TechNova."}
          </p>

          {/* Status badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 12, padding: "12px 20px", marginBottom: 36 }}>
            <div className="spinner" style={{ width: 16, height: 16, border: "2.5px solid #FCD34D", borderTopColor: "#F59E0B", borderRadius: "50%" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#92400E" }}>Verification pending</span>
          </div>

          {/* Email preview */}
          <div style={{ background: "#F7F7FB", border: "1px solid #E8E8EF", borderRadius: 14, padding: 20, marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Email sent to</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1117" }}>verify@technova.in</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Check your inbox and spam folder</div>
              </div>
            </div>
          </div>

          {/* Verified badge preview */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Your badge after verification</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 999, padding: "6px 14px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>✓ Verified Company</span>
            </div>
          </div>

          {/* Benefit note */}
          <div style={{ background: "#EEF0FF", borderRadius: 12, padding: "16px 20px", marginBottom: 36 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontSize: 13, color: "#3730A3", lineHeight: 1.6 }}>
                Verified companies appear first in student search and receive <strong>3× more applications</strong>.
              </p>
            </div>
          </div>

          {/* Resend */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onResend}
              disabled={resent}
              className="text-link"
              style={{ background: "none", border: "none", cursor: resent ? "default" : "pointer", fontSize: 13, color: resent ? "#9CA3AF" : "#4F46E5", fontWeight: 600 }}
            >
              Resend verification email
            </button>
            {resent && (
              <span className="anim-fade-in" style={{ fontSize: 13, color: "#15803D", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Sent
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onBack} style={{ background: "#fff", color: "#374151", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "13px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back
            </button>
            <button onClick={onComplete} className="btn-indigo" style={{ flex: 1, background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}>
              {"I've verified my email →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared: Progress Rail ──────────────────────────────────────────────── */

function ProgressRail({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Company profile", desc: "Logo, bio, details" },
    { num: 2, label: "Team", desc: "Add your hiring team" },
    { num: 3, label: "Verification", desc: "Confirm your domain" },
  ];

  return (
    <div style={{ width: 280, background: "#fff", borderRight: "1px solid #E8E8EF", padding: "72px 32px", display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>IS</div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#0F1117" }}>InSwipe</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {steps.map((step, i) => {
          const isActive = step.num === currentStep;
          const isDone = step.num < currentStep;
          return (
            <div key={step.num} style={{ display: "flex", gap: 16, position: "relative" }}>
              {/* Line connector */}
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", left: 11, top: 28, width: 2, height: 48, background: isDone ? "#4F46E5" : "#E8E8EF", zIndex: 0 }} />
              )}
              {/* Dot */}
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: isDone ? "#4F46E5" : isActive ? "#4F46E5" : "#E8E8EF", border: isActive && !isDone ? "none" : "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginTop: 2 }}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#fff" : "#9CA3AF" }} />
                )}
              </div>
              {/* Text */}
              <div style={{ paddingBottom: i < steps.length - 1 ? 48 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive || isDone ? "#0F1117" : "#9CA3AF", marginBottom: 2 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: isActive ? "#6B7280" : "#9CA3AF" }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared: Form helpers ───────────────────────────────────────────────── */

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
      />
    </div>
  );
}

function FormSelect({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <select
        defaultValue={value}
        className="input-field"
        style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", cursor: "pointer", appearance: "none" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
