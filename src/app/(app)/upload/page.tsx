import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getResearchProfileForUser } from "@/lib/queries";
import { getServerSupabase } from "@/lib/supabase/server";
import { PageShell } from "@/components/PageShell";
import { UploadWorkflow } from "./UploadWorkflow";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const admin = getServerSupabase();
  const [profile, profileRow] = await Promise.all([
    getResearchProfileForUser(user.id),
    admin
      .from("profiles")
      .select("document_count, document_limit")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const count = profileRow.data?.document_count ?? 0;
  const limit = profileRow.data?.document_limit ?? 10;
  const atLimit = count >= limit;

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
          Upload a document
        </h1>
        <p className="mt-3 text-ink-500" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Drop in a scan or photograph. Incipit reads the image and proposes
          metadata for you to confirm.
        </p>
      </header>

      {atLimit ? (
        <div
          className="mt-10 rounded-card-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(194,113,79,0.08), rgba(194,113,79,0.04))",
            border: "1px solid rgba(194,113,79,0.2)",
            padding: "28px 32px",
          }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: 17, letterSpacing: "-0.02em", color: "#a25036" }}
          >
            You&apos;ve reached your early access limit of {limit} documents.
          </p>
          <p className="mt-2 text-[14px] text-ink-600" style={{ lineHeight: 1.6 }}>
            We&apos;ll expand this as Incipit grows.
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <UploadWorkflow profileId={profile?.id ?? null} />
        </div>
      )}
    </PageShell>
  );
}
