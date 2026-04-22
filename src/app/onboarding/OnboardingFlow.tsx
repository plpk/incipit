"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Turn = { role: "user" | "assistant"; content: string };

type Summary = {
  topic: string;
  time_period: string;
  countries: string[];
  goal_type: string;
  audience: string;
  ai_summary: string;
};

export function OnboardingFlow() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<Turn[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendTurn(nextHistory: Turn[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          research_description: description,
          history: nextHistory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      if (data.mode === "question") {
        setPendingQuestion(data.question);
        setHistory([...nextHistory, { role: "assistant", content: data.question }]);
      } else if (data.mode === "summary") {
        setSummary(data.summary);
        setPendingQuestion(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 20) {
      setError("A sentence or two helps. Please share a bit more.");
      return;
    }
    setStarted(true);
    setHistory([]);
    await sendTurn([]);
  }

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const nextHistory: Turn[] = [...history, { role: "user", content: answer }];
    setAnswer("");
    setPendingQuestion(null);
    await sendTurn(nextHistory);
  }

  if (summary) {
    return (
      <div className="card animate-fade-up" style={{ padding: "32px" }}>
        <h2
          className="font-display font-extrabold text-ink-900"
          style={{ fontSize: 24, letterSpacing: "-0.03em" }}
        >
          Your research profile
        </h2>
        <p className="mt-2 text-[14px] text-ink-500">
          Incipit will use this context to read and organise every document you upload.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="Topic" value={summary.topic} />
          <Field label="Time period" value={summary.time_period} />
          <Field label="Countries" value={summary.countries.join(", ")} />
          <Field label="Goal" value={summary.goal_type} />
          <Field label="Audience" value={summary.audience} />
        </div>
        <div
          className="mt-6 rounded-card-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
            border: "1px solid rgba(13,148,136,0.08)",
            padding: "20px 24px",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center justify-center text-white"
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                fontSize: 12,
              }}
              aria-hidden
            >
              ✦
            </span>
            <span
              className="font-semibold"
              style={{
                fontSize: 12,
                color: "#0d9488",
                letterSpacing: "0.02em",
              }}
            >
              AI summary
            </span>
          </div>
          <p
            className="mt-3"
            style={{ fontSize: 14.5, lineHeight: 1.75, color: "#3f3f46" }}
          >
            {summary.ai_summary}
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            className="btn-primary-gradient"
            onClick={() => router.push("/upload")}
          >
            Start uploading documents
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <form
        onSubmit={handleStart}
        className="card animate-fade-up"
        style={{ padding: "32px" }}
      >
        <label
          className="font-display font-bold text-ink-900"
          htmlFor="description"
          style={{ fontSize: 18, letterSpacing: "-0.02em" }}
        >
          What are you researching?
        </label>
        <p className="mt-2 text-[14px] text-ink-500">
          A sentence or a paragraph, whichever feels natural. Incipit will ask a couple of short follow-up questions.
        </p>
        <textarea
          id="description"
          className="input-field mt-4"
          style={{ minHeight: 160, fontSize: 14.5, lineHeight: 1.6 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="For example: I'm working on a book about the Tacna-Arica dispute in the 1920s, focused on Peruvian newspaper coverage and League of Nations correspondence."
        />
        {error && (
          <p className="mt-3 text-[13px]" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-primary-gradient" disabled={loading}>
            {loading ? "Thinking…" : "Continue"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="card" style={{ padding: "20px 24px" }}>
        <span className="section-label">You wrote</span>
        <p
          className="mt-3 text-ink-900"
          style={{ fontSize: 14.5, lineHeight: 1.7 }}
        >
          {description}
        </p>
      </div>

      {history.map((turn, i) => (
        <div
          key={i}
          className="rounded-card-lg"
          style={
            turn.role === "assistant"
              ? {
                  background:
                    "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
                  border: "1px solid rgba(13,148,136,0.08)",
                  padding: "20px 24px",
                }
              : {
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.04)",
                  padding: "16px 20px",
                }
          }
        >
          {turn.role === "assistant" ? (
            <>
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex items-center justify-center text-white"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                    fontSize: 12,
                  }}
                  aria-hidden
                >
                  ✦
                </span>
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 12,
                    color: "#0d9488",
                    letterSpacing: "0.02em",
                  }}
                >
                  Incipit
                </span>
              </div>
              <p
                className="mt-3"
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "#3f3f46",
                }}
              >
                {turn.content}
              </p>
            </>
          ) : (
            <>
              <span className="field-label">You</span>
              <p
                className="mt-2 text-ink-700"
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                {turn.content}
              </p>
            </>
          )}
        </div>
      ))}

      {pendingQuestion && (
        <form onSubmit={handleAnswer} className="card" style={{ padding: "20px 24px" }}>
          <textarea
            className="input-field"
            style={{ minHeight: 100, fontSize: 14.5, lineHeight: 1.6 }}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer…"
            autoFocus
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary-gradient" disabled={loading || !answer.trim()}>
              {loading ? "Thinking…" : "Send"}
            </button>
          </div>
        </form>
      )}

      {loading && !pendingQuestion && (
        <p className="text-[13px] text-ink-500">Incipit is writing your profile…</p>
      )}

      {error && (
        <p className="text-[13px]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p
        className="mt-1.5"
        style={{ fontSize: 14, color: value ? "#1a1a2e" : "#d4d4d8" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
