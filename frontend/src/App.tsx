import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import DogList from './DogList'
import DogForm from './DogForm'
import DogProfile from './DogProfile'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>DogTrainr</h1>
        <Routes>
          <Route path="/" element={<DogList />} />
          <Route path="/dogs/new" element={<DogForm />} />
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
