import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import DogList from './DogList'
import DogForm from './DogForm'
import DogProfile from './DogProfile'
import TrainingList from './TrainingList'
import TrainingForm from './TrainingForm'
import TrainingDetail from './TrainingDetail'
import TrainingEdit from './TrainingEdit'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>DogTrainr</h1>
        <nav>
          <Link to="/">Dogs</Link> | <Link to="/trainings">Trainings</Link>
        </nav>
        <Routes>
          <Route path="/" element={<DogList />} />
          <Route path="/dogs/new" element={<DogForm />} />
          <Route path="/dogs/:id" element={<DogProfile />} />
          <Route path="/trainings" element={<TrainingList />} />
          <Route path="/trainings/new" element={<TrainingForm />} />
          <Route path="/trainings/:id" element={<TrainingDetail />} />
          <Route path="/trainings/:id/edit" element={<TrainingEdit />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
