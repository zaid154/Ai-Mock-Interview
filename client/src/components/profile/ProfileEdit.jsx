import { Save } from 'lucide-react'

export default function ProfileEdit({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  bio,
  setBio,
  savingProfile,
  onSaveProfile,
  handleSaveProfile,
  userEmail,
}) {
  const saveProfile = onSaveProfile || handleSaveProfile

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Personal Information
        </h2>
        <p className="text-xs text-slate-500 m-0">
          Update your public name, target engineering roles, and preparation goals.
        </p>
      </div>

      <form onSubmit={saveProfile} className="flex flex-col gap-5 max-w-2xl">
        {/* Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Name
            </label>
            <input
              id="profile-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div>
            <label htmlFor="profile-last-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name
            </label>
            <input
              id="profile-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </div>

        {/* Bio & Target Roles */}
        <div>
          <label htmlFor="profile-bio" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Bio &amp; Target Roles
          </label>
          <textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Target roles, tech stack, and what you are preparing for (e.g. Senior Frontend Engineer, React 18, Distributed Systems)..."
            className="w-full p-3.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white leading-relaxed text-slate-800"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Used by the AI engine to calibrate question difficulty and scenario relevance.
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-start">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{savingProfile ? 'Saving Changes…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
