import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header />
      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Terms of Service"
          title="Terms, conditions, and usage rules"
          subtitle="Last updated: July 8, 2026"
        />

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (the <strong>"Terms"</strong>) govern your
              use of Crabr’s website, web app, and related services (the{" "}
              <strong>"Service"</strong>). By accessing or using the Service,
              you agree to be bound by these Terms. If you do not agree, do not
              use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">2. Eligibility</h2>
            <p>
              You must be at least 13 years old (or the minimum legal age in
              your jurisdiction) to use the Service. By using the Service, you
              represent that you meet this requirement and that you have the
              authority to agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">3. Accounts</h2>
            <ul className="mt-2 list-disc pl-5">
              <li>You may need an account for certain features.</li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials and for all activity under your account.
              </li>
              <li>
                You must promptly notify us of any unauthorized use or security
                breach.
              </li>
              <li>
                We may suspend or terminate your account if you violate these
                Terms.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">4. Use of the Service</h2>
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms.
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>
                Do not interfere with or disrupt the integrity or performance of
                the Service.
              </li>
              <li>
                Do not attempt unauthorized access to the Service or related
                systems.
              </li>
              <li>
                Do not upload or transmit unlawful, harmful, abusive, harassing,
                defamatory, obscene, or otherwise objectionable content.
              </li>
              <li>
                Do not reverse engineer, decompile, or disassemble the Service
                except where permitted by law.
              </li>
            </ul>
            <p className="mt-3">
              We may remove or restrict content that violates these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">5. User Content</h2>
            <p>
              If you submit, upload, or share content through the Service ({" "}
              <strong>"User Content"</strong> ), you retain ownership of that
              content.
            </p>
            <p>
              By providing User Content, you grant Crabr a worldwide,
              non-exclusive, royalty-free license to use, reproduce, modify,
              adapt, publish, translate, distribute, and display your User
              Content as necessary to operate and improve the Service.
            </p>
            <p>
              You represent that you have all rights necessary to provide User
              Content and that it does not infringe or violate any third-party
              rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              6. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              (excluding User Content) are and will remain the exclusive
              property of Crabr and its licensors.
            </p>
            <p>
              Crabr’s name, logo, and related marks are trademarks of Crabr. You
              may not use them without our prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              7. Payments and Subscriptions (if applicable)
            </h2>
            <p>
              If the Service includes paid features or subscriptions, you agree
              to pay all applicable fees as described at the time of purchase.
              Charges may be recurring and will continue until you cancel where
              applicable.
            </p>
            <p>
              Refund policies (if any) will be provided at the point of sale or
              in a separate policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              8. Third-party Services
            </h2>
            <p>
              The Service may integrate with or link to third-party services. We
              do not control and are not responsible for these third parties.
              Your use of third-party services is subject to their own terms and
              policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any
              time, with or without notice, if:
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>You violate these Terms.</li>
              <li>We are required to do so by law.</li>
              <li>We discontinue the Service.</li>
            </ul>
            <p className="mt-3">
              Certain provisions will survive termination, including ownership
              provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">10. Disclaimers</h2>
            <p>
              The Service is provided on an <strong>"AS IS"</strong> and{" "}
              <strong>"AS AVAILABLE"</strong> basis.
            </p>
            <p>
              To the fullest extent permitted by law, Crabr disclaims all
              warranties, express or implied, including implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, secure,
              or error-free, or that defects will be corrected.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              11. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Crabr and its affiliates
              will not be liable for indirect, incidental, special,
              consequential, or punitive damages, or for loss of profits,
              revenue, data, or goodwill.
            </p>
            <p className="mt-3">
              Crabr’s total liability for all claims related to the Service will
              not exceed the greater of (i) the amount you paid to use the
              Service in the three months preceding the claim, or (ii) $100 (or
              equivalent in your local currency).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Crabr and its
              affiliates from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable attorneys’ fees)
              arising out of or in any way connected with your use of the
              Service or your violation of these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              13. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of the
              Philippines, without regard to conflict of law rules. Any disputes
              will be resolved in the courts located in the Philippines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">
              14. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. We will post the
              updated Terms on this page and update the “Last updated” date.
              Material changes may be notified to you through email or in-app
              messages where applicable.
            </p>
            <p className="mt-3">
              By continuing to use the Service after the changes take effect,
              you agree to the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">15. Contact Us</h2>
            <p>
              If you have any questions about these Terms, contact Crabr Inc. at{" "}
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
