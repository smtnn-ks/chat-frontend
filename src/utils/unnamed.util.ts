import { Dispatch, SetStateAction } from 'react'
import { fetchUserInfo, importPublicKey, putUser } from '.'
import { UserInfo, UserInfoChatList, UserInfoInput } from '../types'

export async function addUserToChatList(
  userId: string,
  users: UserInfoChatList[],
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>,
) {
  const userInfoInput = await fetchUserInfo(userId)
  if (userInfoInput === null) {
    console.error('userInfoInput is null')
    return
  }
  const isUserInList = users.find((usr) => usr.userInfo.id === userId)
  if (isUserInList !== undefined) {
    // TODO: Jump to chat with that user
    return alert('This user is in the list already')
  }
  const publicKey = await importPublicKey(userInfoInput.publicKey)
  const userInfo = {
    id: userInfoInput.id,
    nickname: userInfoInput.nickname,
    publicKey,
  }
  const userInfoChatList: UserInfoChatList = {
    userInfo,
    unreadMessagesCount: 0,
  }
  setUsers((current) => [...current, userInfoChatList])

  putUser(userInfo)
}

export async function processUserInfoInput({
  id,
  nickname,
  publicKey,
}: UserInfoInput): Promise<UserInfo> {
  const cryptoKey = await importPublicKey(publicKey)
  return { id, nickname, publicKey: cryptoKey }
}
