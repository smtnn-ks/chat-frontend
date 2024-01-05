import { Message } from '../types'

type Props = {
  message: Message
  userId: string
}

export default function MessageBox({ message, userId }: Props) {
  return (
    <div>
      <div
        className={`chat ${
          message.from === userId ? 'chat-end' : 'chat-start'
        }`}
      >
        <div className="chat-bubble">{message.content}</div>
        <div className="chat-footer text-xs">
          {new Date(message.time).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
