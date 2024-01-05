import { SubmitHandler, useForm } from 'react-hook-form'
import { encryptMessage, putMessage } from '../utils'
import { socket } from '../socket/socket'
import { Dispatch, SetStateAction } from 'react'
import { IncomingMessage, Message } from '../types'
import { nanoid } from 'nanoid'

type Input = {
  data: string
}

type Props = {
  userId: string
  currentUserId: string
  publicKey: CryptoKey
  setMessages: Dispatch<SetStateAction<Message[]>>
}

export default function ChatInput({
  userId,
  currentUserId,
  publicKey,
  setMessages,
}: Props) {
  const { register, handleSubmit, reset } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = (input) => {
    if (input.data) {
      const trimmedData = input.data.trim()
      if (trimmedData.length > 200) {
        alert(
          'Does not support messages longer than 200 characters for now. Sorry',
        )
        return
      }
      const message: IncomingMessage = {
        from: userId,
        time: Date.now(),
        content: trimmedData,
      }
      const messageToSafe = {
        id: nanoid(),
        from: userId,
        with: currentUserId,
        time: Date.now(),
        content: trimmedData,
      }
      const content = JSON.stringify(message)
      putMessage(messageToSafe)
      setMessages((current) => [...current, messageToSafe])
      encryptMessage(content, publicKey).then((enc) => {
        socket.emit('createMessage', { userId: currentUserId, ...enc })
      })
      reset()
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="py-2 flex flex-row justify-between"
      >
        <input
          type="text"
          className="input input-bordered w-full mr-2"
          {...register('data')}
        />
        <button type="submit" className="btn btn-accent">
          Send
        </button>
      </form>
    </>
  )
}
