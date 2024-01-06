export async function refreshTokens() {
  const response = await fetch(
    `http://${import.meta.env.VITE_BACK_HOST}:5000/auth/refresh`,
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
