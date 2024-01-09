import { io } from 'socket.io-client'

export const socket = io(`https://${import.meta.env.VITE_WS_HOST}`, {
  query: {
    id: localStorage.getItem('userid'),
  },
  secure: true,
})
