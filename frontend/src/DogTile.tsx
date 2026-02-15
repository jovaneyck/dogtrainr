import { Link } from 'react-router-dom'

interface Dog {
  id: string
  name: string
  picture: string
}

type DogTileProps = { dog: Dog } & (
  | { to: string; onClick?: never }
  | { onClick: () => void; to?: never }
)

const tileClassName = "bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"

function DogTileContent({ dog }: { dog: Dog }) {
  return (
    <>
      <div className="flex items-center gap-3">
        {dog.picture && (
          <img
            src={`/uploads/dogs/${dog.picture}`}
            alt={dog.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <span className="text-base text-slate-800 font-medium">{dog.name}</span>
      </div>
      <span className="text-slate-400 text-lg">›</span>
    </>
  )
}

function DogTile(props: DogTileProps) {
  if (props.to) {
    return (
      <Link to={props.to} className={tileClassName}>
        <DogTileContent dog={props.dog} />
      </Link>
    )
  }

  return (
    <button onClick={props.onClick} className={tileClassName + " w-full"}>
      <DogTileContent dog={props.dog} />
    </button>
  )
}

export default DogTile
