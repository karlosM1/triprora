import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header />
      <main className="mx-auto max-w-180 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Privacy Policy"
          title="How we collect, use, and protect your information"
          subtitle="Last updated: July 8, 2026"
        />

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">1. Introduction</h2>
            <p>
              Welcome to <strong>Crabr</strong> (the <strong>"Service"</strong>
              ). This Privacy Policy explains how we collect, use, and share
              information when you use our website, web app, or related services
              (collectively, <strong>"Service"</strong>).
            </p>
            <p>
              By using the Service, you agree to the collection and use of
              information in accordance with this Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-[16px] font-semibold">
                  2.1 Information you provide
                </h3>
                <ul className="mt-2 list-disc pl-5">
                  <li>Account information (such as name and email)</li>
                  <li>Profile details and preferences</li>
                  <li>Messages and support requests you send us</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold">
                  2.2 Information we collect automatically
                </h3>
                <ul className="mt-2 list-disc pl-5">
                  <li>Usage data (pages visited and features used)</li>
                  <li>Device and log data (e.g., IP address, browser type)</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              3. How we use your information
            </h2>
            <ul className="mt-2 list-disc pl-5">
              <li>Provide, maintain, and improve the Service</li>
              <li>Manage accounts and enable bookings</li>
              <li>Communicate with you about your requests and support</li>
              <li>Analyze usage to improve performance and user experience</li>
              <li>
                Detect, prevent, and address fraud, abuse, and security issues
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              4. Legal bases for processing (if applicable)
            </h2>
            <p>
              If you are located in the EEA/UK, we process personal data under
              applicable legal bases such as contract performance, legitimate
              interests, consent (where required), and legal obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              5. How we share information
            </h2>
            <p>We may share information with:</p>
            <ul className="mt-2 list-disc pl-5">
              <li>
                <strong>Service providers</strong> (hosting, analytics, email
                delivery, and support tools)
              </li>
              <li>
                <strong>Third parties</strong> when you request a specific
                integration or feature
              </li>
              <li>
                <strong>Legal and safety reasons</strong> when required by law
                or to protect rights and safety
              </li>
              <li>
                <strong>Business transfers</strong> (e.g., merger or
                acquisition)
              </li>
            </ul>
            <p className="mt-3">We do not sell your personal information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              6. Cookies and tracking technologies
            </h2>
            <p>
              We may use cookies and similar technologies to keep you signed in,
              remember your preferences, and understand how the Service is used.
              You can control cookies through your browser settings; disabling
              cookies may affect some functionality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">7. Data retention</h2>
            <p>
              We retain information for as long as necessary to provide the
              Service, comply with legal requirements, resolve disputes, and
              enforce our agreements. When information is no longer needed, we
              delete or anonymize it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">8. Data security</h2>
            <p>
              We use reasonable technical and organizational safeguards to help
              protect personal data. However, no method of transmission or
              storage is completely secure, so we cannot guarantee absolute
              security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              9. International transfers
            </h2>
            <p>
              Your information may be processed and stored in countries other
              than your own. Where required, we use appropriate safeguards to
              protect personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">10. Your rights</h2>
            <p>
              Depending on your location, you may have rights such as access,
              correction, deletion, restriction, objection, or data portability.
              If you want to exercise your rights, contact us at{" "}
              <a
                href="mailto:crabr0001@gmail.com"
                className="text-[#0066cc] hover:underline"
              >
                crabr0001@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              11. Children’s privacy
            </h2>
            <p>
              The Service is not intended for children under 13 (or the minimum
              age required in your jurisdiction). We do not knowingly collect
              personal information from children. If you believe a child has
              provided personal information to us, contact us and we will take
              appropriate steps to delete it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">12. Third-party links</h2>
            <p>
              The Service may contain links to third-party websites or services.
              We are not responsible for their privacy practices. We encourage
              you to review the privacy policies of those third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              13. Changes to this Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will post
              the updated policy on this page and update the “Last updated”
              date. If changes are material, we may provide additional notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">14. Contact us</h2>
            <p>
              If you have questions about this Privacy Policy, contact{" "}
              <strong>Crabr Inc.</strong> at{" "}
              <a
                href="mailto:crabr0001@gmail.com"
                className="text-[#0066cc] hover:underline"
              >
                crabr0001@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
