import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NewHomePage from './pages/NewHomePage'
import ChessDemoPage from './pages/ChessDemoPage'
import AnalysisPage from './pages/AnalysisPage'
import TrainingPage from './pages/TrainingPage'
import { TrainingSetupPage } from './pages/TrainingSetupPage'
import AITrainingPage from './pages/AITrainingPage'
import TrainingReportPage from './pages/TrainingReportPage'
import StrategyTrainingPage from './pages/StrategyTrainingPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<NewHomePage />} />
          <Route path="/demo" element={<ChessDemoPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/training-setup" element={<TrainingSetupPage />} />
          <Route path="/ai-training" element={<AITrainingPage />} />
          <Route path="/ai-training/report" element={<TrainingReportPage trainingProgress={null} />} />
          <Route path="/strategy-training" element={<StrategyTrainingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
