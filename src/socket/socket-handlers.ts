import {
  MessageHandler,
  fetchUserInfo,
  processUserInfoInput,
  putMessage,
  putUser,
} from '../utils'
import {
  Message,
  SignedMessagePayload,
  UserInfoChatList,
  UserInfoInput,
} from '../types'
import { Dispatch, SetStateAction } from 'react'
import { nanoid } from 'nanoid'

export async function onMessageHandler(
  payload: SignedMessagePayload,
  messageHandler: MessageHandler | undefined,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  currentUser: UserInfoChatList | null,
  users: UserInfoChatList[],
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>,
) {
  if (messageHandler) {
    const result = await messageHandler.decrypt(payload)
    const message: Message = {
      id: nanoid(),
      with: result.from,
      ...result,
    }
    putMessage(message)
    if (currentUser && message.with === currentUser.userInfo.id) {
      setMessages((current) => [...current, message])
    } else {
      const senderIndex = users.findIndex(
        (usr) => (usr.userInfo.id = message.with),
      )
      if (senderIndex === -1) {
        const newUserInfoInput = await fetchUserInfo(message.from)
        if (newUserInfoInput) {
          const newUserInfo = await processUserInfoInput(newUserInfoInput)
          putUser(newUserInfo)
          // TODO: Check if this 'isOnline' handling is correct
          setUsers((current) => [
            ...current,
            { userInfo: newUserInfo, unreadMessagesCount: 1, isOnline: false },
          ])
        } else {
          throw new Error('Got message from unknown user')
        }
      } else {
        users[senderIndex].unreadMessagesCount += 1
        setUsers(users)
      }
    }
  } else {
    console.warn('messageHandler is not specified')
  }
}

export async function onPendingHandler(
  pendingMessages: SignedMessagePayload[],
  messageHandler: MessageHandler | undefined,
  users: UserInfoChatList[],
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>,
) {
  if (!messageHandler) throw new Error('messageHandler is not specified')

  const promises = pendingMessages.map((pend) => messageHandler.decrypt(pend))
  const incomingMessages = await Promise.all(promises)
  const messages: Message[] = incomingMessages.map((inc) => ({
    id: nanoid(),
    with: inc.from,
    ...inc,
  }))

  putMessage(messages)

  const incomingUserIds = messages.map((mes) => mes.from)
  const existingUserIds = users.map((usr) => usr.userInfo.id)
  const newUserIds = incomingUserIds.filter(
    (inc) => !existingUserIds.includes(inc),
  )
  const newUsersInfoInputOrNull = await Promise.all(
    newUserIds.map((id) => fetchUserInfo(id)),
  )
  // @ts-expect-error It filters Null values out yet TS does not get it
  const newUsersInfoInput: UserInfoInput[] = newUsersInfoInputOrNull.map(
    (usr) => usr,
  )
  const newUsersInfo = await Promise.all(
    newUsersInfoInput.map((usr) => processUserInfoInput(usr)),
  )

  putUser(newUsersInfo)

  const usersWithNew = [...users.map((usr) => usr.userInfo), ...newUsersInfo]
  const messageRecord: Record<string, number> = {}
  messages.forEach((mes) => {
    if (messageRecord[mes.with]) {
      messageRecord[mes.with] += 1
    } else {
      messageRecord[mes.with] = 1
    }
  })

  // TODO: Handle 'isOnline' there
  const userInfoChatList: UserInfoChatList[] = usersWithNew.map((usr) => ({
    userInfo: usr,
    unreadMessagesCount: messageRecord[usr.id],
    isOnline: false,
  }))

  setUsers(userInfoChatList)
}

export async function onOnlineListHandler(
  payload: string[],
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>,
) {
  console.log('onOnlineListHandler payload:', payload)
  setUsers((users) =>
    users.map((usr) => ({
      ...usr,
      isOnline: payload.includes(usr.userInfo.id),
    })),
  )
}
