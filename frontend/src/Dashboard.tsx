import './App.css'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'

function Dashboard() {
  return (
    <div className="min-h-screen text-gray-900" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      <Home />
      <div style={{ marginLeft: '85px', marginTop: '75px', padding: '24px' }}>
        {/* Main content goes here */}
      </div>
    </div>
  )
}

export default Dashboard
