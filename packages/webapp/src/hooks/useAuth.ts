import { useEffect, useState } from 'react'

const TOKEN_STORAGE_KEY = 'bitcoin_clicker_auth_token'

export function useAuth(): string {
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    // Try to get existing token from localStorage
    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (existingToken) {
      console.log('🔑 Using existing token:', existingToken.substring(0, 8) + '...')
      setToken(existingToken)
    } else {
      // Generate a new token
      const newToken = generateToken()
      console.log('✨ Generated new token:', newToken.substring(0, 8) + '...')
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
      setToken(newToken)
    }
  }, [])

  return token
}

function generateToken(): string {
  // Generate a random token using crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
