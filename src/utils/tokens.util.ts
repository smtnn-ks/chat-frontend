export async function refreshTokens() {
  const response = await fetch(
    `https://${import.meta.env.VITE_BACK_HOST}/auth/refresh`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('refreshToken'),
      },
    },
  )

  const payload = await response.json()

  if (response.status !== 201) {
    console.error('NO LUCK REFRESHING TOKENS', payload.message)
    return
  }

  localStorage.setItem('accessToken', payload.accessToken)
  localStorage.setItem('refreshToken', payload.refreshToken)
}
