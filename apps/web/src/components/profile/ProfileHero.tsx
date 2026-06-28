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
    <div className="bg-surface-raised border-border-subtle relative mb-8 overflow-hidden rounded-2xl border p-6 shadow-xl md:p-8">
      {/* Background Cinematic Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-150 opacity-10 blur-3xl transition-all duration-700"
        style={{
          background: profile.avatarUrl
            ? `radial-gradient(circle at center, var(--color-accent) 0%, transparent 70%)`
            : `radial-gradient(circle at center, var(--color-accent-subtle) 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          {/* Avatar Slot */}
          <div className="border-border bg-surface-sunken group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 shadow-lg md:h-28 md:w-28">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.username}'s avatar`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="from-surface-overlay to-surface-raised font-display text-text-secondary flex h-full w-full select-none items-center justify-center bg-gradient-to-br text-4xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Meta Details */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className="text-text-primary text-2xl font-extrabold leading-none tracking-tight md:text-3xl">
                {profile.displayName ?? profile.username}
              </h1>
              {/* Optional verified check */}
              <ShieldCheck
                size={18}
                className="text-accent shadow-sm"
                aria-label="Verified discovery curator"
              />
            </div>

            <p className="text-text-muted text-sm font-medium">@{profile.username}</p>

            {profile.bio ? (
              <p className="text-text-secondary mt-2 max-w-xl select-text text-sm leading-relaxed">
                {profile.bio}
              </p>
            ) : (
              isOwner && (
                <p className="text-text-muted mt-1 text-xs italic">
                  Add a bio to share your gaming tastes with the community.
                </p>
              )
            )}

            <div
              className="text-text-muted mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold md:justify-start"
              aria-hidden="true"
            >
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
