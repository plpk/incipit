export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="mx-auto max-w-[720px] px-6 pb-14 pt-[140px] md:px-12">
        <h1 className="mb-2 font-display text-[36px] font-bold tracking-tight">
          Privacy Policy
        </h1>
        <div className="font-mono text-[13px] text-ink-400">
          Effective: April 2026
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-6 pb-[120px] md:px-12">
        <Section n={1} title="What this policy covers">
          <p>
            This policy explains what information Incipit collects, how we
            use it, who we share it with, and your rights regarding your
            data. We&apos;ve written this in plain language because we want
            you to actually read it.
          </p>
        </Section>

        <Section n={2} title="What we collect">
          <p>
            <strong>Account information.</strong> When you sign in with
            Google or Apple, we receive your name and email address from
            the authentication provider. We do not receive or store your
            Google or Apple password.
          </p>
          <p>
            <strong>Documents you upload.</strong> When you upload a scan,
            photograph, or PDF, we store the original file on secure
            servers hosted by Supabase. We also store the metadata
            extracted from that document (title, date, author, publication,
            entities, language, and other fields), your verification
            decisions on each field, your research notes, provenance
            information, and the metadata changelog.
          </p>
          <p>
            <strong>Research profile.</strong> When you set up your
            research context (your topic, time period, countries, and
            research goals), we store that information to shape how Incipit
            analyzes your documents.
          </p>
          <p>
            <strong>Usage data.</strong> We collect basic information about
            how you use the service, such as when you sign in, how many
            documents you&apos;ve uploaded, and which features you use. We
            use this to understand how the product is being used and to
            improve it.
          </p>
        </Section>

        <Section n={3} title="How we use your information">
          <p>
            <strong>To provide the service.</strong> Your documents are
            processed by AI (Anthropic&apos;s Claude API) to extract
            metadata, identify entities, and surface connections between
            documents. Your research profile is included in this processing
            to shape the analysis. This is the core function of Incipit and
            the primary reason we process your data.
          </p>
          <p>
            <strong>To maintain your account.</strong> Your name and email
            are used to identify your account and communicate with you
            about the service (such as important updates or changes to
            these policies).
          </p>
          <p>
            <strong>To improve Incipit.</strong> Aggregated, anonymized
            usage data helps us understand how the product is used and what
            to build next. We do not use your individual documents,
            metadata, or research notes for this purpose.
          </p>
        </Section>

        <Section n={4} title="Third-party services">
          <p>Incipit relies on the following third-party services to function:</p>
          <p>
            <strong>Anthropic (Claude API).</strong> Your uploaded
            documents are sent to Anthropic&apos;s API for AI processing.
            This includes the document image and your research context.
            Anthropic&apos;s data usage policy applies to this processing.
            As of this writing, Anthropic does not use API inputs to train
            their models. You can review Anthropic&apos;s privacy policy at
            anthropic.com.
          </p>
          <p>
            <strong>Supabase.</strong> Your documents, metadata, and
            account information are stored on servers provided by Supabase.
            Supabase provides the database and file storage infrastructure.
            You can review Supabase&apos;s privacy policy at supabase.com.
          </p>
          <p>
            <strong>Vercel.</strong> The Incipit web application is hosted
            on Vercel. Vercel handles the delivery of the application to
            your browser. You can review Vercel&apos;s privacy policy at
            vercel.com.
          </p>
          <p>
            <strong>Google and Apple (authentication).</strong> Sign-in is
            handled through Google or Apple OAuth. We receive only your
            name and email from these providers. We do not access your
            Google Drive, Apple iCloud, contacts, or any other data from
            these services.
          </p>
        </Section>

        <Section n={5} title="What we do not do">
          <p>
            <strong>We do not sell your data.</strong> Not your documents,
            not your metadata, not your email, not your usage patterns. We
            have no advertising business and no intention of building one.
          </p>
          <p>
            <strong>We do not share your documents with other users.</strong>{" "}
            Your archive is private to your account. Other Incipit users
            cannot see, search, or access your documents.
          </p>
          <p>
            <strong>
              We do not use your documents to train AI models.
            </strong>{" "}
            Your uploaded documents and metadata are processed by the
            Claude API to provide the service. They are not used as
            training data for any AI model, by us or by our providers.
          </p>
          <p>
            <strong>
              We do not access your documents for our own purposes.
            </strong>{" "}
            We may access account data for technical support or to
            investigate abuse reports, but we do not browse, read, or
            analyze your research documents for any purpose other than
            providing the service to you.
          </p>
        </Section>

        <Section n={6} title="Data security">
          <p>
            We use industry-standard security practices to protect your
            data, including encrypted connections (HTTPS), secure
            authentication through Google and Apple OAuth, and hosted
            infrastructure from providers (Supabase, Vercel) that maintain
            their own security certifications. However, no system is
            completely secure. We cannot guarantee absolute security of
            your data and encourage you to maintain your own backups of
            important research documents.
          </p>
        </Section>

        <Section n={7} title="Data retention">
          <p>
            We retain your data for as long as your account is active. If
            you delete your account, we will delete your documents,
            metadata, research profile, and account information within 30
            days. Automated backups may retain data for up to an additional
            30 days before being purged. After that, your data is
            permanently gone.
          </p>
        </Section>

        <Section n={8} title="Your rights">
          <p>
            <strong>Access.</strong> You can view all of your documents,
            metadata, and account information within the Incipit
            application at any time.
          </p>
          <p>
            <strong>Correction.</strong> You can edit your metadata and
            research profile at any time through the application.
          </p>
          <p>
            <strong>Deletion.</strong> You can request deletion of your
            account and all associated data by contacting us. We will
            process deletion requests within 30 days.
          </p>
          <p>
            <strong>Export.</strong> We intend to provide data export
            functionality in a future update. In the meantime, you can
            contact us to request an export of your data.
          </p>
        </Section>

        <Section n={9} title="Children">
          <p>
            Incipit is not designed for or directed at children under 13.
            We do not knowingly collect information from children under 13.
            If we learn that we have collected data from a child under 13,
            we will delete that information promptly.
          </p>
        </Section>

        <Section n={10} title="International users">
          <p>
            Incipit is operated from the United States. If you are
            accessing the service from outside the United States, your data
            will be transferred to and processed in the United States. By
            using Incipit, you consent to this transfer. If you are located
            in the European Economic Area, United Kingdom, or other regions
            with data protection laws, you have certain rights regarding
            your personal data as described in Section 8.
          </p>
        </Section>

        <Section n={11} title="Changes to this policy">
          <p>
            We may update this privacy policy as Incipit evolves. When we
            make significant changes, we will notify you through the
            service or via email. The effective date at the top of this
            page will be updated accordingly.
          </p>
        </Section>

        <Section n={12} title="Contact">
          <p>
            If you have questions about this privacy policy or how your
            data is handled, contact us at the email address provided in
            your account settings or through the Incipit website.
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
