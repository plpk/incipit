import { getCurrentProfile } from "@/lib/queries";
import { PageShell } from "@/components/PageShell";
import { UploadWorkflow } from "./UploadWorkflow";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const profile = await getCurrentProfile();
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

      <div className="mt-10">
        <UploadWorkflow profileId={profile?.id ?? null} />
      </div>
    </PageShell>
  );
}
