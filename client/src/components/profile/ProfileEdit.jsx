import { Save, User, FileText } from 'lucide-react'

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
}) {
  const saveProfile = onSaveProfile || handleSaveProfile

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Candidate Profile Details
        </h2>
        <p className="text-xs text-slate-500 m-0">
          Update your personal details, target roles, and tech stack preferences.
        </p>
      </div>

      <form onSubmit={saveProfile} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="profile-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-last-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name
            </label>
            <input
              id="profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-bio" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Bio &amp; Target Roles
          </label>
          <textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Target roles, tech stack, and what engineering topics you are actively preparing for (e.g. Senior Frontend, React 18, Distributed Go)..."
            className="w-full p-3.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white leading-relaxed"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{savingProfile ? 'Saving Changes…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
