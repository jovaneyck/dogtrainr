import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import logo from './assets/logo.png'
import DogList from './DogList'
import DogForm from './DogForm'
import DogProfile from './DogProfile'
import TrainingList from './TrainingList'
import TrainingForm from './TrainingForm'
import TrainingDetail from './TrainingDetail'
import TrainingEdit from './TrainingEdit'
import PlanList from './PlanList'
import PlanForm from './PlanForm'
import PlanDetail from './PlanDetail'
import PlanEdit from './PlanEdit'

function NavBar() {
  const location = useLocation()
  const path = location.pathname

  const isActive = (prefix: string) => {
    if (prefix === '/') return path === '/' || path.startsWith('/dogs')
    return path.startsWith(prefix)
  }

  const tabs = [
    { to: '/', label: 'Dogs', prefix: '/', icon: '🐕' },
    { to: '/trainings', label: 'Trainings', prefix: '/trainings', icon: '🎯' },
    { to: '/plans', label: 'Plans', prefix: '/plans', icon: '📋' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
              isActive(tab.prefix)
                ? 'text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white shadow-sm z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src={logo} alt="DogTrainr logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-slate-800">DogTrainr</span>
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          <Routes>
            <Route path="/" element={<DogList />} />
            <Route path="/dogs/new" element={<DogForm />} />
            <Route path="/dogs/:id" element={<DogProfile />} />
            <Route path="/trainings" element={<TrainingList />} />
            <Route path="/trainings/new" element={<TrainingForm />} />
            <Route path="/trainings/:id" element={<TrainingDetail />} />
            <Route path="/trainings/:id/edit" element={<TrainingEdit />} />
            <Route path="/plans" element={<PlanList />} />
            <Route path="/plans/new" element={<PlanForm />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
            <Route path="/plans/:id/edit" element={<PlanEdit />} />
          </Routes>
        </main>

        <NavBar />
      </div>
    </BrowserRouter>
  )
}

export default App
