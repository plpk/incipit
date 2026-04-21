import Link from "next/link";
import { getCurrentProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <div>
        <h1 className="font-serif text-3xl font-semibold">Research profile</h1>
        <div className="card mt-8 p-8">
          <p>You haven&apos;t set up a research profile yet.</p>
          <Link href="/onboarding" className="btn-primary mt-4 inline-flex">
            Set it up now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Research profile</h1>
      <p className="mt-2 text-ink-500">
        How Incipit understands what you&apos;re working on. This context informs
        every extraction.
      </p>

      <div className="card mt-8 p-8">
        <h2 className="font-serif text-xl font-semibold">Your description</h2>
        <p className="mt-2 whitespace-pre-wrap text-ink-800">
          {profile.research_description}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Field label="Topic" value={profile.topic} />
          <Field label="Time period" value={profile.time_period} />
          <Field label="Countries" value={(profile.countries ?? []).join(", ")} />
          <Field label="Goal" value={profile.goal_type} />
          <Field label="Audience" value={profile.audience} />
        </dl>

        {profile.ai_summary && (
          <div className="mt-6 rounded-md bg-parchment-100 p-4 text-sm text-ink-700">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
              AI summary
            </p>
            <p className="mt-2">{profile.ai_summary}</p>
          </div>
        )}

        {profile.ai_questions?.length > 0 && (
          <div className="mt-6">
            <p className="label">Follow-up answers</p>
            <ul className="mt-3 space-y-3">
              {profile.ai_questions.map((qa, i) => (
                <li
                  key={i}
                  className="rounded-md border border-parchment-200 bg-parchment-50 p-3 text-sm"
                >
                  <p className="font-medium text-ink-700">{qa.question}</p>
                  <p className="mt-1 text-ink-600">{qa.answer ?? "—"}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="mt-1 text-ink-800">{value || "—"}</dd>
    </div>
  );
}
