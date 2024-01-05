export default function NoSupport() {
  return (
    <div className="card bg-base-200 w-96">
      <div className="card-body">
        <h1 className="text-3xl font-semibold text-accent mb-2">
          Your browser is incampatible
        </h1>
        <p>Please use another browser for this service</p>
        <a className="link" href="https://caniuse.com/indexeddb">
          List of compatible browsers
        </a>
      </div>
    </div>
  )
}
