export async function refreshTokens() {
  const response = await fetch('http://localhost:5000/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('refreshToken'),
    },
  })

  const payload = await response.json()

  if (response.status !== 201) {
    console.error('NO LUCK REFRESHING TOKENS', payload.message)
    return
  }

  localStorage.setItem('accessToken', payload.accessToken)
  localStorage.setItem('refreshToken', payload.refreshToken)

  console.log('TOKENS REFRESHED')
}
