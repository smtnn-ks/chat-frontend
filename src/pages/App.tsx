import { useEffect, useRef, useState } from 'react'
import ChatBox from '../components/ChatBox'
import ChatInput from '../components/ChatInput'
import ChatList from '../components/ChatList'
import UpdateUserInfo from '../components/UpdateUserInfo'
import UserSearch from '../components/UserSearch'
import { onMessageHandler, onPendingHandler } from '../socket'
import { socket } from '../socket/socket'
import { Message, UserInfoChatList } from '../types'
import { SignedMessagePayload } from '../types/message-payload.type'
import {
  MessageHandler,
  fetchUsers,
  getMessageHandlerInstance,
  getMessages,
  refreshTokens,
} from '../utils/'

// TODO: ChatBox is not responsive to view height
// TODO: No behavior on user nickname change

function App() {
  const userId = (() => {
    const id = window.localStorage.getItem('userid')
    if (id === null) return (window.location.href = '/signin')
    else return id
  })()

  const [userNickname, setUserNickname] = useState<string>(
    localStorage.getItem('usernickname') as string,
  )
  const [users, setUsers] = useState<UserInfoChatList[]>([])
  const [currentUser, setCurrentUser] = useState<UserInfoChatList | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const timer = useRef<number | null>(null)
  const messageHandler = useRef<MessageHandler>()

  useEffect(() => {
    fetchUsers().then((result) => {
      setUsers(
        result.map(
          (res) =>
            ({ userInfo: res, unreadMessagesCount: 0 }) as UserInfoChatList,
        ),
      )
    })
  }, [])

  useEffect(() => {
    const timeout = 1000 * 60 * 9 // every nine minutes
    refreshTokens().catch(() => (window.location.href = '/signin'))
    timer.current = window.setInterval(refreshTokens, timeout)

    getMessageHandlerInstance(userId).then((handler) => {
      messageHandler.current = handler
    })

    // TODO: This is too many args
    socket.on('message', (payload: SignedMessagePayload) =>
      onMessageHandler(
        payload,
        messageHandler.current,
        setMessages,
        currentUser,
        users,
        setUsers,
      ),
    )

    socket.on('pending', (payload: SignedMessagePayload[]) =>
      onPendingHandler(payload, messageHandler.current, users, setUsers),
    )

    return () => {
      if (timer.current !== null) clearInterval(timer.current)
      socket.off('message')
      socket.off('pending')
    }
  }, [currentUser, userId, users])

  useEffect(() => {
    if (currentUser) {
      getMessages(currentUser.userInfo.id).then((result) => setMessages(result))
    } else {
      setMessages([])
    }
  }, [currentUser])

  return (
    <>
      <nav
        className="absolute top-0 left-0 w-screen h-16 bg-neutral flex 
      justify-between items-center"
      >
        <div className="ml-2">
          <UpdateUserInfo
            userId={userId}
            nickname={userNickname}
            setNickname={setUserNickname}
          />
        </div>
        <UserSearch users={users} setUsers={setUsers} />
      </nav>
      <div
        className="absolute bottom-0 left-0 w-screen h-[calc(100vh-4rem)] 
      flex items-center justify-center"
      >
        <ChatList
          users={users}
          setCurrentUser={setCurrentUser}
          setUsers={setUsers}
        />
        <div
          className="w-[30rem] menu bg-base-200 h-[36rem] rounded-r-box flex
        flex-row items-center justify-center text-base-content"
        >
          <div className="w-full h-[calc(100%-4rem)]">
            <ChatBox
              userId={userId}
              currentUser={currentUser}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
          <div className="w-full h-16">
            {currentUser ? (
              <ChatInput
                userId={userId}
                currentUserId={currentUser.userInfo.id}
                publicKey={currentUser.userInfo.publicKey}
                setMessages={setMessages}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
