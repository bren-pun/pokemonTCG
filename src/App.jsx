import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { CardPoolProvider } from './components/CardPoolProvider'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import History from './pages/History'
import Battle from './pages/Battle'

export default function App() {
  return (
    <CardPoolProvider>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/history" element={<History />} />
            <Route path="/battle" element={<Battle />} />
          </Routes>
        </main>
      </div>
    </CardPoolProvider>
  )
}
