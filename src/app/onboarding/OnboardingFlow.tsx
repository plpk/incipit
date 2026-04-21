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
      <div className="card p-8">
        <h2 className="font-serif text-2xl font-semibold">Your research profile</h2>
        <p className="mt-2 text-sm text-ink-500">
          Incipit will use this context to read and organise every document you
          upload.
        </p>
        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Field label="Topic" value={summary.topic} />
          <Field label="Time period" value={summary.time_period} />
          <Field label="Countries" value={summary.countries.join(", ")} />
          <Field label="Goal" value={summary.goal_type} />
          <Field label="Audience" value={summary.audience} />
        </dl>
        <div className="mt-6 rounded-md bg-parchment-100 p-4 text-sm text-ink-700">
          {summary.ai_summary}
        </div>
        <div className="mt-8 flex gap-3">
          <button
            className="btn-primary"
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
      <form onSubmit={handleStart} className="card p-8">
        <label className="label" htmlFor="description">
          What are you researching?
        </label>
        <p className="mt-1 text-sm text-ink-500">
          A sentence or a paragraph, whichever feels natural. Incipit will ask a
          couple of short follow-up questions.
        </p>
        <textarea
          id="description"
          className="input-field mt-3 min-h-[160px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="For example: I'm working on a book about the Tacna-Arica dispute in the 1920s, focused on Peruvian newspaper coverage and League of Nations correspondence."
        />
        {error && <p className="mt-3 text-sm text-accent-700">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Thinking…" : "Continue"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-400">You wrote</p>
        <p className="mt-2 text-sm text-ink-800">{description}</p>
      </div>

      {history.map((turn, i) => (
        <div
          key={i}
          className={
            turn.role === "assistant"
              ? "card p-6"
              : "rounded-md border border-parchment-200 bg-parchment-50 p-4 text-sm text-ink-700"
          }
        >
          {turn.role === "assistant" ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-accent-600">
                Incipit
              </p>
              <p className="mt-2 text-ink-800">{turn.content}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">You</p>
              <p className="mt-1">{turn.content}</p>
            </>
          )}
        </div>
      ))}

      {pendingQuestion && (
        <form onSubmit={handleAnswer} className="card p-6">
          <textarea
            className="input-field min-h-[100px]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer…"
            autoFocus
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading || !answer.trim()}>
              {loading ? "Thinking…" : "Send"}
            </button>
          </div>
        </form>
      )}

      {loading && !pendingQuestion && (
        <p className="text-sm text-ink-500">Incipit is writing your profile…</p>
      )}

      {error && <p className="text-sm text-accent-700">{error}</p>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="mt-1 text-ink-800">{value || "—"}</dd>
    </div>
  );
}
