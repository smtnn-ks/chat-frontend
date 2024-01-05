import { Dispatch, SetStateAction } from 'react'
import { UserInfoChatList } from '../types'

// TODO: Highlight the current user
type Props = {
  users: UserInfoChatList[]
  setCurrentUser: Dispatch<SetStateAction<UserInfoChatList | null>>
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>
}

export default function ChatList({ users, setCurrentUser, setUsers }: Props) {
  function onClick(user: UserInfoChatList) {
    const userId = user.userInfo.id
    const newUser = users.find((usr) => usr.userInfo.id === userId)
    const usersWithoutOneToUpdate = users.filter(
      (usr) => usr.userInfo.id !== userId,
    )
    if (!newUser)
      throw new Error(`Somehow user ${userId} is not in a user list`)
    newUser.unreadMessagesCount = 0
    setUsers([...usersWithoutOneToUpdate, newUser])

    setCurrentUser(user)
  }

  return (
    <>
      <ul
        className="menu bg-base-300 rounded-l-box h-[36rem] w-[12rem] 
        overflow-y-auto"
      >
        {users.map((user) => (
          <li key={user.userInfo.id} onClick={() => onClick(user)}>
            <div className="flex items-center justify-between">
              <div>{user.userInfo.nickname}</div>
              {user.unreadMessagesCount > 0 && (
                <div className="badge badge-accent">
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
