import React, { useState, useEffect } from 'react';
import { Habit } from '../shared/models/Habit';
import { habitService } from '../database/habitService';

// Composant pour afficher une statistique dans le tableau de bord
const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${color}`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// Composant pour afficher un graphique simplifié des tendances
const TrendGraph = ({ data, title }: { data: number[]; title: string }) => {
  const max = Math.max(...data, 1);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>
      <div className="flex items-end h-20 space-x-1">
        {data.map((value, index) => (
          <div 
            key={index} 
            className="bg-blue-500 rounded-t"
            style={{ 
              height: `${(value / max) * 100}%`, 
              width: `${100 / data.length - 1}%` 
            }}
          ></div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>-7j</span>
        <span>-6j</span>
        <span>-5j</span>
        <span>-4j</span>
        <span>-3j</span>
        <span>-2j</span>
        <span>-1j</span>
        <span>Auj</span>
      </div>
    </div>
  );
};

const HabitsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(today);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabit, setCurrentHabit] = useState<Habit>({
    date: currentDate,
    wakeUpAt7: 0,
    sleepAt12: 0,
    trading: 0,
    financeDocReading: 0,
    tradeAnalysis: 0,
    toolDevelopment: 0,
    study: 0,
    studyDetails: "",
    todoCompletion: 0,
    meditation: 0,
    sport: 0,
    checkCrypto: 0,
    backtest: 0,
    notes: "",
  });
  const [weeklyStats, setWeeklyStats] = useState<any>({
    tradingCount: 0,
    studyCount: 0,
    devCount: 0,
    meditationCount: 0,
    sportCount: 0,
    tradeAnalysisCount: 0
  });
  const [weeklyTrends, setWeeklyTrends] = useState<any>({
    trading: [0, 0, 0, 0, 0, 0, 0],
    study: [0, 0, 0, 0, 0, 0, 0],
    todoCompletion: [0, 0, 0, 0, 0, 0, 0]
  });
  
  // Charger les habitudes lors du montage du composant
  useEffect(() => {
    const loadHabits = async () => {
      try {
        // Dans une implémentation réelle, récupérez les données depuis la base de données
        // Pour l'instant, nous simulons avec des données fictives
        const pastWeek = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        const mockHabits: Habit[] = pastWeek.map((date, index) => ({
          id: index + 1,
          date,
          wakeUpAt7: Math.random() > 0.3 ? 1 : 0,
          sleepAt12: Math.random() > 0.4 ? 1 : 0,
          trading: Math.random() > 0.2 ? 1 : 0,
          financeDocReading: Math.random() > 0.5 ? 1 : 0,
          tradeAnalysis: Math.random() > 0.4 ? 1 : 0,
          toolDevelopment: Math.random() > 0.6 ? 1 : 0,
          study: Math.random() > 0.3 ? 1 : 0,
          studyDetails: Math.random() > 0.3 ? "Options pricing, cours Quantitative Finance" : "",
          todoCompletion: Math.random(),
          meditation: Math.random() > 0.5 ? 1 : 0,
          sport: Math.random() > 0.5 ? 1 : 0,
          checkCrypto: Math.random() > 0.3 ? 1 : 0,
          backtest: Math.random() > 0.7 ? 1 : 0,
          notes: Math.random() > 0.5 ? "Bonne journée productive" : ""
        }));
        
        // Ajouter l'habitude d'aujourd'hui (vide si nouvelle journée)
        const todayHabit = {
          id: 8,
          date: today,
          wakeUpAt7: 1,
          sleepAt12: 0,
          trading: 1,
          financeDocReading: 0,
          tradeAnalysis: 1,
          toolDevelopment: 0,
          study: 1,
          studyDetails: "Options pricing, cours Quantitative Finance",
          todoCompletion: 0.75,
          meditation: 0,
          sport: 1,
          checkCrypto: 1,
          backtest: 0,
          notes: "Bonne journée productive, manqué de temps pour dev les outils"
        };
        
        const allHabits = [...mockHabits, todayHabit];
        setHabits(allHabits);
        
        // Mettre à jour l'habitude courante avec celle d'aujourd'hui si elle existe
        const todayData = allHabits.find(h => h.date === currentDate);
        if (todayData) {
          setCurrentHabit(todayData);
        }
        
        // Calculer les statistiques hebdomadaires
        const calcWeeklyStats = {
          tradingCount: allHabits.filter(h => h.trading === 1).length,
          studyCount: allHabits.filter(h => h.study === 1).length,
          devCount: allHabits.filter(h => h.toolDevelopment === 1).length,
          meditationCount: allHabits.filter(h => h.meditation === 1).length,
          sportCount: allHabits.filter(h => h.sport === 1).length,
          tradeAnalysisCount: allHabits.filter(h => h.tradeAnalysis === 1).length
        };
        setWeeklyStats(calcWeeklyStats);
        
        // Préparer les données pour les tendances
        const calcWeeklyTrends = {
          trading: allHabits.map(h => h.trading),
          study: allHabits.map(h => h.study),
          todoCompletion: allHabits.map(h => h.todoCompletion * 100)
        };
        setWeeklyTrends(calcWeeklyTrends);
        
      } catch (error) {
        console.error("Erreur lors du chargement des habitudes:", error);
      }
    };
    
    loadHabits();
  }, [currentDate]);
  
  // Gérer le changement de date
  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };
  
  // Gérer le changement d'une habitude binaire (0/1)
  const toggleHabit = (habitKey: keyof Habit) => {
    setCurrentHabit(prev => ({
      ...prev,
      [habitKey]: prev[habitKey] === 1 ? 0 : 1
    }));
  };
  
  // Gérer le changement de texte
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Habit) => {
    setCurrentHabit(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  // Gérer le changement de valeur numérique
  const handleNumberChange = (e: React.ChangeEvent<HTMLSelectElement>, field: keyof Habit) => {
    setCurrentHabit(prev => ({
      ...prev,
      [field]: parseFloat(e.target.value)
    }));
  };
  
  // Sauvegarder les changements
  const handleSave = async () => {
    try {
      // Dans une implémentation réelle, sauvegardez dans la base de données
      console.log("Sauvegarde des habitudes:", currentHabit);
      
      // Mettre à jour la liste locale
      const updatedHabits = habits.map(h => 
        h.date === currentHabit.date ? currentHabit : h
      );
      
      if (!updatedHabits.some(h => h.date === currentHabit.date)) {
        updatedHabits.push(currentHabit);
      }
      
      setHabits(updatedHabits);
      
      // Afficher un message de succès (à implémenter)
      alert("Habitudes sauvegardées avec succès!");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des habitudes:", error);
      alert("Erreur lors de la sauvegarde des habitudes");
    }
  };
  
  // Navigation entre les jours
  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    handleDateChange(date.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const nextDate = date.toISOString().split('T')[0];
    // Ne pas permettre de naviguer au-delà d'aujourd'hui
    if (nextDate <= today) {
      handleDateChange(nextDate);
    }
  };
  
  const handleToday = () => {
    handleDateChange(today);
  };
  
  // Formatage de la date pour l'affichage
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tracking d'Habitudes</h1>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousDay}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            &lt;
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Aujourd'hui
          </button>
          <button 
            onClick={handleNextDay}
            className={`px-3 py-1 rounded ${currentDate === today ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            disabled={currentDate === today}
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold capitalize">{formatDate(currentDate)}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Trading cette semaine" value={`${weeklyStats.tradingCount}/7`} color="border-blue-500" />
        <StatCard title="Étude cette semaine" value={`${weeklyStats.studyCount}/7`} color="border-green-500" />
        <StatCard title="Méditation cette semaine" value={`${weeklyStats.meditationCount}/7`} color="border-purple-500" />
        <StatCard title="Sport cette semaine" value={`${weeklyStats.sportCount}/7`} color="border-red-500" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <TrendGraph data={weeklyTrends.trading} title="Trading (7 derniers jours)" />
        <TrendGraph data={weeklyTrends.study} title="Étude (7 derniers jours)" />
        <TrendGraph data={weeklyTrends.todoCompletion} title="Complétion des tâches % (7 derniers jours)" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* Routine quotidienne */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Routine quotidienne</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.wakeUpAt7 === 1}
                  onChange={() => toggleHabit('wakeUpAt7')}
                  className="mr-2 h-5 w-5"
                />
                <span>Réveil 7h</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.wakeUpAt7Count}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.sleepAt12 === 1}
                  onChange={() => toggleHabit('sleepAt12')}
                  className="mr-2 h-5 w-5"
                />
                <span>Coucher 00h</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.sleepAt12Count}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.meditation === 1}
                  onChange={() => toggleHabit('meditation')}
                  className="mr-2 h-5 w-5"
                />
                <span>Méditation</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.meditationCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.sport === 1}
                  onChange={() => toggleHabit('sport')}
                  className="mr-2 h-5 w-5"
                />
                <span>Sport</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.sportCount}/7
              </div>
            </div>
          </div>
        </div>
        
        {/* Trading & Analyse */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Trading & Analyse</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.trading === 1}
                  onChange={() => toggleHabit('trading')}
                  className="mr-2 h-5 w-5"
                />
                <span>Trading</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.tradingCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.financeDocReading === 1}
                  onChange={() => toggleHabit('financeDocReading')}
                  className="mr-2 h-5 w-5"
                />
                <span>Lecture Doc Finance</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.financeDocReadingCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.tradeAnalysis === 1}
                  onChange={() => toggleHabit('tradeAnalysis')}
                  className="mr-2 h-5 w-5"
                />
                <span>Analyse de Trade</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.tradeAnalysisCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.backtest === 1}
                  onChange={() => toggleHabit('backtest')}
                  className="mr-2 h-5 w-5"
                />
                <span>Backtest</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.backtestCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.checkCrypto === 1}
                  onChange={() => toggleHabit('checkCrypto')}
                  className="mr-2 h-5 w-5"
                />
                <span>Check Crypto</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.checkCryptoCount}/7
              </div>
            </div>
          </div>
        </div>
        
        {/* Développement & Étude */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Développement & Étude</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.toolDevelopment === 1}
                  onChange={() => toggleHabit('toolDevelopment')}
                  className="mr-2 h-5 w-5"
                />
                <span>Dev Outil</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.devCount}/7
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentHabit.study === 1}
                  onChange={() => toggleHabit('study')}
                  className="mr-2 h-5 w-5"
                />
                <span>Study</span>
              </label>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {weeklyStats.studyCount}/7
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Détails de l'étude:</label>
              <textarea 
                value={currentHabit.studyDetails || ''}
                onChange={(e) => handleTextChange(e, 'studyDetails')}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Complétion des tâches */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Complétion des tâches</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tâches complétées aujourd'hui:</label>
              <select 
                value={currentHabit.todoCompletion}
                onChange={(e) => handleNumberChange(e, 'todoCompletion')}
                className="w-full border rounded p-2"
              >
                <option value="0">0% - Aucune</option>
                <option value="0.25">25% - Quelques unes</option>
                <option value="0.5">50% - La moitié</option>
                <option value="0.75">75% - La plupart</option>
                <option value="1">100% - Toutes</option>
              </select>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${currentHabit.todoCompletion * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          
          <textarea 
            value={currentHabit.notes || ''}
            onChange={(e) => handleTextChange(e, 'notes')}
            className="w-full border rounded p-2"
            rows={5}
            placeholder="Notez vos réflexions sur la journée..."
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default HabitsPage;