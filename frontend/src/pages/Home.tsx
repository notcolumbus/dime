import Header from '../components/Header'
import { MdEdit } from 'react-icons/md'

export default function Home() {
  return (
    <div className="w-full">
      <Header title="dashboard" />

      {/* expenses tracker section */}
      <div className="mt-10">
        <h2 className="text-2xl text-white opacity-60 text-left">expense tracker</h2>
      </div>
    </div>
  )
}
