import { io } from 'socket.io-client'

export const socket = io(`http://${import.meta.env.VITE_BACK_HOST}:5001`, {
  query: {
    id: localStorage.getItem('userid'),
  },
})
