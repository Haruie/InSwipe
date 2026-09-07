import { useState, useEffect } from "react";
import { useAccount, domainOf, type CompanyInfo } from "../lib/account";
import { isGoogleConfigured, signInWithGoogle, preloadGoogle, type GoogleProfile } from "../lib/google";
import { startDomainVerification, checkDomainVerification } from "../lib/verify";
import LogoUpload from "../components/LogoUpload";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Screen = "signup" | "step1" | "step3";

export default function CompanyOnboarding({ onComplete, onBack }: Props) {
  const { account, signUp, updateCompany, setLogo, setDomainVerified } = useAccount();

  const [screen, setScreen] = useState<Screen>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Company details, seeded from the current account (TechNova by default) and
  // edited across signup + step 1, then committed to the account on "Continue".
  const [draft, setDraft] = useState<CompanyInfo>(() => ({ ...account.company }));
  const patch = (p: Partial<CompanyInfo>) => setDraft((d) => ({ ...d, ...p }));

  const finishSignup = (google?: GoogleProfile) => {
    if (google) {
      signUp({
        companyName: draft.name,
        email: google.email,
        authMethod: "google",
        userName: google.name,
        picture: google.picture,
        emailVerified: google.emailVerified,
      });
      setEmail(google.email);
    } else {
      signUp({ companyName: draft.name, email, authMethod: "password" });
    }
    setScreen("step1");
  };

  const finishStep1 = () => {
    updateCompany(draft);
    // Google SSO already proved the email — no domain step to show.
    if (account.domainVerified) onComplete();
    else setScreen("step3");
  };

  const finishVerification = () => {
    setDomainVerified(true);
    onComplete();
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#F7F7FB" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        .input-field:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        .btn-indigo:hover { background: #4338CA !important; }
        .btn-outline:hover { background: #EEF0FF !important; }
        .text-link:hover { color: #4F46E5; }
        .back-link:hover { color: #4F46E5; }
      `}</style>

      <div style={{ position: "fixed", top: 20, left: 24, zIndex: 200 }}>
        <button onClick={onBack} className="back-link" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#6B7280", transition: "color 0.15s" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to landing
        </button>
      </div>

      <div key={screen} className="anim-fade-in">
        {screen === "signup" && (
          <SignupScreen
            email={email} setEmail={setEmail}
            company={draft.name} setCompany={(v) => patch({ name: v })}
            password={password} setPassword={setPassword}
            showPassword={showPassword} setShowPassword={setShowPassword}
            onSignup={finishSignup}
            onSignIn={onComplete}
          />
        )}
        {screen === "step1" && (
          <Step1Screen
            draft={draft} patch={patch}
            onLogo={(url) => { patch({ logo: url }); setLogo(url); }}
            onNext={finishStep1}
            onBack={() => setScreen("signup")}
          />
        )}
        {screen === "step3" && (
          <Step3Screen
            email={email || account.user.email}
            company={draft.name}
            onVerified={finishVerification}
            onBack={() => setScreen("step1")}
          />
        )}
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
  onSignup: (google?: GoogleProfile) => void;
  onSignIn: () => void;
}

function passwordRules(password: string) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "A letter", ok: /[a-zA-Z]/.test(password) },
    { label: "A number", ok: /\d/.test(password) },
  ];
}

function SignupScreen({ email, setEmail, company, setCompany, password, setPassword, showPassword, setShowPassword, onSignup, onSignIn }: SignupProps) {
  const [touched, setTouched] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Warm up Google Identity Services so the click below opens the popup within
  // the user gesture (an await before requestAccessToken gets the popup blocked).
  useEffect(() => { preloadGoogle(); }, []);
  const rules = passwordRules(password);
  const emailValid = /\S+@\S+\.\S+/.test(email.trim());
  const companyValid = company.trim().length > 0;
  const passwordValid = rules.every((r) => r.ok);
  const canSubmit = emailValid && companyValid && passwordValid;

  const errorSty = { fontSize: 12, color: "#DC2626", marginTop: 5 };
  const fieldBorder = (valid: boolean) => (touched && !valid ? "1.5px solid #DC2626" : "1.5px solid #E8E8EF");

  const handleSubmit = () => {
    setTouched(true);
    if (canSubmit) onSignup();
  };

  /**
   * Real Google sign-in when VITE_GOOGLE_CLIENT_ID is set: opens Google's own
   * account chooser and returns the chosen account's profile. With no client ID
   * configured it falls back to a brief simulated connect so the demo still runs.
   */
  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleError(null);
    setGoogleLoading(true);

    if (!isGoogleConfigured()) {
      setTimeout(() => {
        onSignup({
          sub: "sim-google-user",
          name: "Anjali Mehta",
          email: "anjali@technova.in",
          picture: null,
          emailVerified: true,
        });
      }, 900);
      return;
    }

    try {
      const profile = await signInWithGoogle();
      onSignup(profile);
    } catch (e) {
      setGoogleError((e as Error).message || "Google sign-in didn't complete.");
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px", background: "#fff", maxWidth: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>IS</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0F1117" }}>InSwipe</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0F1117", letterSpacing: -0.8, marginBottom: 8 }}>Create your company account</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 36 }}>Start hiring your next great intern in minutes.</p>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="btn-outline"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#fff", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, color: googleLoading ? "#9CA3AF" : "#374151", cursor: googleLoading ? "default" : "pointer", marginBottom: googleError ? 8 : 20, transition: "background 0.15s" }}
        >
          {googleLoading ? (
            <span className="spinner" style={{ width: 16, height: 16, border: "2px solid #E8E8EF", borderTopColor: "#4F46E5", borderRadius: "50%", display: "inline-block" }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
          )}
          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
        </button>
        {googleError && <p style={{ ...errorSty, marginBottom: 16 }}>{googleError}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#E8E8EF" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#E8E8EF" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Work email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              style={{ width: "100%", border: fieldBorder(emailValid), borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
            {touched && !emailValid ? (
              <p style={errorSty}>Enter a valid work email</p>
            ) : (
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 5 }}>Use your company email — it&apos;s how you get verified</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Company name</label>
            <input
              type="text"
              className="input-field"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company"
              style={{ width: "100%", border: fieldBorder(companyValid), borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
            {touched && !companyValid && <p style={errorSty}>Company name is required</p>}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={{ width: "100%", border: fieldBorder(passwordValid), borderRadius: 10, padding: "11px 44px 11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
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
            {(password.length > 0 || touched) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8 }}>
                {rules.map((rule) => (
                  <span key={rule.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: rule.ok ? "#15803D" : touched ? "#DC2626" : "#9CA3AF" }}>
                    {rule.ok ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${touched ? "#DC2626" : "#D1D5DB"}`, display: "inline-block" }} />
                    )}
                    {rule.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSubmit} className="btn-indigo" style={{ width: "100%", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 24, transition: "background 0.15s", boxShadow: "0 4px 12px rgba(79,70,229,.25)" }}>
          Create account
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 20 }}>
          Already have an account?{" "}
          <button onClick={onSignIn} className="text-link" style={{ background: "none", border: "none", cursor: "pointer", color: "#4F46E5", fontWeight: 600, fontSize: 13, transition: "color 0.15s" }}>
            Sign in
          </button>
        </p>
      </div>

      <div style={{ flex: 1, background: "linear-gradient(135deg, #3730A3, #4F46E5 60%, #6C5CE7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 64 }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FCD34D">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <blockquote style={{ fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1.55, marginBottom: 32, letterSpacing: -0.3 }}>
            &ldquo;InSwipe helped us find the right frontend intern in 3 days. The fit scores saved hours of screening.&rdquo;
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
  draft: CompanyInfo;
  patch: (p: Partial<CompanyInfo>) => void;
  onLogo: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step1Screen({ draft, patch, onLogo, onNext, onBack }: Step1Props) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ProgressRail currentStep={1} />

      <div style={{ flex: 1, padding: "72px 80px", overflowY: "auto" }}>
        <div style={{ maxWidth: 580 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F1117", letterSpacing: -0.6, marginBottom: 6 }}>Company profile</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 40 }}>Tell us a bit about your company. This appears on your job posts.</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Company logo</label>
            <LogoUpload value={draft.logo} onChange={onLogo} fallbackInitial={(draft.name[0] || "?").toUpperCase()} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Company name" value={draft.name} onChange={(v) => patch({ name: v })} placeholder="Your company" />
            <FormField label="Tagline" value={draft.tagline} onChange={(v) => patch({ tagline: v })} placeholder="AI tools for developers" />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              className="input-field"
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Describe what your company does, your culture, and what makes you a great place to intern..."
              rows={3}
              style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", resize: "vertical", fontFamily: "Inter, sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <FormSelect label="Industry" value={draft.industry} onChange={(v) => patch({ industry: v })} options={["AI Infrastructure", "Fintech", "EdTech", "E-commerce", "SaaS", "HealthTech", "Gaming"]} />
            <FormSelect label="Company size" value={draft.size} onChange={(v) => patch({ size: v })} options={["1–10 employees", "11–50 employees", "51–200 employees", "200–400 employees", "400–1000 employees", "1000+ employees"]} />
            <FormField label="Founded" value={draft.founded} onChange={(v) => patch({ founded: v })} placeholder="2021, Bangalore" />
            <FormField label="Website" value={draft.website} onChange={(v) => patch({ website: v })} placeholder="technova.ai" />
          </div>

          <div style={{ marginTop: 16 }}>
            <FormField label="HQ location" value={draft.location} onChange={(v) => patch({ location: v })} placeholder="Bangalore, Karnataka" />
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
  email: string;
  company: string;
  onVerified: () => void;
  onBack: () => void;
}

function Step3Screen({ email, company, onVerified, onBack }: Step3Props) {
  type Status = "idle" | "sending" | "sent" | "checking" | "verified" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const domain = domainOf(email) || "your company domain";

  const send = async () => {
    setStatus("sending");
    setMessage(null);
    const res = await startDomainVerification(email, company);
    if (!res.ok) {
      setStatus("error");
      setMessage(res.error ?? "Could not send the verification email.");
      return;
    }
    setSentTo(res.sentTo);
    setDevCode(res.devCode ?? null);
    setStatus("sent");
    setMessage(
      res.devCode
        ? "We couldn't email this address, so the code is shown below."
        : `We sent a 6-digit code to ${res.sentTo}. Check your inbox and spam folder.`,
    );
  };

  const verify = async () => {
    if (code.trim().length < 4) return;
    setStatus("checking");
    setMessage(null);
    const res = await checkDomainVerification(email, code.trim());
    if (res.verified) {
      setStatus("verified");
      setTimeout(onVerified, 900);
      return;
    }
    setStatus("error");
    setMessage(res.error ?? "That code didn't match. Check it and try again.");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ProgressRail currentStep={3} />
      <div style={{ flex: 1, padding: "72px 80px", display: "flex", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F1117", letterSpacing: -0.6, marginBottom: 6 }}>Verify your domain</h2>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 28 }}>
            We&apos;ll email a 6-digit code to your company address to confirm you represent{" "}
            <strong>{company}</strong> (<code style={{ background: "#F1F1F6", padding: "1px 5px", borderRadius: 5, fontSize: 13 }}>{domain}</code>).
          </p>

          {/* Status badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "12px 20px", marginBottom: 28,
            background: status === "verified" ? "#DCFCE7" : status === "error" ? "#FEF2F2" : "#FFFBEB",
            border: `1.5px solid ${status === "verified" ? "#16A34A" : status === "error" ? "#DC2626" : "#FCD34D"}` }}>
            {status === "verified" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
            ) : status === "sending" || status === "checking" ? (
              <span className="spinner" style={{ width: 16, height: 16, border: "2.5px solid #FCD34D", borderTopColor: "#F59E0B", borderRadius: "50%" }} />
            ) : (
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: status === "error" ? "#DC2626" : "#F59E0B" }} />
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: status === "verified" ? "#15803D" : status === "error" ? "#B91C1C" : "#92400E" }}>
              {status === "verified" ? "Domain verified" :
               status === "sending" ? "Sending email…" :
               status === "checking" ? "Checking code…" :
               status === "sent" ? "Code sent — enter it below" :
               status === "error" ? "Something went wrong" :
               "Verification pending"}
            </span>
          </div>

          {status === "idle" || status === "sending" ? (
            <button onClick={send} disabled={status === "sending"} className="btn-indigo"
              style={{ display: "block", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "13px 24px", fontSize: 14, fontWeight: 700, cursor: status === "sending" ? "default" : "pointer", marginBottom: 28 }}>
              {status === "sending" ? "Sending…" : "Send verification email"}
            </button>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Verification code</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  className="input-field"
                  style={{ width: 160, border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 18, letterSpacing: 4, fontWeight: 700, color: "#0F1117", background: "#fff", boxSizing: "border-box" }}
                />
                <button onClick={verify} disabled={code.length < 4 || status === "checking" || status === "verified"} className="btn-indigo"
                  style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: code.length < 4 ? "not-allowed" : "pointer", opacity: code.length < 4 ? 0.5 : 1 }}>
                  {status === "checking" ? "Checking…" : "Verify"}
                </button>
              </div>
              {devCode && (
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
                  Dev code: <strong style={{ color: "#4F46E5", letterSpacing: 2 }}>{devCode}</strong>
                </p>
              )}
              <button onClick={send} className="text-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#4F46E5", fontWeight: 600, marginTop: 10, padding: 0 }}>
                Resend email
              </button>
            </div>
          )}

          {message && (
            <div className="anim-fade-in" style={{ fontSize: 13, color: status === "error" ? "#B91C1C" : "#374151", background: status === "error" ? "#FEF2F2" : "#F7F7FB", border: `1px solid ${status === "error" ? "#FECACA" : "#E8E8EF"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 24, lineHeight: 1.5 }}>
              {message}
            </div>
          )}

          <div style={{ background: "#EEF0FF", borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontSize: 13, color: "#3730A3", lineHeight: 1.6 }}>
                Verified companies appear first in student search and receive <strong>3× more applications</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onBack} style={{ background: "#fff", color: "#374151", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "13px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back
            </button>
            <button onClick={onVerified} className="btn-indigo" style={{ flex: 1, background: status === "verified" ? "#16A34A" : "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}>
              {status === "verified" ? "Continue →" : "Skip for now →"}
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
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", left: 11, top: 28, width: 2, height: 48, background: isDone ? "#4F46E5" : "#E8E8EF", zIndex: 0 }} />
              )}
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: isDone ? "#4F46E5" : isActive ? "#4F46E5" : "#E8E8EF", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginTop: 2 }}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#fff" : "#9CA3AF" }} />
                )}
              </div>
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

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <select
        value={options.includes(value) ? value : options[0]}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        style={{ width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box", cursor: "pointer", appearance: "none" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
