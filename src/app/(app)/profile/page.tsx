import Link from "next/link";
import { getCurrentProfile } from "@/lib/queries";
import { PageShell } from "@/components/PageShell";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <PageShell>
        <header>
          <h1
            className="font-display font-extrabold text-ink-900"
            style={{
              fontSize: 36,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Research profile
          </h1>
        </header>
        <div className="card mt-10" style={{ padding: "32px" }}>
          <p className="text-[14px] text-ink-700">
            You haven&apos;t set up a research profile yet.
          </p>
          <Link href="/onboarding" className="btn-primary mt-4 inline-flex">
            Set it up now
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header>
        <h1
          className="font-display font-extrabold text-ink-900"
          style={{
            fontSize: 36,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Research profile
        </h1>
        <p className="mt-3 text-ink-500" style={{ fontSize: 15, lineHeight: 1.6 }}>
          How Incipit understands what you&apos;re working on. This context informs every extraction.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        <div className="card" style={{ padding: "24px 28px" }}>
          <span className="section-label">Your description</span>
          <p
            className="mt-3 whitespace-pre-wrap text-ink-900"
            style={{ fontSize: 15, lineHeight: 1.7 }}
          >
            {profile.research_description}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <Field label="Topic" value={profile.topic} />
            <Field label="Time period" value={profile.time_period} />
            <Field
              label="Countries"
              value={(profile.countries ?? []).join(", ")}
            />
            <Field label="Goal" value={profile.goal_type} />
            <Field label="Audience" value={profile.audience} />
          </div>
        </div>

        {profile.ai_summary && (
          <div
            className="rounded-card-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
              border: "1px solid rgba(13,148,136,0.08)",
              padding: "24px 28px",
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
              className="mt-4"
              style={{
                fontSize: 15.5,
                lineHeight: 1.8,
                color: "#3f3f46",
              }}
            >
              {profile.ai_summary}
            </p>
          </div>
        )}

        {profile.ai_questions?.length > 0 && (
          <div className="card" style={{ padding: "24px 28px" }}>
            <span className="section-label">Follow-up answers</span>
            <ul className="mt-4 flex flex-col gap-4">
              {profile.ai_questions.map((qa, i) => (
                <li
                  key={i}
                  style={{
                    borderLeft: "2px solid rgba(13,148,136,0.2)",
                    paddingLeft: 16,
                  }}
                >
                  <p
                    className="font-medium text-ink-700"
                    style={{ fontSize: 13.5 }}
                  >
                    {qa.question}
                  </p>
                  <p
                    className="mt-1.5 text-ink-600"
                    style={{ fontSize: 14, lineHeight: 1.6 }}
                  >
                    {qa.answer ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p
        className="mt-1.5"
        style={{
          fontSize: 14,
          color: value ? "#1a1a2e" : "#d4d4d8",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
