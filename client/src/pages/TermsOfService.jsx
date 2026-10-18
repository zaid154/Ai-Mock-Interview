import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back-link">
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>

        <header className="legal-header">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Effective: October 18, 2026</p>
        </header>

        <div className="legal-body">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or creating an account on MockMate AI (&ldquo;the platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2>2. Purpose &amp; Educational Disclaimer</h2>
            <p>
              MockMate AI is an educational simulation tool developed to assist software engineers with technical interview preparation, system design drills, and self-assessment.
            </p>
            <p>
              Interview evaluations, rubric scores, and Big-O feedback are generated using artificial intelligence models. While we strive to reflect real industry standards, our evaluations do not guarantee employment, offer letters, or official endorsement by any prospective employer.
            </p>
          </section>

          <section>
            <h2>3. Account Responsibilities</h2>
            <p>When creating an account on MockMate AI, you agree to:</p>
            <ul>
              <li>Provide accurate contact details during registration.</li>
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Notify us promptly if you detect unauthorized access to your account.</li>
            </ul>
          </section>

          <section>
            <h2>4. Acceptable Use Policy</h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul>
              <li>Attempting to probe, scan, or reverse engineer platform endpoints or security measures.</li>
              <li>Using automated scraping tools, bots, or scripts to flood API endpoints.</li>
              <li>Uploading malicious files, illegal materials, or proprietary non-public employer code into resume ingestion or code editors.</li>
              <li>Forging, altering, or misrepresenting digital milestone certificates or public verification hashes.</li>
            </ul>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <p>
              All platform design, branding, software code, and educational curriculums are the property of MockMate AI and its creators. You retain ownership of any original code solutions, notes, and resumes you submit to the platform.
            </p>
          </section>

          <section>
            <h2>6. Service Availability &amp; Termination</h2>
            <p>
              We reserve the right to modify, update, or discontinue features of the platform to improve quality or ensure security. We may suspend or terminate accounts that violate our acceptable use policy.
            </p>
          </section>

          <section>
            <h2>7. Contact Information</h2>
            <p>
              For legal or terms-related inquiries, please reach out to:
            </p>
            <div className="legal-contact-card">
              <p><strong>MockMate AI</strong></p>
              <p>Developer: Mohd Zaid</p>
              <p>
                Email:{' '}
                <a href="mailto:zaidm1323@gmail.com" className="legal-link">
                  zaidm1323@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
