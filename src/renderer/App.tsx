import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HabitsPage from './pages/HabitsPage';
import PlanningPage from './pages/PlanningPage';
import TodoPage from './pages/TodoPage';
import JournalPage from './pages/JournalPage';
import TradingPage from './pages/TradingPage';
import LearningPage from './pages/LearningPage';
import DevToolsPage from './pages/DevToolsPage';
import AnalysisPage from './pages/AnalysisPage';
import DashboardPage from './pages/DashboardPage';




const TradingPagePlaceholder = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-6">Trading</h1>
    <p className="text-gray-600">Cette section est en cours de développement.</p>
  </div>
);



const DevToolsPagePlaceholder = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-6">Dev Outils</h1>
    <p className="text-gray-600">Cette section est en cours de développement.</p>
  </div>
);

const AnalysisPagePlaceholder = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-6">Analyse</h1>
    <p className="text-gray-600">Cette section est en cours de développement.</p>
  </div>
);



const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64">
          <header className="bg-white shadow-sm">
            <div className="container mx-auto p-4">
              <h1 className="text-3xl font-bold text-gray-800">MarsTrack</h1>
            </div>
          </header>
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="/planning" element={<PlanningPage />} />
              <Route path="/trading" element={<TradingPagePlaceholder />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/dev-tools" element={<DevToolsPagePlaceholder />} />
              <Route path="/analysis" element={<AnalysisPagePlaceholder />} />
            </Routes>
          </main>
          <footer className="bg-white shadow-sm mt-4">
            <div className="container mx-auto p-4 text-center text-gray-600 text-sm">
              MarsTrack &copy; 2025 - Application de suivi et planification pour les traders
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;