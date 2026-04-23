export const metadata = {
  title: "Terms of Service — Incipit",
};

export default function TermsPage() {
  return (
    <>
      <div className="mx-auto max-w-[720px] px-6 pb-14 pt-[140px] md:px-12">
        <h1 className="mb-2 font-display text-[36px] font-bold tracking-tight">
          Terms of Service
        </h1>
        <div className="font-mono text-[13px] text-ink-400">
          Effective: April 2026
        </div>
      </div>

      <div className="legal-content mx-auto max-w-[720px] px-6 pb-[120px] md:px-12">
        <Section n={1} title="What Incipit is">
          <p>
            Incipit is an AI-powered archival research tool that helps
            historians and researchers organize, verify, and connect primary
            source documents. The service is provided by Incipit
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). By
            creating an account and using Incipit, you agree to these
            terms.
          </p>
        </Section>

        <Section n={2} title="Early access">
          <p>
            Incipit is currently in early access. Features may change, be
            added, or be removed as the product develops. During early
            access, each account is limited to a set number of document
            uploads. We may adjust these limits at any time. Early access
            is provided free of charge. This may change in the future, and
            we will notify you before any paid features are introduced.
          </p>
        </Section>

        <Section n={3} title="Your account">
          <p>
            You sign in using Google or Apple authentication. You are
            responsible for maintaining the security of your account. You
            agree to provide accurate information and to use only one
            account per person. We reserve the right to suspend or
            terminate accounts that violate these terms.
          </p>
        </Section>

        <Section n={4} title="Your documents">
          <p>
            <strong>You own your documents.</strong> Anything you upload to
            Incipit remains your property. We do not claim ownership of
            your documents, your metadata, your research notes, or any
            content you create within the service.
          </p>
          <p>
            We store your documents on secure servers (hosted by Supabase)
            and process them using AI services (provided by Anthropic) to
            extract metadata, identify entities, and surface connections.
            Your documents are not shared with other users, sold to third
            parties, or used to train AI models.
          </p>
        </Section>

        <Section n={5} title="AI-generated content">
          <p>
            Incipit uses AI to extract metadata, identify entities, and
            suggest connections between documents.{" "}
            <strong>
              AI-generated content is not guaranteed to be accurate.
            </strong>{" "}
            This is why Incipit includes a verification step: you review
            and confirm all extracted metadata before it is committed to
            your archive. You are responsible for verifying the accuracy of
            any AI-generated content before relying on it in your research,
            publications, or citations.
          </p>
        </Section>

        <Section n={6} title="Acceptable use">
          <p>
            You agree to use Incipit only for lawful purposes. You may not
            upload, store, or process any content that:
          </p>
          <p>
            <strong>Is illegal.</strong> This includes but is not limited
            to content that violates local, state, national, or
            international law. This includes content related to child
            exploitation, terrorism, or illegal trafficking of any kind.
          </p>
          <p>
            <strong>Infringes on the rights of others.</strong> Do not
            upload documents you do not have the right to possess or use.
            If you are working with archival materials, ensure you have the
            appropriate permissions or that the materials are in the public
            domain or covered by fair use.
          </p>
          <p>
            <strong>Contains harmful or abusive material.</strong> This
            includes content that is obscene, threatening, defamatory, or
            designed to harass or harm others.
          </p>
          <p>
            <strong>Attempts to abuse the service.</strong> Do not attempt
            to circumvent usage limits, reverse-engineer the service,
            interfere with other users&apos; accounts, or use automated
            tools to upload content in bulk beyond what the interface
            provides.
          </p>
          <p>
            <strong>Violates third-party service terms.</strong> Your use
            of Incipit must also comply with the terms of service of our
            infrastructure providers, including Supabase (data storage)
            and Anthropic (AI processing). Content that violates their
            acceptable use policies may be removed.
          </p>
          <p>
            We reserve the right to remove content and terminate accounts
            that violate these guidelines without prior notice.
          </p>
        </Section>

        <Section n={7} title="Image and file uploads">
          <p>
            Incipit is designed for uploading scans, photographs, and PDFs
            of research documents. Supported file types include PDF, JPG,
            JPEG, PNG, and similar image formats. You agree that all files
            you upload are documents you have the right to use for research
            purposes. Do not upload files containing malware, executable
            code, or content designed to exploit vulnerabilities in our
            systems or third-party services.
          </p>
        </Section>

        <Section n={8} title="Data retention and deletion">
          <p>
            Your documents, metadata, and account information are stored
            for as long as your account is active. You may request deletion
            of your account and all associated data at any time by
            contacting us. Upon deletion, your documents and metadata will
            be permanently removed from our systems within 30 days. Backups
            may retain data for up to an additional 30 days before being
            purged.
          </p>
        </Section>

        <Section n={9} title="Service availability">
          <p>
            We aim to keep Incipit available and reliable, but we do not
            guarantee uninterrupted access. The service may be temporarily
            unavailable due to maintenance, updates, or circumstances
            beyond our control. We are not liable for any loss or
            inconvenience caused by downtime.
          </p>
        </Section>

        <Section n={10} title="Limitation of liability">
          <p>
            Incipit is provided &ldquo;as is&rdquo; and &ldquo;as
            available.&rdquo; We make no warranties, express or implied,
            regarding the service&apos;s accuracy, reliability, or fitness
            for a particular purpose. To the maximum extent permitted by
            law, we are not liable for any indirect, incidental, special,
            or consequential damages arising from your use of the service.
            This includes but is not limited to loss of data, loss of
            research, or reliance on AI-generated content that proves
            inaccurate.
          </p>
        </Section>

        <Section n={11} title="Changes to these terms">
          <p>
            We may update these terms as Incipit evolves. When we make
            significant changes, we will notify you through the service or
            via email. Continued use of Incipit after changes take effect
            constitutes acceptance of the updated terms.
          </p>
        </Section>

        <Section n={12} title="Contact">
          <p>
            If you have questions about these terms, contact us at the
            email address provided in your account settings or through the
            Incipit website.
          </p>
        </Section>
      </div>
    </>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-[20px] font-bold tracking-tight">
        {n}. {title}
      </h2>
      <div className="flex flex-col gap-4 text-[15px] leading-[1.8] text-ink-600 [&_strong]:font-semibold [&_strong]:text-ink-900">
        {children}
      </div>
    </section>
  );
}
