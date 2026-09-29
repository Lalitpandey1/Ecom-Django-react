const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api')

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = Object.values(payload).flat().find((value) => typeof value === 'string')
    throw new Error(message || 'Something went wrong. Please try again.')
  }
  return response.json()
}
