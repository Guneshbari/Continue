export interface TwitchOauthResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface IgdbTokenState {
  accessToken: string | null
  expiresAt: number | null
}
