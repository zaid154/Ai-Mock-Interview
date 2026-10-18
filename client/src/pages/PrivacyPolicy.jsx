import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back-link">
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>

        <header className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: October 18, 2026</p>
        </header>

        <div className="legal-body">
          <section>
            <h2>1. Introduction</h2>
            <p>
              MockMate AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;platform&rdquo;) provides technical interview practice tools for software engineers. This Privacy Policy explains what personal data we collect, why we collect it, how it is processed, and the choices you have regarding your information.
            </p>
            <p>
              By creating an account or using our services, you acknowledge that your information will be handled in accordance with this policy.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect information you provide directly to us when using the platform:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you register, we collect your name, email address, and a secure salted hash of your password. We never store plain-text passwords.
              </li>
              <li>
                <strong>Profile Details:</strong> Optional information you provide, such as your bio, target engineering track, and profile avatar.
              </li>
              <li>
                <strong>Interview &amp; Practice Data:</strong> The questions you attempt, responses submitted via voice dictation or text, code written in the integrated editor, quiz selections, and diagnostic scoring metrics.
              </li>
              <li>
                <strong>Resume Ingestion (Optional):</strong> If you choose to upload a PDF resume to customize interview questions, we extract plain text (such as skills, projects, and work history) strictly to calibrate interview prompts to your background. Resume files are not sold or used for targeted third-party advertising.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information solely to operate and improve the platform:</p>
            <ul>
              <li>To generate role-specific interview questions, code challenges, and follow-up curveballs.</li>
              <li>To evaluate answers against technical rubrics (correctness, architecture, complexity, trade-offs).</li>
              <li>To maintain your session history, progress metrics, saved bookmarks, and milestone certificates.</li>
              <li>To display pseudonymous scores on the optional community leaderboard if you choose to participate.</li>
              <li>To send essential account communications (such as password resets and verification OTPs).</li>
            </ul>
          </section>

          <section>
            <h2>4. AI Processing &amp; Third Parties</h2>
            <p>
              MockMate AI utilizes the Google Gemini API to evaluate candidate answers and generate conversational interview prompts in real time.
            </p>
            <p>
              When an interview round runs, sanitized text prompts containing question criteria and your submitted answer or code are processed through the API. We do not sell your personal data to data brokers or third-party marketing companies.
            </p>
          </section>

          <section>
            <h2>5. Data Storage, Security &amp; Retention</h2>
            <p>
              Your data is stored securely in authenticated databases with industry-standard encryption in transit (HTTPS/TLS) and restricted server-side access. Authentication tokens are managed with secure HTTP-only cookies or encrypted headers.
            </p>
            <p>
              We retain your account data and practice history for as long as your account remains active. You can delete individual interview sessions, bookmarks, or resume records at any time from your dashboard.
            </p>
          </section>

          <section>
            <h2>6. Your Rights &amp; Account Deletion</h2>
            <p>
              You maintain control over your personal data. You have the right to access, rectify, or export your interview history, or request permanent deletion of your account and all associated records.
            </p>
            <p>
              To request full account deletion, you may email us directly at{' '}
              <a href="mailto:zaidm1323@gmail.com" className="legal-link">
                zaidm1323@gmail.com
              </a>
              . Upon confirmation, your user record, practice scorecards, and stored files will be permanently purged from our database.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              If you have questions, feedback, or privacy-related inquiries regarding this Privacy Policy, please contact:
            </p>
            <div className="legal-contact-card">
              <p><strong>MockMate AI</strong></p>
              <p>Lead Developer: Mohd Zaid</p>
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
