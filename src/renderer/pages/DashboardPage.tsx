import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Dans un environnement réel, importez ces services
// import { habitService } from '../../database/habitService';
// import { journalService } from '../../database/journalService';
// import { taskService } from '../../database/taskService';

const StatCard = ({ title, value, icon, color, link }: { 
  title: string; 
  value: string | number; 
  icon: string;
  color: string;
  link: string;
}) => (
  <Link to={link} className={`bg-white rounded-lg shadow p-5 border-l-4 ${color} hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-3xl opacity-70">{icon}</div>
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    habitStreak: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    hasJournalToday: false,
    pendingEvents: 0,
    studyHours: 0
  });
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simuler un chargement de données
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dans un environnement réel, chargez les données des services
        // par exemple: const habits = await habitService.getWeeklyStats();
        
        // Pour la démo, définissons des statistiques fictives
        setStats({
          habitStreak: 5,
          tasksCompleted: 8,
          tasksTotal: 12,
          hasJournalToday: true,
          pendingEvents: 3,
          studyHours: 12
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Obtenir le jour de la semaine
  const getDayOfWeek = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  };
  
  // Formater la date
  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">{getDayOfWeek()}, {formatDate()}</p>
      </div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Streak d'habitudes" 
          value={`${stats.habitStreak} jours`} 
          icon="🔥" 
          color="border-orange-500" 
          link="/habits"
        />
        <StatCard 
          title="Tâches complétées" 
          value={`${stats.tasksCompleted}/${stats.tasksTotal}`} 
          icon="✓" 
          color="border-green-500" 
          link="/todo"
        />
        <StatCard 
          title="Journal du jour" 
          value={stats.hasJournalToday ? "Complété" : "À faire"} 
          icon="📝" 
          color={stats.hasJournalToday ? "border-green-500" : "border-red-500"} 
          link="/journal"
        />
        <StatCard 
          title="Événements à venir" 
          value={stats.pendingEvents} 
          icon="📅" 
          color="border-blue-500" 
          link="/planning"
        />
        <StatCard 
          title="Heures d'étude (semaine)" 
          value={`${stats.studyHours}h`} 
          icon="📚" 
          color="border-purple-500" 
          link="/learning"
        />
        <StatCard 
          title="Performances Trading" 
          value="Voir détails" 
          icon="📈" 
          color="border-yellow-500" 
          link="/trading"
        />
      </div>
      
      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/habits" className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center hover:bg-blue-200 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Tracking du jour</div>
          </Link>
          <Link to="/journal" className="bg-green-100 text-green-700 p-4 rounded-lg text-center hover:bg-green-200 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Journal</div>
          </Link>
          <Link to="/todo" className="bg-purple-100 text-purple-700 p-4 rounded-lg text-center hover:bg-purple-200 transition-colors">
            <div className="text-2xl mb-2">✓</div>
            <div className="font-medium">Tâches</div>
          </Link>
          <Link to="/planning" className="bg-orange-100 text-orange-700 p-4 rounded-lg text-center hover:bg-orange-200 transition-colors">
            <div className="text-2xl mb-2">🗓️</div>
            <div className="font-medium">Planning</div>
          </Link>
        </div>
      </div>
      
      {/* Aperçu du jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Événements du jour</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-red-600 font-medium">
              <div className="w-16 text-sm">14:30</div>
              <div>CPI Release</div>
            </li>
            <li className="flex items-center">
              <div className="w-16 text-sm">16:00</div>
              <div>Analyse d'impact CPI</div>
            </li>
            <li className="flex items-center">
              <div className="w-16 text-sm">17:00</div>
              <div>Lecture "The Art of Quantitative Finance"</div>
            </li>
          </ul>
          <div className="mt-4 text-right">
            <Link to="/planning" className="text-blue-500 hover:underline">Voir tout</Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tâches prioritaires</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <input type="checkbox" className="mr-3" checked />
              <span className="line-through">Check CPI Release</span>
            </li>
            <li className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span>Dev programme bloombit</span>
            </li>
            <li className="flex items-center">
              <input type="checkbox" className="mr-3" checked />
              <span className="line-through">Étude options pricing</span>
            </li>
          </ul>
          <div className="mt-4 text-right">
            <Link to="/todo" className="text-blue-500 hover:underline">Voir tout</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;