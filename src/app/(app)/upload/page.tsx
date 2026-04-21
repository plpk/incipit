import { getCurrentProfile } from "@/lib/queries";
import { UploadWorkflow } from "./UploadWorkflow";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const profile = await getCurrentProfile();
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">
            Upload a document
          </h1>
          <p className="mt-2 text-ink-500">
            Drop in a scan or photograph. Incipit reads the image and proposes
            metadata for you to confirm.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <UploadWorkflow profileId={profile?.id ?? null} />
      </div>
    </div>
  );
}
