import { UserInfoInput } from '../types'

export async function fetchUserInfo(
  userId: string,
): Promise<UserInfoInput | null> {
  const response = await fetch(
    `https://${import.meta.env.VITE_BACK_HOST}/users/` + userId,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
    },
  )

  const payload = await response.json()

  if (response.status !== 200) {
    console.error(payload)
    return null
  }

  return payload as UserInfoInput
}
