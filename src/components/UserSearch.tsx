import { Dispatch, SetStateAction, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { UserInfoChatList, UserShortInfo } from '../types'
import { addUserToChatList } from '../utils'

type Input = {
  input: string
}

type Props = {
  users: UserInfoChatList[]
  setUsers: Dispatch<SetStateAction<UserInfoChatList[]>>
}

export default function UserSearch({ users, setUsers }: Props) {
  const [searchUserInfo, setSearchUserInfo] = useState<UserShortInfo[]>([])
  const [isSearchUserInfoReady, setIsSearchUserInfoReady] =
    useState<boolean>(false)

  const { register, handleSubmit } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = async ({ input }) => {
    const inputTrimmed = input.trim()
    if (inputTrimmed) {
      setIsSearchUserInfoReady(false)
      const response = await fetch(
        `http://${import.meta.env.VITE_BACK_HOST}:5000/users?` +
          new URLSearchParams({ input: inputTrimmed }),
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        },
      )
      const payload = await response.json()

      if (response.status !== 200) {
        alert(payload.message)
        return
      }

      setSearchUserInfo(payload)
      setIsSearchUserInfoReady(true)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mr-4 ">
      <input
        type="text"
        {...register('input')}
        className="input input-bordered mr-2"
      />
      <div className="inline dropdown">
        <button type="submit" className="btn" tabIndex={0} role="button">
          Search
        </button>
        <ul
          tabIndex={0}
          className={`bg-neutral menu absolute mt-4 z-10 w-[16.5rem] rounded-box
          dropdown-content overflow-y-auto max-h-64 shadow ${
            isSearchUserInfoReady ? 'items-start' : 'items-center'
          }`}
        >
          {isSearchUserInfoReady ? (
            searchUserInfo.map((info) => (
              <li
                className="w-full"
                key={info.id}
                onClick={() => addUserToChatList(info.id, users, setUsers)}
              >
                <div className="w-full text-base font-medium">
                  {info.nickname}
                </div>
              </li>
            ))
          ) : (
            <p className="loading loading-spinner"></p>
          )}
        </ul>
      </div>
    </form>
  )
}
