import db from './database';
import { LearningResource, StudySession, StudyPlan, Quiz, ResourceStatus } from '../shared/models/Learning';

// Service pour les ressources d'apprentissage
export const resourceService = {
  // Récupérer toutes les ressources
  getAll: (): LearningResource[] => {
    const resources = db.prepare('SELECT * FROM learning_resources ORDER BY dateAdded DESC').all();
    
    // Convertir les champs JSON en objets
    return resources.map((resource: any) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      chapters: resource.chapters ? JSON.parse(resource.chapters) : []
    }));
  },
  
  // Récupérer par ID
  getById: (id: number): LearningResource | undefined => {
    const resource = db.prepare('SELECT * FROM learning_resources WHERE id = ?').get(id);
    
    if (!resource) return undefined;
    
    // Convertir les champs JSON en objets
    return {
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      chapters: resource.chapters ? JSON.parse(resource.chapters) : []
    };
  },
  
  // Créer une nouvelle ressource
  create: (resource: LearningResource): number => {
    const stmt = db.prepare(`
      INSERT INTO learning_resources (
        title, type, category, format, status, progress, priority,
        description, url, filePath, notes, dateAdded, lastStudyDate,
        totalStudyTime, tags, chapters
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      resource.title,
      resource.type,
      resource.category,
      resource.format,
      resource.status,
      resource.progress,
      resource.priority,
      resource.description || null,
      resource.url || null,
      resource.filePath || null,
      resource.notes || null,
      resource.dateAdded,
      resource.lastStudyDate || null,
      resource.totalStudyTime || 0,
      JSON.stringify(resource.tags || []),
      JSON.stringify(resource.chapters || [])
    );
    
    return result.lastInsertRowid as number;
  },
  
  // Mettre à jour une ressource
  update: (resource: LearningResource): void => {
    const stmt = db.prepare(`
      UPDATE learning_resources SET
        title = ?, type = ?, category = ?, format = ?, status = ?,
        progress = ?, priority = ?, description = ?, url = ?,
        filePath = ?, notes = ?, lastStudyDate = ?, totalStudyTime = ?,
        tags = ?, chapters = ?
      WHERE id = ?
    `);
    
    stmt.run(
      resource.title,
      resource.type,
      resource.category,
      resource.format,
      resource.status,
      resource.progress,
      resource.priority,
      resource.description || null,
      resource.url || null,
      resource.filePath || null,
      resource.notes || null,
      resource.lastStudyDate || null,
      resource.totalStudyTime || 0,
      JSON.stringify(resource.tags || []),
      JSON.stringify(resource.chapters || []),
      resource.id
    );
  },
  
  // Supprimer une ressource
  delete: (id: number): void => {
    db.prepare('DELETE FROM learning_resources WHERE id = ?').run(id);
  },
  
  // Filtrer par statut
  getByStatus: (status: ResourceStatus): LearningResource[] => {
    const resources = db.prepare('SELECT * FROM learning_resources WHERE status = ? ORDER BY priority').all(status);
    
    return resources.map((resource: any) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      chapters: resource.chapters ? JSON.parse(resource.chapters) : []
    }));
  },
  
  // Filtrer par catégorie
  getByCategory: (category: string): LearningResource[] => {
    const resources = db.prepare('SELECT * FROM learning_resources WHERE category = ? ORDER BY dateAdded DESC').all(category);
    
    return resources.map((resource: any) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      chapters: resource.chapters ? JSON.parse(resource.chapters) : []
    }));
  },
  
  // Recherche de ressources
  search: (query: string): LearningResource[] => {
    const resources = db.prepare(`
      SELECT * FROM learning_resources 
      WHERE title LIKE ? OR description LIKE ? OR notes LIKE ?
      ORDER BY dateAdded DESC
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    
    return resources.map((resource: any) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      chapters: resource.chapters ? JSON.parse(resource.chapters) : []
    }));
  },
  
  // Mettre à jour le progrès d'une ressource
  updateProgress: (id: number, progress: number): void => {
    db.prepare('UPDATE learning_resources SET progress = ? WHERE id = ?').run(progress, id);
    
    // Si le progrès est à 100%, mettre le statut à "completed"
    if (progress >= 100) {
      db.prepare('UPDATE learning_resources SET status = ? WHERE id = ?').run('completed', id);
    } else if (progress > 0) {
      // Si le progrès est supérieur à 0, mettre le statut à "in_progress"
      db.prepare('UPDATE learning_resources SET status = ? WHERE id = ?').run('in_progress', id);
    }
  }
};

// Service pour les sessions d'étude
export const studySessionService = {
  // Récupérer toutes les sessions
  getAll: (): StudySession[] => {
    return db.prepare('SELECT * FROM study_sessions ORDER BY date DESC').all();
  },
  
  // Récupérer par ID de ressource
  getByResourceId: (resourceId: number): StudySession[] => {
    return db.prepare('SELECT * FROM study_sessions WHERE resourceId = ? ORDER BY date DESC').all(resourceId);
  },
  
  // Créer une nouvelle session
  create: (session: StudySession): number => {
    const stmt = db.prepare(`
      INSERT INTO study_sessions (
        resourceId, date, duration, notes, chapterId, rating
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      session.resourceId,
      session.date,
      session.duration,
      session.notes || null,
      session.chapterId || null,
      session.rating || null
    );
    
    // Mettre à jour la date de dernière étude et le temps total d'étude pour la ressource
    const resource = resourceService.getById(session.resourceId);
    if (resource) {
      const totalTime = (resource.totalStudyTime || 0) + session.duration;
      db.prepare(`
        UPDATE learning_resources 
        SET lastStudyDate = ?, totalStudyTime = ?
        WHERE id = ?
      `).run(session.date, totalTime, session.resourceId);
    }
    
    return result.lastInsertRowid as number;
  },
  
  // Mettre à jour une session
  update: (session: StudySession): void => {
    // Récupérer l'ancienne session pour calculer la différence de durée
    const oldSession = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(session.id);
    const durationDiff = session.duration - oldSession.duration;
    
    const stmt = db.prepare(`
      UPDATE study_sessions SET
        resourceId = ?, date = ?, duration = ?, notes = ?,
        chapterId = ?, rating = ?
      WHERE id = ?
    `);
    
    stmt.run(
      session.resourceId,
      session.date,
      session.duration,
      session.notes || null,
      session.chapterId || null,
      session.rating || null,
      session.id
    );
    
    // Mettre à jour le temps total d'étude pour la ressource
    if (durationDiff !== 0) {
      const resource = resourceService.getById(session.resourceId);
      if (resource) {
        const totalTime = (resource.totalStudyTime || 0) + durationDiff;
        db.prepare('UPDATE learning_resources SET totalStudyTime = ? WHERE id = ?')
          .run(totalTime, session.resourceId);
      }
    }
  },
  
  // Supprimer une session
  delete: (id: number): void => {
    // Récupérer la session pour ajuster le temps total d'étude
    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(id);
    
    db.prepare('DELETE FROM study_sessions WHERE id = ?').run(id);
    
    // Mettre à jour le temps total d'étude pour la ressource
    const resource = resourceService.getById(session.resourceId);
    if (resource) {
      const totalTime = Math.max(0, (resource.totalStudyTime || 0) - session.duration);
      db.prepare('UPDATE learning_resources SET totalStudyTime = ? WHERE id = ?')
        .run(totalTime, session.resourceId);
    }
  },
  
  // Obtenir des statistiques d'étude sur une période
  getStatsForPeriod: (startDate: string, endDate: string): any => {
    const sessions = db.prepare(`
      SELECT 
        SUM(duration) as totalMinutes, 
        COUNT(*) as sessionCount,
        AVG(rating) as avgRating
      FROM study_sessions 
      WHERE date BETWEEN ? AND ?
    `).get(startDate, endDate);
    
    const resourceStats = db.prepare(`
      SELECT 
        r.title, 
        SUM(s.duration) as totalMinutes
      FROM study_sessions s
      JOIN learning_resources r ON s.resourceId = r.id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY r.id
      ORDER BY totalMinutes DESC
    `).all(startDate, endDate);
    
    return {
      totalMinutes: sessions.totalMinutes || 0,
      sessionCount: sessions.sessionCount || 0,
      avgRating: sessions.avgRating || 0,
      resourceStats
    };
  }
};

// Service pour les plans d'étude
export const studyPlanService = {
  // Récupérer tous les plans
  getAll: (): StudyPlan[] => {
    const plans = db.prepare('SELECT * FROM study_plans ORDER BY priority').all();
    
    // Convertir les IDs de ressources JSON en tableau
    return plans.map((plan: any) => ({
      ...plan,
      resources: plan.resources ? JSON.parse(plan.resources) : []
    }));
  },
  
  // Récupérer par ID
  getById: (id: number): StudyPlan | undefined => {
    const plan = db.prepare('SELECT * FROM study_plans WHERE id = ?').get(id);
    
    if (!plan) return undefined;
    
    // Convertir les IDs de ressources JSON en tableau
    return {
      ...plan,
      resources: plan.resources ? JSON.parse(plan.resources) : []
    };
  },
  
  // Créer un nouveau plan
  create: (plan: StudyPlan): number => {
    const stmt = db.prepare(`
      INSERT INTO study_plans (
        title, description, resources, estimatedCompletionDate,
        createdAt, priority
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      plan.title,
      plan.description || null,
      JSON.stringify(plan.resources || []),
      plan.estimatedCompletionDate || null,
      plan.createdAt,
      plan.priority
    );
    
    return result.lastInsertRowid as number;
  },
  
  // Mettre à jour un plan
  update: (plan: StudyPlan): void => {
    const stmt = db.prepare(`
      UPDATE study_plans SET
        title = ?, description = ?, resources = ?,
        estimatedCompletionDate = ?, priority = ?
      WHERE id = ?
    `);
    
    stmt.run(
      plan.title,
      plan.description || null,
      JSON.stringify(plan.resources || []),
      plan.estimatedCompletionDate || null,
      plan.priority,
      plan.id
    );
  },
  
  // Supprimer un plan
  delete: (id: number): void => {
    db.prepare('DELETE FROM study_plans WHERE id = ?').run(id);
  }
};

// Service pour les quiz
export const quizService = {
  // Récupérer tous les quiz
  getAll: (): Quiz[] => {
    const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY createdAt DESC').all();
    
    // Convertir les questions JSON en objets
    return quizzes.map((quiz: any) => ({
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : []
    }));
  },
  
  // Récupérer par ID
  getById: (id: number): Quiz | undefined => {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    
    if (!quiz) return undefined;
    
    // Convertir les questions JSON en objets
    return {
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : []
    };
  },
  
  // Récupérer par ID de ressource
  getByResourceId: (resourceId: number): Quiz[] => {
    const quizzes = db.prepare('SELECT * FROM quizzes WHERE resourceId = ? ORDER BY createdAt DESC').all(resourceId);
    
    // Convertir les questions JSON en objets
    return quizzes.map((quiz: any) => ({
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : []
    }));
  },
  
  // Créer un nouveau quiz
  create: (quiz: Quiz): number => {
    const stmt = db.prepare(`
      INSERT INTO quizzes (
        resourceId, title, questions, createdAt, lastAttempt, bestScore
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      quiz.resourceId,
      quiz.title,
      JSON.stringify(quiz.questions),
      quiz.createdAt,
      quiz.lastAttempt || null,
      quiz.bestScore || null
    );
    
    return result.lastInsertRowid as number;
  },
  
  // Mettre à jour un quiz
  update: (quiz: Quiz): void => {
    const stmt = db.prepare(`
      UPDATE quizzes SET
        resourceId = ?, title = ?, questions = ?,
        lastAttempt = ?, bestScore = ?
      WHERE id = ?
    `);
    
    stmt.run(
      quiz.resourceId,
      quiz.title,
      JSON.stringify(quiz.questions),
      quiz.lastAttempt || null,
      quiz.bestScore || null,
      quiz.id
    );
  },
  
  // Supprimer un quiz
  delete: (id: number): void => {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
  },
  
  // Mettre à jour les résultats d'une tentative
  updateAttempt: (id: number, score: number): void => {
    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer le quiz pour vérifier le meilleur score
    const quiz = quizService.getById(id);
    if (quiz) {
      const bestScore = Math.max(score, quiz.bestScore || 0);
      
      db.prepare(`
        UPDATE quizzes SET
          lastAttempt = ?, bestScore = ?
        WHERE id = ?
      `).run(today, bestScore, id);
    }
  }
};

// Exporter tous les services
export default {
  resourceService,
  studySessionService,
  studyPlanService,
  quizService
};