import { SubmitHandler, useForm } from 'react-hook-form'
import { importPrivateKey, onSignin } from '../utils'

type Input = {
  email: string
  password: string
}

export default function Signin() {
  const { handleSubmit, register } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = async (data) => {
    const response = await fetch(
      `https://${import.meta.env.VITE_BACK_HOST}/auth/signin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    )

    const payload = await response.json()
    if (response.status !== 201) return alert(payload.message)

    importPrivateKey(payload.privateKey)
      .then((privateKey) => {
        if (!('indexedDB' in window)) {
          self.window.location.href = '/no-support'
          return
        }

        return onSignin(payload.user.id, privateKey)
      })
      .then(() => {
        localStorage.setItem('accessToken', payload.tokens.accessToken)
        localStorage.setItem('refreshToken', payload.tokens.refreshToken)
        localStorage.setItem('userid', payload.user.id)
        localStorage.setItem('usernickname', payload.user.nickname)

        window.location.href = '/'
      })
  }

  return (
    <div className="card bg-base-200 w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        <p className="label text-3xl text-accent font-semibold">Sign in</p>
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered"
          {...register('email')}
        />
        <input
          type="password"
          minLength={8}
          maxLength={30}
          required
          placeholder="Password"
          className="input input-bordered"
          {...register('password')}
        />
        <button type="submit" className="btn btn-primary mt-2">
          Submit
        </button>
        <a className="link" href="/signup">
          Sign up
        </a>
      </form>
    </div>
  )
}
