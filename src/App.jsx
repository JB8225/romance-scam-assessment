import { useState, useEffect, useRef } from "react";

const NAVY = "#1B2A4A";
const NAVY_LIGHT = "#243656";
const NAVY_DEEP = "#0F1B30";
const GOLD = "#D4A843";
const GOLD_LIGHT = "#E8BC5A";
const RED = "#C0392B";
const GREEN = "#27AE60";
const DARK_GRAY = "#333333";
const MED_GRAY = "#666666";
const LIGHT_GRAY = "#F5F5F5";
const WARNING_BG = "#FFF8EC";

const WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/OI1J52iL4W67IzzVEN0Y/webhook-trigger/d1e0411d-247d-49bd-9457-874717016f26";

const questions = [
  {
    id: "trigger",
    question: "What made you want to look into this today?",
    subtext: "There's no wrong answer. Just tell us what's on your mind.",
    options: [
      { value: "online_person", label: "My parent mentioned someone they met online that they talk to regularly", weight: 2 },
      { value: "behavior_change", label: "Their behavior has changed and I'm not sure why", weight: 1 },
      { value: "secrecy", label: "They've become secretive about their phone, finances, or a relationship", weight: 2 },
      { value: "money_mentioned", label: "Money has come up — either sent or requested", weight: 3 },
      { value: "gut_feeling", label: "Honestly, just a gut feeling that something is off", weight: 1 },
      { value: "someone_told_me", label: "Someone else in the family flagged it to me", weight: 1 },
    ],
  },
  {
    id: "online_relationship",
    question: "As far as you know, is your parent in contact with someone they met online?",
    subtext: "This could be through social media, a dating app, email, or even a game.",
    options: [
      { value: "yes_know_about", label: "Yes — and I know about this person", weight: 2 },
      { value: "yes_suspect", label: "I think so, but they haven't told me directly", weight: 2 },
      { value: "not_sure", label: "I'm not sure — that's part of what concerns me", weight: 1 },
      { value: "no", label: "No — my concern is something else entirely", weight: 0 },
    ],
  },
  {
    id: "met_in_person",
    question: "Have they ever met this person face to face?",
    subtext: "Video calls don't count — those can be faked with AI technology.",
    options: [
      { value: "yes", label: "Yes, they've met in person", weight: 0 },
      { value: "planned", label: "Not yet — but they keep talking about plans to meet", weight: 2 },
      { value: "no_excuses", label: "No — and there always seems to be a reason why not", weight: 3 },
      { value: "no_early", label: "No — but it seems early in the relationship", weight: 1 },
      { value: "not_applicable", label: "This doesn't apply to my situation", weight: 0 },
      { value: "unsure", label: "I honestly don't know", weight: 1 },
    ],
  },
  {
    id: "money",
    question: "Has money come up at all in this situation?",
    subtext: "Even a small request or a mention of financial trouble is worth noting.",
    options: [
      { value: "sent_multiple", label: "Yes — they've sent money more than once", weight: 4 },
      { value: "sent_once", label: "Yes — they sent money at least once", weight: 3 },
      { value: "requested_not_sent", label: "Money was asked for but they haven't sent anything yet", weight: 2 },
      { value: "hinted", label: "There have been hints about financial struggles or emergencies", weight: 2 },
      { value: "not_yet", label: "Not that I know of", weight: 0 },
      { value: "unsure", label: "I'm not sure — I don't have full visibility", weight: 1 },
    ],
  },
  {
    id: "behavior",
    question: "Have you noticed any changes in your parent lately?",
    subtext: "Pick the one that feels most true, even if it's subtle.",
    options: [
      { value: "pulling_away", label: "They seem to be pulling away from family or old friends", weight: 3 },
      { value: "secretive", label: "They're more guarded — especially around their phone or finances", weight: 3 },
      { value: "emotional_swings", label: "Their mood seems tied to someone else — happy when talking to them, down when they're not", weight: 2 },
      { value: "defensive", label: "They get defensive or change the subject when I ask questions", weight: 2 },
      { value: "nothing_major", label: "Nothing major — just small things that feel slightly off", weight: 1 },
      { value: "no_change", label: "No noticeable changes", weight: 0 },
      { value: "unsure", label: "Hard to say", weight: 1 },
    ],
  },
  {
    id: "gut",
    question: "When you step back and trust your gut — how worried are you?",
    subtext: "You know this person better than anyone. What does your instinct say?",
    options: [
      { value: "very_worried", label: "Very worried — something is definitely wrong", weight: 3 },
      { value: "worried", label: "Worried — too many things don't add up", weight: 2 },
      { value: "uneasy", label: "Uneasy — I hope I'm wrong but I can't shake it", weight: 2 },
      { value: "cautious", label: "Cautious — probably fine but I want to be sure", weight: 1 },
      { value: "unsure", label: "Honestly not sure how I feel", weight: 1 },
    ],
  },
];

const progressTeases = [
  null,
  "Good. Let's dig a little deeper...",
  "You're helping us understand the full picture...",
  "This is one of the most important questions...",
  "Almost there — a few more details...",
  "Last question — then we'll have what we need...",
];

function calculateRisk(answers) {
  let score = 0;
  questions.forEach((q) => {
    const answer = answers[q.id];
    const option = q.options.find((o) => o.value === answer);
    if (option) score += option.weight;
  });
  if (score <= 3) return { level: "Low Concern", color: "#2196F3", bar: 15, score };
  if (score <= 7) return { level: "Worth Watching", color: "#4CAF50", bar: 35, score };
  if (score <= 11) return { level: "Concerning", color: "#FF9800", bar: 62, score };
  if (score <= 15) return { level: "High Concern", color: "#FF5722", bar: 82, score };
  return { level: "Urgent", color: RED, bar: 97, score };
}

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ width: "100%", marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: MED_GRAY }}>Question {current + 1} of {total}</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: MED_GRAY }}>{Math.round(pct)}% complete</span>
      </div>
      <div style={{ width: "100%", height: 4, background: "#E8E8E8", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, #2E5090, ${GOLD})`, borderRadius: 2, transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function QuestionCard({ question, onSelect, selectedValue }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      <h2 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 23, fontWeight: 700, color: NAVY, margin: "0 0 7px 0", lineHeight: 1.35 }}>
        {question.question}
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: "0 0 20px 0", lineHeight: 1.5, fontStyle: "italic" }}>
        {question.subtext}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {question.options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "13px 16px",
                border: `2px solid ${isSelected ? GOLD : "#E4E4E4"}`,
                borderLeftWidth: isSelected ? "4px" : "2px",
                borderLeftColor: isSelected ? GOLD : "#E4E4E4",
                borderRadius: 9, cursor: "pointer",
                background: isSelected ? `${GOLD}10` : "white",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: DARK_GRAY,
                transition: "all 0.2s ease", outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.borderLeftWidth = "4px";
                  e.currentTarget.style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#E4E4E4";
                  e.currentTarget.style.borderLeftWidth = "2px";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiskMeter({ risk }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: MED_GRAY, fontWeight: 700, letterSpacing: "0.6px" }}>CONCERN LEVEL</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: risk.color, padding: "3px 12px", borderRadius: 20, background: `${risk.color}15`, border: `1px solid ${risk.color}30` }}>
          {risk.level}
        </span>
      </div>
      <div style={{ width: "100%", height: 10, background: "#F0F0F0", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: `${risk.bar}%`, height: "100%", background: `linear-gradient(90deg, #2196F3, ${risk.color})`, borderRadius: 5, transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function ReportDisplay({ reportText }) {
  const paragraphs = reportText.split('\n').filter(p => p.trim());
  
  return (
    <div style={{ animation: "fadeSlideIn 0.5s ease-out" }}>
      {/* Branded header */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 16, textAlign: "center",
      }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, margin: "0 0 4px 0", fontWeight: 700, letterSpacing: "1px" }}>
          THE SCAM HOTLINE — CONFIDENTIAL ASSESSMENT
        </p>
        <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 18, color: "white", margin: "0 0 4px 0", fontWeight: 700 }}>
          Your Personalized Concern Report
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8899BB", margin: 0 }}>
          Generated based on your specific answers • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Report content */}
      <div style={{ padding: "4px 4px" }}>
        {paragraphs.map((para, i) => {
          const isHeader = para.startsWith('**') || para.match(/^[A-Z][A-Z\s]+$/);
          const cleanPara = para.replace(/\*\*/g, '');
          
          if (isHeader) {
            return (
              <p key={i} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                color: NAVY, margin: "18px 0 6px 0", letterSpacing: "0.5px",
                textTransform: "uppercase",
                borderLeft: `3px solid ${GOLD}`, paddingLeft: 10,
              }}>{cleanPara}</p>
            );
          }
          return (
            <p key={i} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: DARK_GRAY,
              margin: "0 0 12px 0", lineHeight: 1.75,
            }}>{cleanPara}</p>
          );
        })}
      </div>

      {/* Branded footer */}
      <div style={{
        marginTop: 20, padding: "16px 20px",
        background: WARNING_BG, borderRadius: 12, borderLeft: `4px solid ${GOLD}`,
      }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: DARK_GRAY, margin: "0 0 4px 0", fontWeight: 600 }}>
          JB Bouck — Founder, The Scam Hotline
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: MED_GRAY, margin: 0 }}>
          TheScamHotline.org &nbsp;•&nbsp; 321-No-Scams &nbsp;•&nbsp; Talk to Sally, our AI agent, 24/7
        </p>
      </div>
    </div>
  );
}

function ResultsPage({ answers, onEmailSubmit }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(false);
  const risk = calculateRisk(answers);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setLoading(true);

    // Fire GHL webhook immediately
    if (onEmailSubmit) onEmailSubmit(email, answers, risk);

    // Generate Claude report
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, riskLevel: risk.level }),
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      } else {
        setReportError(true);
      }
    } catch (err) {
      setReportError(true);
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeSlideIn 0.4s ease-out" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: `3px solid ${LIGHT_GRAY}`, borderTopColor: GOLD,
          margin: "0 auto 20px",
          animation: "spin 0.8s linear infinite",
        }} />
        <h3 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 20, color: NAVY, margin: "0 0 8px 0" }}>
          Generating Your Report...
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: 0 }}>
          We're analyzing your answers and preparing your personalized concern report.
        </p>
      </div>
    );
  }

  if (submitted && report) {
    return (
      <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-block", padding: "4px 14px",
            background: `${GREEN}15`, border: `1px solid ${GREEN}30`,
            borderRadius: 20, color: GREEN, fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px", marginBottom: 10,
          }}>✓ REPORT GENERATED</div>
          <h2 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 22, color: NAVY, margin: "0 0 4px 0" }}>
            Your Personalized Report Is Ready
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: "0 0 4px 0" }}>
            A copy is also on its way to <strong>{email}</strong> along with your free guides.
          </p>
        </div>

        {/* Risk meter */}
        <div style={{ padding: "16px 18px", background: LIGHT_GRAY, borderRadius: 12, marginBottom: 16 }}>
          <RiskMeter risk={risk} />
        </div>

        {/* The report */}
        <ReportDisplay reportText={report} />

        {/* What's coming in their inbox */}
        <div style={{
          marginTop: 20, padding: "18px 20px",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
          borderRadius: 12,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, margin: "0 0 8px 0", fontWeight: 700, letterSpacing: "0.5px" }}>
            ALSO HEADING TO YOUR INBOX:
          </p>
          {[
            "5 Questions to Ask Your Parent This Weekend",
            "The Family Conversation Starter Guide",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 1 ? 6 : 0, alignItems: "flex-start" }}>
              <span style={{ color: GOLD, fontSize: 13, flexShrink: 0 }}>✓</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E0", margin: 0, lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Don't do list */}
        <div style={{ marginTop: 14, padding: "16px 18px", background: WARNING_BG, borderRadius: 12, borderLeft: `4px solid ${GOLD}` }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: DARK_GRAY, margin: "0 0 8px 0" }}>
            ⚡ Before you do anything else:
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: 0, lineHeight: 1.8 }}>
            1. Read the guides before you say anything to your parent<br />
            2. Don't use the word "scam" in your first conversation<br />
            3. Lead with love — not evidence
          </p>
        </div>
      </div>
    );
  }

  // Pre-submission results page
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          display: "inline-block", padding: "4px 14px",
          background: `${GREEN}15`, border: `1px solid ${GREEN}30`,
          borderRadius: 20, color: GREEN, fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px", marginBottom: 10,
        }}>ASSESSMENT COMPLETE</div>
        <h2 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 23, color: NAVY, margin: "0 0 4px 0" }}>
          Here's What Your Answers Suggest
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: 0 }}>
          This isn't a diagnosis — it's a starting point for the right conversation.
        </p>
      </div>

      {/* Risk meter */}
      <div style={{ padding: "18px 20px", background: LIGHT_GRAY, borderRadius: 12, marginBottom: 14 }}>
        <RiskMeter risk={risk} />
      </div>

      {/* Tease */}
      <div style={{
        padding: "18px 20px",
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        borderRadius: 12, marginBottom: 14, textAlign: "center",
      }}>
        <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 17, color: "white", margin: "0 0 8px 0", fontWeight: 700 }}>
          Your personalized report is ready.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#B0BEC5", margin: 0, lineHeight: 1.6 }}>
          Enter your email and we'll generate a full written report based on your specific answers — plus send you the two free conversation guides.
        </p>
      </div>

      {/* What's included */}
      <div style={{ padding: "16px 18px", background: LIGHT_GRAY, borderRadius: 12, marginBottom: 18 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: NAVY, margin: "0 0 10px 0", letterSpacing: "0.3px" }}>
          YOU'LL RECEIVE:
        </p>
        {[
          "A personalized written concern report — specific to your answers, not a generic template",
          "5 Questions to Ask Your Parent This Weekend — natural conversations that don't feel like an interrogation",
          "The Family Conversation Starter — what to say, what NOT to say, and how to handle defensiveness",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 2 ? 7 : 0, alignItems: "flex-start" }}>
            <span style={{ color: GREEN, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: DARK_GRAY, margin: 0, lineHeight: 1.5 }}>{item}</p>
          </div>
        ))}
      </div>

      {/* Email capture */}
      <div style={{
        padding: "24px 22px", borderRadius: 14, textAlign: "center",
        background: `linear-gradient(135deg, ${NAVY} 0%, #162240 100%)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>
        <h3 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 19, color: "white", margin: "0 0 5px 0" }}>
          Get Your Free Report + Guides
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#AAAAAA", margin: "0 0 16px 0" }}>
          Free. Instant. Personalized to what you just told us.
        </p>
        <div style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              flex: 1, padding: "13px 15px", borderRadius: 8,
              border: `1px solid ${emailError ? RED : "rgba(255,255,255,0.15)"}`,
              background: "rgba(255,255,255,0.08)", color: "white", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = `${GOLD}60`; }}
            onBlur={(e) => { e.target.style.borderColor = emailError ? RED : "rgba(255,255,255,0.15)"; }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "13px 20px", borderRadius: 8, border: "none",
              background: GOLD, color: NAVY, fontSize: 14, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              whiteSpace: "nowrap", animation: "ctaPulse 2s ease-in-out infinite",
            }}
            onMouseEnter={(e) => { e.target.style.background = GOLD_LIGHT; e.target.style.animation = "none"; }}
            onMouseLeave={(e) => { e.target.style.background = GOLD; e.target.style.animation = "ctaPulse 2s ease-in-out infinite"; }}
          >
            Generate My Report →
          </button>
        </div>
        {emailError && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#FF6B6B", margin: "8px 0 0 0" }}>{emailError}</p>
        )}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)", margin: "10px 0 0 0" }}>
          No spam. Unsubscribe anytime. We never share your information.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef(null);

  const handleSelect = (value) => {
    const qId = questions[currentQ].id;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setTimeout(() => {
      if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
      else setIsComplete(true);
    }, 300);
  };

  const handleEmailSubmit = async (email, allAnswers, risk) => {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          email,
          risk_level: risk.level,
          risk_score: risk.score,
          trigger: allAnswers.trigger || "",
          online_relationship: allAnswers.online_relationship || "",
          met_in_person: allAnswers.met_in_person || "",
          money: allAnswers.money || "",
          behavior: allAnswers.behavior || "",
          gut: allAnswers.gut || "",
          source: "romance-scam-concern-assessment",
        }),
      });
    } catch (err) {
      console.error("Webhook error:", err);
    }
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQ, isComplete]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at center, ${NAVY_LIGHT} 0%, ${NAVY_DEEP} 70%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Caslon+Text:wght@400;700&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shieldGlow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(212,168,67,0.3)); } 50% { filter: drop-shadow(0 0 18px rgba(212,168,67,0.5)); } }
        @keyframes ctaPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.4); } 50% { box-shadow: 0 0 0 8px rgba(212,168,67,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.32); }
        * { box-sizing: border-box; }
      `}</style>

      <div ref={containerRef} style={{
        width: "100%", maxWidth: 560, background: "white", borderRadius: 20,
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        overflow: "hidden", maxHeight: "95vh", overflowY: "auto",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, #2E5090, ${GOLD}, #2E5090)` }} />

        {currentQ === 0 && !isComplete && (
          <div style={{
            background: `radial-gradient(ellipse at 50% 30%, ${NAVY_LIGHT} 0%, ${NAVY} 60%, ${NAVY_DEEP} 100%)`,
            padding: "30px 28px 0", textAlign: "center",
          }}>
            <div style={{ width: 88, height: 88, margin: "0 auto 16px", animation: "shieldGlow 3.5s ease-in-out infinite" }}>
              <img src="/logo.png" alt="The Scam Hotline" style={{ width: 88, height: 88, objectFit: "contain" }} />
            </div>
            <h1 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 25, fontWeight: 700, color: "white", margin: "0 0 10px 0", lineHeight: 1.3 }}>
              Something feels off.<br />Let's figure out if you're right.
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#B0B8C8", margin: "0 auto 18px", lineHeight: 1.65, maxWidth: 400 }}>
              Answer 6 questions about what you've noticed. We'll generate a{" "}
              <strong style={{ color: GOLD }}>personalized written report</strong>{" "}
              and send you the conversation guides you need — free.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {["Takes 2 minutes", "Free & confidential", "Personalized report"].map((t) => (
                <span key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, fontWeight: 500, padding: "5px 11px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>✓ {t}</span>
              ))}
            </div>
            <svg viewBox="0 0 560 26" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 26, marginBottom: -1 }}>
              <path d="M0,13 C140,26 420,0 560,13 L560,26 L0,26 Z" fill="white" />
            </svg>
          </div>
        )}

        {currentQ > 0 && !isComplete && (
          <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, padding: "11px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: GOLD, margin: 0, fontWeight: 500 }}>
              {progressTeases[currentQ] || "Building your personalized report..."}
            </p>
          </div>
        )}

        <div style={{ padding: "24px 26px 28px" }}>
          {!isComplete && (
            <>
              <ProgressBar current={currentQ} total={questions.length} />
              <QuestionCard key={currentQ} question={questions[currentQ]} selectedValue={answers[questions[currentQ].id]} onSelect={handleSelect} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                {currentQ > 0 ? (
                  <button onClick={() => setCurrentQ(currentQ - 1)} style={{ padding: "7px 12px", border: "none", background: "transparent", color: MED_GRAY, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.target.style.color = DARK_GRAY; }}
                    onMouseLeave={(e) => { e.target.style.color = MED_GRAY; }}
                  >← Back</button>
                ) : <div />}
                <button onClick={() => { if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1); else setIsComplete(true); }}
                  style={{ padding: "7px 12px", border: "none", background: "transparent", color: "#CCC", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.target.style.color = MED_GRAY; }}
                  onMouseLeave={(e) => { e.target.style.color = "#CCC"; }}
                >Skip for now →</button>
              </div>
            </>
          )}
          {isComplete && <ResultsPage answers={answers} onEmailSubmit={handleEmailSubmit} />}
        </div>

        <div style={{ background: LIGHT_GRAY, padding: "10px 24px", textAlign: "center", borderTop: "1px solid #EBEBEB" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#AAA", margin: 0, letterSpacing: "0.3px" }}>
            TheScamHotline.org &nbsp;•&nbsp; 321-No-Scams &nbsp;•&nbsp; Learn · Protect · Recover — Together
          </p>
        </div>
      </div>
    </div>
  );
}
