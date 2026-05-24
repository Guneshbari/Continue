'use client'

import { useState } from 'react'
import { Calendar, ShieldCheck, Edit3 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { EditProfileModal } from './EditProfileModal'

interface ProfileHeroProps {
  profile: {
    username: string
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
    createdAt: string
  }
}

export function ProfileHero({ profile: initialProfile }: ProfileHeroProps) {
  const { user, token } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [modalOpen, setModalOpen] = useState(false)

  const isOwner = user?.username === profile.username
  const joinYear = new Date(profile.createdAt).getFullYear()

  const handleProfileSave = (updated: {
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  }) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }))
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-raised border border-border-subtle p-6 md:p-8 mb-8 shadow-xl">
      {/* Background Cinematic Ambient Glow */}
      <div
        className="absolute inset-0 z-0 opacity-10 blur-3xl pointer-events-none scale-150 transition-all duration-700"
        style={{
          background: profile.avatarUrl
            ? `radial-gradient(circle at center, var(--color-accent) 0%, transparent 70%)`
            : `radial-gradient(circle at center, var(--color-accent-subtle) 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Avatar Slot */}
          <div className="relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border bg-surface-sunken shadow-lg group">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.username}'s avatar`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-overlay to-surface-raised font-display text-4xl text-text-secondary select-none">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Meta Details */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-none">
                {profile.displayName ?? profile.username}
              </h1>
              {/* Optional verified check */}
              <ShieldCheck size={18} className="text-accent shadow-sm" aria-label="Verified discovery curator" />
            </div>

            <p className="text-sm text-text-muted font-medium">@{profile.username}</p>

            {profile.bio ? (
              <p className="text-sm text-text-secondary leading-relaxed max-w-xl mt-2 select-text">
                {profile.bio}
              </p>
            ) : (
              isOwner && (
                <p className="text-xs text-text-muted italic mt-1">
                  Add a bio to share your gaming tastes with the community.
                </p>
              )
            )}

            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-text-muted font-semibold mt-3" aria-hidden="true">
              <Calendar size={13} />
              <span>Member since {joinYear}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOwner && token && (
          <div className="flex-shrink-0 text-center md:text-right">
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn--secondary btn--sm btn--icon w-full md:w-auto"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>

            <EditProfileModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              token={token}
              initialProfile={{
                displayName: profile.displayName,
                bio: profile.bio,
                avatarUrl: profile.avatarUrl,
              }}
              onSave={handleProfileSave}
            />
          </div>
        )}
      </div>
    </div>
  )
}
