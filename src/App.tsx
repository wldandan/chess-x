import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChessDemoPage from './pages/ChessDemoPage'
import AnalysisPage from './pages/AnalysisPage'
import TrainingPage from './pages/TrainingPage'
import { TrainingSetupPage } from './pages/TrainingSetupPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<ChessDemoPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/training-setup" element={<TrainingSetupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
