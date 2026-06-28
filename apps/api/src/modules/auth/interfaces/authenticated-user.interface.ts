export interface AuthenticatedUser {
  id: string // Local user database ID
  firebaseUid: string // Firebase unique identifier
  email: string // User email address
  username: string // Local unique username
  role: string // Local user role (USER, MODERATOR, ADMIN)
  displayName: string | null
  picture: string | null
  emailVerified: boolean
}
