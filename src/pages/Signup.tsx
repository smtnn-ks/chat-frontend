import { SubmitHandler, useForm } from 'react-hook-form'

type Input = {
  email: string
  password: string
  repeatPassword: string
}

export default function Signup() {
  const { handleSubmit, register } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = async ({
    email,
    password,
    repeatPassword,
  }) => {
    if (password !== repeatPassword) return alert('Passwords do not match')

    const response = await fetch('http://localhost:5000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const payload = await response.json()
    if (response.status !== 201) return alert(payload.message)
    else window.location.href = '/signin'
  }

  return (
    <div className="card bg-base-200 w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        <p className="label text-3xl text-accent font-semibold">Sign up</p>
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
        <input
          type="password"
          minLength={8}
          maxLength={30}
          required
          placeholder="Repeat password"
          className="input input-bordered"
          {...register('repeatPassword')}
        />
        <button type="submit" className="btn btn-primary mt-2">
          Submit
        </button>
        <a className="link" href="/signin">
          Sign in
        </a>
      </form>
    </div>
  )
}
