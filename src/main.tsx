import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signin from './pages/Signin.tsx'
import Signup from './pages/Signup.tsx'
import NoSupport from './pages/NoSupport.tsx'
import Bug from './pages/Bug.tsx'
import App from './pages/App.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/no-support',
    element: <NoSupport />,
  },
  {
    path: '/bug',
    element: <Bug />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
