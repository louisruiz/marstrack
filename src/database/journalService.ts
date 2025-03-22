import db from './database';
import { JournalEntry, Position } from '../shared/models/Journal';

export const journalService = {
  // Récupérer toutes les entrées de journal
  getAll: (): JournalEntry[] => {
    const entries = db.prepare('SELECT * FROM journal_entries ORDER BY date DESC').all();
    
    // Convertir les champs JSON en objets
    return entries.map((entry: any) => ({
      ...entry,
      tradingSummary: entry.tradingSummary ? JSON.parse(entry.tradingSummary) : undefined,
      learnings: entry.learnings ? JSON.parse(entry.learnings) : [],
      completedTasks: entry.completedTasks ? JSON.parse(entry.completedTasks) : []
    }));
  },

  // Récupérer une entrée par date
  getByDate: (date: string): JournalEntry | undefined => {
    const entry = db.prepare('SELECT * FROM journal_entries WHERE date = ?').get(date);
    
    if (!entry) return undefined;
    
    // Convertir les champs JSON en objets
    return {
      ...entry,
      tradingSummary: entry.tradingSummary ? JSON.parse(entry.tradingSummary) : undefined,
      learnings: entry.learnings ? JSON.parse(entry.learnings) : [],
      completedTasks: entry.completedTasks ? JSON.parse(entry.completedTasks) : []
    };
  },

  // Récupérer les entrées sur une plage de dates
  getForRange: (startDate: string, endDate: string): JournalEntry[] => {
    const entries = db.prepare(
      'SELECT * FROM journal_entries WHERE date BETWEEN ? AND ? ORDER BY date'
    ).all(startDate, endDate);
    
    // Convertir les champs JSON en objets
    return entries.map((entry: any) => ({
      ...entry,
      tradingSummary: entry.tradingSummary ? JSON.parse(entry.tradingSummary) : undefined,
      learnings: entry.learnings ? JSON.parse(entry.learnings) : [],
      completedTasks: entry.completedTasks ? JSON.parse(entry.completedTasks) : []
    }));
  },

  // Créer une nouvelle entrée
  create: (entry: JournalEntry): number => {
    // Convertir les objets en JSON pour stockage
    const stmt = db.prepare(`
      INSERT INTO journal_entries (
        date, tradingSummary, reflection, learnings, 
        completedTasks, emotions, tomorrowPlan
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      entry.date,
      entry.tradingSummary ? JSON.stringify(entry.tradingSummary) : null,
      entry.reflection || null,
      entry.learnings ? JSON.stringify(entry.learnings) : null,
      entry.completedTasks ? JSON.stringify(entry.completedTasks) : null,
      entry.emotions || null,
      entry.tomorrowPlan || null
    );
    
    return result.lastInsertRowid as number;
  },

  // Mettre à jour une entrée existante
  update: (entry: JournalEntry): void => {
    // Convertir les objets en JSON pour stockage
    const stmt = db.prepare(`
      UPDATE journal_entries SET 
        tradingSummary = ?, 
        reflection = ?, 
        learnings = ?, 
        completedTasks = ?, 
        emotions = ?, 
        tomorrowPlan = ?
      WHERE date = ?
    `);
    
    stmt.run(
      entry.tradingSummary ? JSON.stringify(entry.tradingSummary) : null,
      entry.reflection || null,
      entry.learnings ? JSON.stringify(entry.learnings) : null,
      entry.completedTasks ? JSON.stringify(entry.completedTasks) : null,
      entry.emotions || null,
      entry.tomorrowPlan || null,
      entry.date
    );
  },

  // Supprimer une entrée par date
  deleteByDate: (date: string): void => {
    db.prepare('DELETE FROM journal_entries WHERE date = ?').run(date);
  },

  // Récupérer ou créer une entrée pour une date spécifique
  // Remplacer la méthode getOrCreate existante par celle-ci:
getOrCreate: async (date: string): Promise<JournalEntry> => {
  try {
    const existingEntry = await journalService.getByDate(date);
    
    if (existingEntry) {
      return existingEntry;
    }
    
    // Créer une nouvelle entrée avec template par défaut
    const newEntry: JournalEntry = {
      date,
      tradingSummary: { 
        positions: [],
        macroEvents: [],
        marketNotes: "Notes sur les conditions de marché d'aujourd'hui..."
      },
      reflection: "Réflexions sur la journée...",
      learnings: [],
      completedTasks: [],
      emotions: "Comment vous sentez-vous aujourd'hui?",
      tomorrowPlan: "Plan pour demain..."
    };
    
    const id = await journalService.create(newEntry);
    return { ...newEntry, id };
  } catch (error) {
    console.error('Erreur lors de la récupération/création de l\'entrée de journal:', error);
    throw error;
  }
},

// Ajouter ces nouvelles méthodes à la fin du service:
getRecentEntries: async (limit: number = 7): Promise<JournalEntry[]> => {
  try {
    const entries = db.prepare(`
      SELECT * FROM journal_entries 
      ORDER BY date DESC 
      LIMIT ?
    `).all(limit);
    
    return entries.map((entry: any) => ({
      ...entry,
      tradingSummary: entry.tradingSummary ? JSON.parse(entry.tradingSummary) : undefined,
      learnings: entry.learnings ? JSON.parse(entry.learnings) : [],
      completedTasks: entry.completedTasks ? JSON.parse(entry.completedTasks) : []
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées récentes:', error);
    throw error;
  }
},

analyzeEmotions: async (startDate: string, endDate: string): Promise<any> => {
  try {
    const entries = await journalService.getForRange(startDate, endDate);
    
    // Extraction des mots clés liés aux émotions
    const emotionKeywords = {
      positif: ['confiant', 'optimiste', 'satisfait', 'heureux', 'calme', 'concentré'],
      neutre: ['stable', 'normal', 'régulier', 'équilibré'],
      négatif: ['stressé', 'anxieux', 'frustré', 'déçu', 'inquiet', 'fatigué']
    };
    
    // Analyse simple des émotions par occurrence de mots-clés
    const analysis = entries.map(entry => {
      const emotions = entry.emotions?.toLowerCase() || '';
      
      let sentiment = 'neutre';
      let score = 0;
      
      // Analyse basique du sentiment
      for (const word of emotionKeywords.positif) {
        if (emotions.includes(word)) score += 1;
      }
      
      for (const word of emotionKeywords.négatif) {
        if (emotions.includes(word)) score -= 1;
      }
      
      if (score > 0) sentiment = 'positif';
      if (score < 0) sentiment = 'négatif';
      
      return {
        date: entry.date,
        sentiment,
        score,
        emotions: entry.emotions
      };
    });
    
    // Calcul des statistiques
    const stats = {
      positif: analysis.filter(a => a.sentiment === 'positif').length,
      neutre: analysis.filter(a => a.sentiment === 'neutre').length,
      négatif: analysis.filter(a => a.sentiment === 'négatif').length,
      total: analysis.length
    };
    
    return { analysis, stats };
  } catch (error) {
    console.error('Erreur lors de l\'analyse des émotions:', error);
    throw error;
  }
}
    
    // Créer une nouvelle entrée avec les valeurs par défaut
    const newEntry: JournalEntry = {
      date,
      tradingSummary: { positions: [] },
      learnings: [],
      completedTasks: []
    };
    
    const id = journalService.create(newEntry);
    return { ...newEntry, id };
  },

  // Extraire les mots-clés les plus fréquents dans les réflexions
  getCommonKeywords: (limit: number = 10): { word: string, count: number }[] => {
    const entries = journalService.getAll();
    
    // Extraire tous les textes de réflexion
    const allText = entries
      .map(entry => `${entry.reflection || ''} ${entry.emotions || ''}`)
      .join(' ');
    
    // Nettoyer le texte et extraire les mots
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Ignorer les mots courts
    
    // Compter les occurrences
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Convertir en tableau et trier par fréquence
    return Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};

export default journalService;