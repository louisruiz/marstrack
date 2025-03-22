import db from './database';
import { DailyPlan, TimeBlock, EconomicEvent, ImportanceLevel } from '../shared/models/Planning';

// Service pour gérer les plans journaliers
export const dailyPlanService = {
  // Récupérer tous les plans
  getAll: (): DailyPlan[] => {
    return db.prepare('SELECT * FROM daily_plans ORDER BY date DESC').all();
  },

  // Récupérer un plan par date
  getByDate: (date: string): DailyPlan | undefined => {
    return db.prepare('SELECT * FROM daily_plans WHERE date = ?').get(date);
  },

  // Créer un nouveau plan
  create: (plan: DailyPlan): number => {
    const stmt = db.prepare('INSERT INTO daily_plans (date, notes) VALUES (?, ?)');
    const result = stmt.run(plan.date, plan.notes || '');
    return result.lastInsertRowid as number;
  },

  // Mettre à jour un plan
  update: (plan: DailyPlan): void => {
    const stmt = db.prepare('UPDATE daily_plans SET notes = ? WHERE id = ?');
    stmt.run(plan.notes || '', plan.id);
  },

  // Supprimer un plan
  delete: (id: number): void => {
    db.prepare('DELETE FROM daily_plans WHERE id = ?').run(id);
  },

  // Récupérer ou créer un plan pour une date spécifique
  getOrCreate: (date: string): DailyPlan => {
    const existingPlan = dailyPlanService.getByDate(date);
    
    if (existingPlan) {
      return existingPlan;
    }
    
    const id = dailyPlanService.create({ date, notes: '' } as DailyPlan);
    return { id, date, notes: '' } as DailyPlan;
  }
};

// Service pour gérer les blocs de temps
export const timeBlockService = {
  // Récupérer tous les blocs pour un plan
  getByPlanId: (planId: number): TimeBlock[] => {
    const rows = db.prepare('SELECT * FROM time_blocks WHERE dateId = ? ORDER BY startTime').all(planId);
    
    // Convertir les taskIds JSON en tableau
    return rows.map((row: any) => ({
      ...row,
      taskIds: row.taskIds ? JSON.parse(row.taskIds) : []
    }));
  },

  // Récupérer tous les blocs pour une date
  getByDate: (date: string): TimeBlock[] => {
    const plan = dailyPlanService.getByDate(date);
    if (!plan) {
      return [];
    }
    return timeBlockService.getByPlanId(plan.id!);
  },

  // Créer un nouveau bloc
  create: (block: TimeBlock): number => {
    // Convertir le tableau de taskIds en JSON
    const taskIdsJson = block.taskIds ? JSON.stringify(block.taskIds) : null;
    
    const stmt = db.prepare(`
      INSERT INTO time_blocks (
        dateId, startTime, endTime, title, description, 
        categoryId, taskIds, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      block.dateId,
      block.startTime,
      block.endTime,
      block.title,
      block.description || '',
      block.categoryId || null,
      taskIdsJson,
      block.completed ? 1 : 0
    );
    
    return result.lastInsertRowid as number;
  },

  // Mettre à jour un bloc
  update: (block: TimeBlock): void => {
    // Convertir le tableau de taskIds en JSON
    const taskIdsJson = block.taskIds ? JSON.stringify(block.taskIds) : null;
    
    const stmt = db.prepare(`
      UPDATE time_blocks SET 
        startTime = ?, 
        endTime = ?, 
        title = ?, 
        description = ?, 
        categoryId = ?, 
        taskIds = ?, 
        completed = ? 
      WHERE id = ?
    `);
    
    stmt.run(
      block.startTime,
      block.endTime,
      block.title,
      block.description || '',
      block.categoryId || null,
      taskIdsJson,
      block.completed ? 1 : 0,
      block.id
    );
  },

  // Mettre à jour le statut de complétion
  updateCompletionStatus: (id: number, completed: boolean): void => {
    const stmt = db.prepare('UPDATE time_blocks SET completed = ? WHERE id = ?');
    stmt.run(completed ? 1 : 0, id);
  },

  // Supprimer un bloc
  delete: (id: number): void => {
    db.prepare('DELETE FROM time_blocks WHERE id = ?').run(id);
  }
};

// Service pour gérer les événements économiques
export const economicEventService = {
  // Récupérer tous les événements pour un plan
  getByPlanId: (planId: number): EconomicEvent[] => {
    return db.prepare('SELECT * FROM economic_events WHERE dateId = ? ORDER BY time').all(planId);
  },

  // Récupérer tous les événements pour une date
  getByDate: (date: string): EconomicEvent[] => {
    const plan = dailyPlanService.getByDate(date);
    if (!plan) {
      return [];
    }
    return economicEventService.getByPlanId(plan.id!);
  },

  // Créer un nouvel événement
  create: (event: EconomicEvent): number => {
    const stmt = db.prepare(`
      INSERT INTO economic_events (
        dateId, time, title, importance, 
        forecast, previous, actual, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      event.dateId,
      event.time,
      event.title,
      event.importance,
      event.forecast || '',
      event.previous || '',
      event.actual || '',
      event.notes || ''
    );
    
    return result.lastInsertRowid as number;
  },

  // Mettre à jour un événement
  update: (event: EconomicEvent): void => {
    const stmt = db.prepare(`
      UPDATE economic_events SET 
        time = ?, 
        title = ?, 
        importance = ?, 
        forecast = ?, 
        previous = ?, 
        actual = ?, 
        notes = ? 
      WHERE id = ?
    `);
    
    stmt.run(
      event.time,
      event.title,
      event.importance,
      event.forecast || '',
      event.previous || '',
      event.actual || '',
      event.notes || '',
      event.id
    );
  },

  // Supprimer un événement
  delete: (id: number): void => {
    db.prepare('DELETE FROM economic_events WHERE id = ?').run(id);
  }
};

export default {
  dailyPlanService,
  timeBlockService,
  economicEventService
};