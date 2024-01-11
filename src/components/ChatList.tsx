import { Dispatch, SetStateAction } from 'react'
import { UserInfoChatList } from '../types'

// TODO: Highlight the current user
type Props = {
  users: UserInfoChatList[]
  currentUser: UserInfoChatList | null
  setCurrentUser: Dispatch<SetStateAction<UserInfoChatList | null>>
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>
}

export default function ChatList({
  users,
  currentUser,
  setCurrentUser,
  setUsers,
}: Props) {
  function onClick(user: UserInfoChatList) {
    const newUserIndex = users.indexOf(user)

    if (newUserIndex === -1)
      throw new Error(`Somehow user ${user.userInfo.id} is not in a user list`)

    users[newUserIndex].unreadMessagesCount = 0
    setUsers(users)
    setCurrentUser(user)
  }

  return (
    <>
      <ul
        className="menu bg-base-300 rounded-l-box h-full w-[12rem] 
        overflow-y-auto"
      >
        {users.map((user) => (
          <li key={user.userInfo.id} onClick={() => onClick(user)}>
            <div
              className={
                'grid grid-cols-9 mb-1 ' +
                (user === currentUser ? 'bg-base-100' : 'bg-base-300')
              }
            >
              <div
                className={`text-xl col-span-1 ${
                  user.isOnline ? 'text-accent' : 'text-blue-900'
                }`}
              >
                •
              </div>
              <div className="col-span-6">{user.userInfo.nickname}</div>
              {user.unreadMessagesCount > 0 && (
                <div className="badge badge-accent col-span-2">
                  {user.unreadMessagesCount}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
