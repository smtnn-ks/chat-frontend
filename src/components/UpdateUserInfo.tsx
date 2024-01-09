import { useForm, SubmitHandler } from 'react-hook-form'

type Props = {
  userId: string
  nickname: string
  setNickname: (_: string) => void
}

type Input = {
  nickname: string
}

export default function UpdateUserInfo({
  userId,
  nickname,
  setNickname,
}: Props) {
  const { register, handleSubmit } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = async (input) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_HOST}/users/` + userId,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    )

    const payload = await response.json()

    if (response.status !== 200) {
      console.error(payload.message)
      return
    } else {
      localStorage.setItem('usernickname', payload.nickname)
      setNickname(payload.nickname)
    }

    // @ts-expect-error :: TS does not have type for that case
    document.getElementById('uui_modal').close()
  }

  return (
    <>
      <button
        className="btn"
        // @ts-expect-error :: TS does not have type for that case
        onClick={() => document.getElementById('uui_modal')?.showModal()}
      >
        {nickname ? nickname : 'NICKNAME IS NOT PROVIDED'}
      </button>
      <dialog id="uui_modal" className="modal">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="modal-box text-center"
        >
          <p className="text-3xl mb-4 text-accent font-semibold">
            Change your profile
          </p>
          <p className="mb-2 text-base-content">
            Your nickname now is:{' '}
            <b>
              <i>{nickname}</i>
            </b>
          </p>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register('nickname')}
            placeholder="New profile name..."
            required
            minLength={2}
            maxLength={50}
          />
          <button type="submit" className="btn btn-accent mt-4 w-36">
            Change
          </button>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
