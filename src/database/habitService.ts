import db from './database';
import { Habit } from '../shared/models/Habit';

export const habitService = {
  // Récupérer toutes les habitudes
  getAll: (): Habit[] => {
    return db.prepare('SELECT * FROM habits ORDER BY date DESC').all();
  },

  // Récupérer une habitude par date
  getByDate: (date: string): Habit | undefined => {
    return db.prepare('SELECT * FROM habits WHERE date = ?').get(date);
  },

  // Récupérer les habitudes sur une plage de dates
  getForRange: (startDate: string, endDate: string): Habit[] => {
    return db.prepare('SELECT * FROM habits WHERE date BETWEEN ? AND ? ORDER BY date').all(startDate, endDate);
  },

  // Créer une nouvelle habitude
  create: (habit: Habit): number => {
    const stmt = db.prepare(`
      INSERT INTO habits (
        date, wakeUpAt7, sleepAt12, trading, financeDocReading, 
        tradeAnalysis, toolDevelopment, study, studyDetails, 
        todoCompletion, meditation, sport, checkCrypto, backtest, 
        notes, tradingQuality, tradingDuration, studyQuality, studyDuration
      ) VALUES (
        @date, @wakeUpAt7, @sleepAt12, @trading, @financeDocReading, 
        @tradeAnalysis, @toolDevelopment, @study, @studyDetails, 
        @todoCompletion, @meditation, @sport, @checkCrypto, @backtest, 
        @notes, @tradingQuality, @tradingDuration, @studyQuality, @studyDuration
      )
    `);
    
    const result = stmt.run(habit);
    return result.lastInsertRowid as number;
  },

  // Mettre à jour une habitude existante
  update: (habit: Habit): void => {
    const stmt = db.prepare(`
      UPDATE habits SET 
        wakeUpAt7 = @wakeUpAt7, 
        sleepAt12 = @sleepAt12, 
        trading = @trading, 
        financeDocReading = @financeDocReading, 
        tradeAnalysis = @tradeAnalysis, 
        toolDevelopment = @toolDevelopment, 
        study = @study, 
        studyDetails = @studyDetails, 
        todoCompletion = @todoCompletion, 
        meditation = @meditation, 
        sport = @sport, 
        checkCrypto = @checkCrypto, 
        backtest = @backtest, 
        notes = @notes,
        tradingQuality = @tradingQuality,
        tradingDuration = @tradingDuration,
        studyQuality = @studyQuality,
        studyDuration = @studyDuration
      WHERE date = @date
    `);
    
    stmt.run(habit);
  },

  // Supprimer une habitude par date
  deleteByDate: (date: string): void => {
    db.prepare('DELETE FROM habits WHERE date = ?').run(date);
  },

  // Récupérer ou créer une habitude pour une date spécifique
  getOrCreate: (date: string): Habit => {
    const existingHabit = habitService.getByDate(date);
    
    if (existingHabit) {
      return existingHabit;
    }
    
    // Créer une nouvelle habitude avec les valeurs par défaut
    const newHabit: Habit = {
      date,
      wakeUpAt7: 0,
      sleepAt12: 0,
      trading: 0,
      financeDocReading: 0,
      tradeAnalysis: 0,
      toolDevelopment: 0,
      study: 0,
      todoCompletion: 0,
      meditation: 0,
      sport: 0,
      checkCrypto: 0,
      backtest: 0
    };
    
    const id = habitService.create(newHabit);
    return { ...newHabit, id };
  },

  // Statistiques
  getWeeklyStats: (): Habit[] => {
    // Obtenir la date d'il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    // Obtenir la date d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    
    return habitService.getForRange(sevenDaysAgoStr, today);
  },

  getMonthlyStats: (): Habit[] => {
    // Obtenir la date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Obtenir la date d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    
    return habitService.getForRange(thirtyDaysAgoStr, today);
  },

  // Calculer les statistiques de tendance
  calculateTrends: (habits: Habit[]): any => {
    if (!habits || habits.length === 0) return {};

    // Trier les habitudes par date
    const sortedHabits = [...habits].sort((a, b) => a.date.localeCompare(b.date));

    // Calculer les tendances pour chaque type d'habitude
    const trends = {
      trading: sortedHabits.map(h => h.trading),
      study: sortedHabits.map(h => h.study),
      toolDevelopment: sortedHabits.map(h => h.toolDevelopment),
      meditation: sortedHabits.map(h => h.meditation),
      sport: sortedHabits.map(h => h.sport),
      todoCompletion: sortedHabits.map(h => h.todoCompletion)
    };

    // Calculer les comptes d'activités
    const counts = {
      tradingCount: sortedHabits.filter(h => h.trading === 1).length,
      studyCount: sortedHabits.filter(h => h.study === 1).length,
      devCount: sortedHabits.filter(h => h.toolDevelopment === 1).length,
      meditationCount: sortedHabits.filter(h => h.meditation === 1).length,
      sportCount: sortedHabits.filter(h => h.sport === 1).length,
      wakeUpAt7Count: sortedHabits.filter(h => h.wakeUpAt7 === 1).length,
      sleepAt12Count: sortedHabits.filter(h => h.sleepAt12 === 1).length,
      financeDocReadingCount: sortedHabits.filter(h => h.financeDocReading === 1).length,
      tradeAnalysisCount: sortedHabits.filter(h => h.tradeAnalysis === 1).length,
      backtestCount: sortedHabits.filter(h => h.backtest === 1).length,
      checkCryptoCount: sortedHabits.filter(h => h.checkCrypto === 1).length
    };

    // Calculer la moyenne de complétion des tâches
    const avgTodoCompletion = sortedHabits.reduce((sum, h) => sum + h.todoCompletion, 0) / sortedHabits.length;

    return {
      trends,
      counts,
      avgTodoCompletion
    };
  },

  // Import de données depuis le fichier CSV
  importFromCSV: async (csvData: string): Promise<number> => {
    try {
      // Ici, vous utiliseriez une bibliothèque comme papaparse pour parser le CSV
      // et convertir les données en objets Habit
      // Pour l'exemple, nous renvoyons simplement un nombre fictif
      
      return 42; // Nombre d'enregistrements importés
    } catch (error) {
      console.error("Erreur lors de l'importation CSV:", error);
      throw new Error("Échec de l'importation");
    }
  }
};

export default habitService;