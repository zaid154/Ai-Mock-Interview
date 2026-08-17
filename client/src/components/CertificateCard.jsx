import { Zap, ShieldCheck, ExternalLink } from 'lucide-react'

// One certificate renderer, three layouts. The design comes from the template the
// admin picked, so switching it is purely presentational — every layout reads the
// same fields and the same verification id.
//
// The root keeps the `.official-cert-card` class in every design on purpose:
// Certificates.jsx rasterises `document.querySelector('.official-cert-card')` for
// the PDF, and the @media print block in index.css isolates that same selector.
// Renaming it would silently break both.

function Signature({ signatureImage, signatoryName, signatoryTitle }) {
  return (
    <div className="cert-sign">
      {signatureImage ? (
        <img src={signatureImage} alt="Authorised signature" className="cert-sign-img" />
      ) : (
        <svg className="cert-sign-svg" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 35C25 15 45 40 60 20C75 5 90 45 110 25C130 10 145 35 160 15C170 5 185 30 195 20"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 40C50 38 120 42 180 39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span className="cert-sign-rule" />
      <strong className="cert-sign-name">{signatoryName}</strong>
      <span className="cert-sign-title">{signatoryTitle}</span>
    </div>
  )
}

function Qr({ verifyUrl, size = 60 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verifyUrl)}&size=200x200&margin=2`
  return (
    <img
      src={src}
      alt="Scan to verify this credential"
      crossOrigin="anonymous"
      className="cert-qr"
      style={{ width: size, height: size }}
    />
  )
}

export default function CertificateCard({
  design = 'classic',
  accent = '#4f46e5',
  title,
  subtitle = 'has successfully completed technical qualification for',
  candidateName,
  role,
  score,
  dateStr,
  certId,
  verifyUrl,
  signatoryName,
  signatoryTitle,
  signatureImage,
}) {
  const name = (candidateName || 'Candidate Name').toUpperCase()
  const sign = { signatureImage, signatoryName, signatoryTitle }
  const style = { '--cert-accent': accent }

  if (design === 'modern') {
    return (
      <div className="official-cert-card cert-modern" style={style}>
        <span className="cert-modern-bar" />
        <div className="cert-modern-body">
          <header className="cert-modern-head">
            <span className="cert-brand">
              <span className="cert-brand-mark"><Zap size={16} /></span>
              MockMate
            </span>
            <span className="cert-modern-date mono">{dateStr}</span>
          </header>

          <p className="cert-eyebrow">Certificate of achievement</p>
          <h1 className="cert-modern-name">{name}</h1>
          <p className="cert-subtext">{subtitle}</p>
          <h2 className="cert-modern-title">{title}</h2>
          <p className="cert-desc">
            Evaluated by Google Gemini AI in <strong>{role}</strong>
            {score != null && <> · <strong>{score}%</strong> score</>}
          </p>

          <footer className="cert-modern-foot">
            <Signature {...sign} />
            <div className="cert-modern-verify">
              <Qr verifyUrl={verifyUrl} size={66} />
              <span className="cert-code mono">
                {certId} <ExternalLink size={10} />
              </span>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  if (design === 'elegant') {
    return (
      <div className="official-cert-card cert-elegant" style={style}>
        <div className="cert-elegant-frame">
          <span className="cert-brand cert-elegant-brand">
            <span className="cert-brand-mark"><Zap size={15} /></span>
            MockMate
          </span>

          <p className="cert-eyebrow">Certificate of excellence</p>
          <span className="cert-elegant-rule" />

          <p className="cert-elegant-presented">This is to certify that</p>
          <h1 className="cert-elegant-name">{name}</h1>
          <p className="cert-subtext">{subtitle}</p>
          <h2 className="cert-elegant-title">{title}</h2>
          <p className="cert-desc">
            Evaluated by Google Gemini AI in <strong>{role}</strong>
            {score != null && <> · <strong>{score}%</strong> score</>}
          </p>

          <span className="cert-elegant-rule" />

          <footer className="cert-elegant-foot">
            <Signature {...sign} />
            <div className="cert-elegant-seal">
              <ShieldCheck size={22} />
              <span>Verified</span>
            </div>
            <div className="cert-elegant-verify">
              <Qr verifyUrl={verifyUrl} size={58} />
              <span className="cert-code mono">{certId}</span>
              <span className="cert-elegant-date mono">{dateStr}</span>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  // classic — the original two-column layout with the ribbon sidebar
  return (
    <div className="official-cert-card cert-classic" style={style}>
      <div className="official-cert-frame">
        <div className="official-cert-grid">
          <div className="official-cert-main">
            <div>
              <div className="official-cert-header">
                <span className="cert-brand">
                  <span className="cert-brand-mark"><Zap size={16} /></span>
                  MockMate
                </span>
                <span className="official-cert-date mono">{dateStr}</span>
              </div>

              <div className="official-cert-recipient">
                <h1 className="official-cert-recipient-name">{name}</h1>
                <p className="official-cert-subtext">{subtitle}</p>
              </div>

              <div className="official-cert-title-block">
                <h2 className="official-cert-course-title">{title}</h2>
                <p className="official-cert-course-desc">
                  Evaluated by Google Gemini AI in <strong>{role}</strong>
                  {score != null && <> ({score}% score)</>}.
                </p>
              </div>
            </div>

            <Signature {...sign} />
          </div>

          <div className="official-cert-sidebar">
            <div className="official-cert-banner-tag">
              COURSE<br />CERTIFICATE
            </div>

            <div className="official-cert-stamp-badge">
              <div className="official-cert-stamp-inner">
                <ShieldCheck size={26} />
                <div className="official-cert-stamp-text">
                  MOCKMATE<br />VERIFIED
                </div>
              </div>
            </div>

            <div className="cert-classic-verify">
              <Qr verifyUrl={verifyUrl} size={60} />
              <span className="cert-scan-label">Scan to verify</span>
              <span className="cert-code mono">{certId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
