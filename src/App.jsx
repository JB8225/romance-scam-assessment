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

const SAMCART_URL = "https://thescamhotline.mysamcart.com/The-Talk";

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

// ── THE HARDEST TALK BOOK UPSELL ──
function UpsellSection() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const chapters = [
    { name: "The Psychology of Grooming", desc: "Understand why your parent fell for it — and why shame makes everything worse." },
    { name: "How to Start the Conversation", desc: "The exact approach that opens the door without triggering defensiveness." },
    { name: "Scripts for When They Push Back", desc: "Word-for-word responses for \"You don't understand,\" \"It's my money,\" and \"We're in love.\"" },
    { name: "If They've Already Sent Money", desc: "The first 24-hour action plan: who to call, what to freeze, how to document everything." },
    { name: "When They Want to Keep Sending", desc: "How to intervene without destroying the relationship — even when denial is strong." },
    { name: "The Grief Process", desc: "They're not just losing money — they're losing a relationship they believed was real. How to help them heal." },
  ];

  return (
    <div style={{
      marginTop: 24,
      padding: "28px 24px",
      background: `linear-gradient(135deg, #FFFFFF 0%, ${LIGHT_GRAY} 100%)`,
      borderRadius: 14,
      border: `2px solid ${GOLD}40`,
      animation: "fadeSlideIn 0.6s ease-out",
    }}>
      {/* Bridge */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: DARK_GRAY, margin: "0 0 6px 0", lineHeight: 1.7, textAlign: "center" }}>
        <strong>Your free guides are on the way.</strong>
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: MED_GRAY, margin: "0 0 20px 0", lineHeight: 1.7, textAlign: "center" }}>
        But before you go — can I be honest with you for a second?
      </p>

      {/* Problem agitation */}
      <div style={{ padding: "16px 20px", background: WARNING_BG, borderRadius: 10, borderLeft: `4px solid ${GOLD}`, marginBottom: 20 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: DARK_GRAY, margin: 0, lineHeight: 1.8 }}>
          The free guides will help you <strong>start</strong> the conversation. But starting the conversation is only step one.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: DARK_GRAY, margin: "12px 0 0 0", lineHeight: 1.8 }}>
          What happens when your parent says <em>"You don't understand our relationship"</em>? What if they've <em>already sent money</em>? What if the scammer is <em>still in their ear</em> and they won't listen?
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: "10px 0 0 0", lineHeight: 1.6 }}>
          The free guides don't cover that. This book does.
        </p>
      </div>

      {/* Product intro */}
      <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 22, color: NAVY, margin: "0 0 4px 0", textAlign: "center", fontWeight: 700, lineHeight: 1.3 }}>
        The Hardest Talk You'll Ever Have
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: MED_GRAY, margin: "0 0 6px 0", textAlign: "center", fontStyle: "italic" }}>
        Saving Your Parent from an Online Romance Scam
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: "0 0 20px 0", textAlign: "center" }}>
        The complete 10-chapter guide with scripts, action plans, and everything you need — from the first conversation to full recovery.
      </p>

      {/* Chapter stack */}
      {chapters.map((ch, i) => (
        <div key={i} style={{
          display: "flex", gap: 12, marginBottom: 10,
          padding: "12px 14px", background: "white", borderRadius: 10,
          border: "1px solid #E8E8E8",
        }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: `${NAVY}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: NAVY, fontSize: 13, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: DARK_GRAY, margin: "0 0 2px 0", lineHeight: 1.4 }}>
              {ch.name}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: MED_GRAY, margin: 0, lineHeight: 1.5 }}>
              {ch.desc}
            </p>
          </div>
        </div>
      ))}

      {/* Bonus: Sally */}
      <div style={{
        display: "flex", gap: 12, marginTop: 4, marginBottom: 20,
        padding: "12px 14px", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, borderRadius: 10,
      }}>
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: `${GOLD}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16 }}>🛡</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 2px 0", lineHeight: 1.4 }}>
            BONUS: 24/7 Access to Sally — AI Scam Defense Agent
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9EB3CC", margin: 0, lineHeight: 1.5 }}>
            Got a question at 2am? Call 321-No-Scams. Sally walks you through your next move in real time.
          </p>
        </div>
      </div>

      {/* Social proof line */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: DARK_GRAY, margin: "0 0 16px 0", textAlign: "center", lineHeight: 1.6 }}>
        Written by JB Bouck, founder of The Scam Hotline — built from real conversations with families going through this right now.
      </p>

      {/* Price anchor */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 34, color: NAVY, margin: "0 0 2px 0", fontWeight: 700 }}>
          $9
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: RED, margin: 0, fontWeight: 600 }}>
          Only available at this price on this page
        </p>
      </div>

      {/* CTA button */}
      <a
        href={SAMCART_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", width: "100%", padding: "16px 0",
          background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
          color: NAVY, fontFamily: "'DM Sans', sans-serif", fontSize: 16,
          fontWeight: 700, textAlign: "center", borderRadius: 10,
          textDecoration: "none", marginBottom: 10,
          boxShadow: `0 4px 16px ${GOLD}40`,
          cursor: "pointer",
        }}
      >
        Get The Hardest Talk — $9 →
      </a>

      {/* Guarantee */}
      <div style={{ textAlign: "center", padding: "12px 16px", background: `${GREEN}08`, borderRadius: 8, marginBottom: 10, border: `1px solid ${GREEN}20` }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: DARK_GRAY, margin: 0, lineHeight: 1.6 }}>
          <strong>100% Money-Back Promise:</strong> If this book doesn't give you a clear plan to protect your parent, we'll refund every penny. No questions.
        </p>
      </div>

      {/* Decline */}
      <p
        onClick={() => setDismissed(true)}
        style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: MED_GRAY,
          textAlign: "center", margin: "8px 0 0 0", cursor: "pointer",
          textDecoration: "underline", opacity: 0.7,
        }}
      >
        No thanks, the free guides are enough for now.
      </p>
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

  // Thank you screen — shown when submitted but report failed or still loading
  if (submitted && !report) {
    return (
      <div style={{ animation: "fadeSlideIn 0.5s ease-out", textAlign: "center", padding: "20px 0" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `linear-gradient(135deg, ${GREEN}, #2ECC71)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px",
          boxShadow: `0 8px 32px ${GREEN}40`,
          fontSize: 34, color: "white",
        }}>✓</div>
        <h2 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 26, color: NAVY, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          You did the right thing.
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: DARK_GRAY, maxWidth: 400, margin: "0 auto 10px", lineHeight: 1.7 }}>
          The fact that you're here — taking time to look into this, asking the right questions — says everything about how much you love your parent.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: DARK_GRAY, maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.7 }}>
          Your guides and personalized report are on their way to <strong>{email}</strong>. Check your inbox in the next few minutes.
        </p>
        <div style={{ padding: "20px 22px", background: WARNING_BG, borderRadius: 12, borderLeft: `4px solid ${GOLD}`, textAlign: "left", maxWidth: 420, margin: "0 auto 20px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: DARK_GRAY, margin: "0 0 10px 0" }}>
            ⚡ While you wait — 3 things to remember:
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: MED_GRAY, margin: 0, lineHeight: 1.9 }}>
            1. Read the guides <em>before</em> you say anything to your parent<br />
            2. Don't use the word "scam" in your first conversation<br />
            3. Lead with love — not evidence
          </p>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MED_GRAY, margin: "0 auto", maxWidth: 380, lineHeight: 1.6 }}>
          Questions? Call or text us anytime at{" "}
          <a href="tel:321-667-2267" style={{ color: NAVY, fontWeight: 700, textDecoration: "none" }}>321-No-Scams</a>
          {" "}or visit{" "}
          <a href="https://www.thescamhotline.org" target="_blank" rel="noopener noreferrer" style={{ color: NAVY, fontWeight: 700, textDecoration: "underline" }}>TheScamHotline.org</a>
        </p>

        {/* $9 First Aid Kit Upsell */}
        <UpsellSection />
      </div>
    );
  }

  if (submitted && report) {
    return (
      <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>

        {/* Thank you header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: `linear-gradient(135deg, ${GREEN}, #2ECC71)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 26, color: "white",
            boxShadow: `0 6px 20px ${GREEN}40`,
          }}>✓</div>
          <h2 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 24, color: NAVY, margin: "0 0 8px 0", lineHeight: 1.3 }}>
            You did the right thing.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: DARK_GRAY, maxWidth: 400, margin: "0 auto 6px", lineHeight: 1.7 }}>
            The fact that you're here says everything about how much you love your parent. Your guides and report are on their way to <strong>{email}</strong>.
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
            "Warning Signs of a Romance Scam Checklist",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 2 ? 6 : 0, alignItems: "flex-start" }}>
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

        {/* $9 First Aid Kit Upsell */}
        <UpsellSection />
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

      {/* Guides — the main event */}
      <div style={{
        padding: "22px 22px",
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        borderRadius: 12, marginBottom: 14,
      }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: GOLD, margin: "0 0 14px 0", fontWeight: 700, letterSpacing: "0.5px", lineHeight: 1.4 }}>
          NO ONE SHOULD FACE THIS ALONE —<br />SO WE'RE GIVING THIS AWAY
        </p>

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", marginBottom: 10, borderLeft: `4px solid ${GOLD}` }}>
          <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 5px 0", lineHeight: 1.3 }}>
            ✓ 5 Questions to Ask Your Parent This Weekend
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9EB3CC", margin: 0, lineHeight: 1.5 }}>
            Natural conversations that open doors without starting arguments or triggering defensiveness.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", marginBottom: 10, borderLeft: `4px solid ${GOLD}` }}>
          <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 5px 0", lineHeight: 1.3 }}>
            ✓ The Family Conversation Starter
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9EB3CC", margin: 0, lineHeight: 1.5 }}>
            Word-for-word scripts. What to say. What NOT to say. How to handle pushback without losing the relationship.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px", marginBottom: 10, borderLeft: `4px solid ${GOLD}` }}>
          <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 5px 0", lineHeight: 1.3 }}>
            ✓ Warning Signs of a Romance Scam Checklist
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9EB3CC", margin: 0, lineHeight: 1.5 }}>
            Use this quietly. Check every box that applies. 3 or more means it's time to act.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 16px", borderLeft: "4px solid rgba(255,255,255,0.12)" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "0 0 3px 0" }}>
            ✓ Your personalized concern report
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Generated from your specific answers — not a generic template.
          </p>
        </div>
      </div>

      {/* Email capture */}
      <div style={{
        padding: "26px 22px", borderRadius: 14, textAlign: "center",
        background: `linear-gradient(135deg, #0F1B30 0%, #162240 100%)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        border: `1px solid rgba(212,168,67,0.2)`,
      }}>
        <h3 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 22, color: "white", margin: "0 0 6px 0", lineHeight: 1.3 }}>
          Send me the guides
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9EB3CC", margin: "0 0 18px 0" }}>
          Free. Instant. Delivered to your inbox.
        </p>
        <div style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              flex: 1, padding: "15px 15px", borderRadius: 8,
              border: `1px solid ${emailError ? RED : "rgba(255,255,255,0.15)"}`,
              background: "rgba(255,255,255,0.08)", color: "white", fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = `${GOLD}60`; }}
            onBlur={(e) => { e.target.style.borderColor = emailError ? RED : "rgba(255,255,255,0.15)"; }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "15px 22px", borderRadius: 8, border: "none",
              background: GOLD, color: NAVY, fontSize: 15, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              whiteSpace: "nowrap", animation: "ctaPulse 2s ease-in-out infinite",
            }}
            onMouseEnter={(e) => { e.target.style.background = GOLD_LIGHT; e.target.style.animation = "none"; }}
            onMouseLeave={(e) => { e.target.style.background = GOLD; e.target.style.animation = "ctaPulse 2s ease-in-out infinite"; }}
          >
            Send Me the Guides →
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
            {/* Logo */}
            <div style={{ width: 88, height: 88, margin: "0 auto 18px", animation: "shieldGlow 3.5s ease-in-out infinite" }}>
              <img
                src="/logo.png"
                alt="The Scam Hotline"
                style={{ width: 88, height: 88, objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerHTML = '<div style="width:88px;height:88px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid rgba(212,168,67,0.5);border-radius:50%;background:rgba(212,168,67,0.08)"><span style=\'font-family:Georgia,serif;font-size:13px;font-weight:700;color:#D4A843;letter-spacing:1px;text-align:center;line-height:1.3\'>THE SCAM<br/>HOTLINE</span></div>';
                }}
              />
            </div>

            {/* Label */}
            <div style={{ display: "inline-block", padding: "4px 14px", marginBottom: 14, background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: 20 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: "0.8px" }}>
                FOR FAMILIES WHO SUSPECT SOMETHING IS WRONG
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 26, fontWeight: 700, color: "white", margin: "0 0 14px 0", lineHeight: 1.3 }}>
              Is someone you love caught<br />in a romance scam?
            </h1>

            {/* Body copy */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#B0B8C8", margin: "0 auto 18px", lineHeight: 1.75, maxWidth: 420, textAlign: "left" }}>
              Every year, millions of families watch helplessly as a parent falls for someone they met online — someone who may not even exist. By the time they realize what's happening, the emotional bond is already deep. And the money is already gone.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, textAlign: "left" }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${GOLD}` }}>
                <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 22, color: GOLD, margin: "0 0 3px 0", fontWeight: 700 }}>$1.3B</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8899BB", margin: 0, lineHeight: 1.4 }}>stolen through romance scams last year alone</p>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${GOLD}` }}>
                <p style={{ fontFamily: "'Libre Caslon Text', 'Georgia', serif", fontSize: 22, color: GOLD, margin: "0 0 3px 0", fontWeight: 700 }}>$50,000</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8899BB", margin: 0, lineHeight: 1.4 }}>average loss per victim — most are over 60</p>
              </div>
            </div>

            {/* Differentiator */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, textAlign: "left", borderLeft: `3px solid ${GOLD}` }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "white", margin: 0, lineHeight: 1.7 }}>
                <strong style={{ color: GOLD }}>But here's what most families don't know:</strong> the way you talk to your parent matters more than anything else. The wrong words close the door forever. The right words open it.
              </p>
            </div>

            {/* CTA copy */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#B0B8C8", margin: "0 auto 16px", lineHeight: 1.7, maxWidth: 420 }}>
              Answer 6 quick questions and we'll assess your situation — then send you the{" "}
              <strong style={{ color: "white" }}>exact words to use</strong>, the{" "}
              <strong style={{ color: "white" }}>questions to ask</strong>, and a{" "}
              <strong style={{ color: "white" }}>conversation guide</strong>{" "}
              written for families like yours. <strong style={{ color: GOLD }}>Free.</strong>
            </p>

            {/* Urgency line */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "white", margin: "0 auto 18px", fontWeight: 600, lineHeight: 1.5 }}>
              Answer 6 questions. Get your guides instantly.<br />
              <span style={{ color: GOLD }}>You could have this conversation tonight.</span>
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {["Takes 2 minutes", "Free & confidential", "Personalized report"].map((t) => (
                <span key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, fontWeight: 500, padding: "5px 11px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>✓ {t}</span>
              ))}
            </div>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px 0", fontStyle: "italic" }}>
              You're in the right place.
            </p>

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
            <a href="https://www.thescamhotline.org" target="_blank" rel="noopener noreferrer" style={{ color: "#AAA", textDecoration: "underline" }}>TheScamHotline.org</a> &nbsp;•&nbsp; 321-No-Scams &nbsp;•&nbsp; Learn · Protect · Recover — Together
          </p>
        </div>
      </div>
    </div>
  );
}
