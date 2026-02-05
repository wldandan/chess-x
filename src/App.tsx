import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TrainingPage from './pages/TrainingPage'
import AnalysisPage from './pages/AnalysisPage'
import SettingsPage from './pages/SettingsPage'
import ChessDemoPage from './pages/ChessDemoPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/chess-demo" element={<ChessDemoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App