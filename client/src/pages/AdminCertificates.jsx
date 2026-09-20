import AdminNav from '../components/admin/AdminNav'
import CertificateManager from '../components/CertificateManager'

/**
 * AdminCertificates: Dedicated platform administration sub-page for certificate templates.
 */
export default function AdminCertificates() {
  return (
    <main className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      <AdminNav />
      <CertificateManager />
    </main>
  )
}
