import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1><Link to="/"><img src={logo} alt="DogTrainr logo" className="app-logo" />DogTrainr</Link></h1>
        <nav>
          <Link to="/">Dogs</Link> | <Link to="/trainings">Trainings</Link> | <Link to="/plans">Plans</Link>
        </nav>
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
      </div>
    </BrowserRouter>
  )
}

export default App
