import { Dispatch, SetStateAction, useEffect } from 'react'
import { Message, UserInfoChatList } from '../types'
import { getMessages } from '../utils'
import MessageBox from './MessageBox'
import ScrollToBottom from 'react-scroll-to-bottom'

type Props = {
  userId: string
  currentUser: UserInfoChatList | null
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
}

export default function ChatBox({
  userId,
  currentUser,
  messages,
  setMessages,
}: Props) {
  useEffect(() => {
    if (currentUser !== null) {
      getMessages(currentUser.userInfo.id).then((result) => {
        setMessages(result)
      })
    }
  }, [currentUser, setMessages])

  return (
    <ScrollToBottom className="h-full overflow-y-auto">
      {currentUser !== null ? (
        messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBox message={msg} userId={userId} key={msg.id} />
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            Start a chat with {currentUser.userInfo.nickname}
          </div>
        )
      ) : (
        <div className="h-full flex items-center justify-center">
          Choose a chat or find user with the form on the nav
        </div>
      )}
    </ScrollToBottom>
  )
}
