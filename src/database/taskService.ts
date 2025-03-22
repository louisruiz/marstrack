import { db } from './database';
import { Task, TaskCategory, TaskCompletion, TaskPriority, TaskType } from '../shared/models/Task';

// Service pour gérer les catégories de tâches
export const taskCategoryService = {
  // Récupérer toutes les catégories
  getAll: async (): Promise<TaskCategory[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM task_categories ORDER BY name', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as TaskCategory[]);
        }
      });
    });
  },

  // Récupérer une catégorie par ID
  getById: async (id: number): Promise<TaskCategory | null> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM task_categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as TaskCategory || null);
        }
      });
    });
  },

  // Créer une nouvelle catégorie
  create: async (category: TaskCategory): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO task_categories (name, description, color) VALUES (?, ?, ?)',
        [category.name, category.description || '', category.color || '#808080'],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Mettre à jour une catégorie
  update: async (category: TaskCategory): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE task_categories SET name = ?, description = ?, color = ? WHERE id = ?',
        [category.name, category.description || '', category.color || '#808080', category.id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  },

  // Supprimer une catégorie
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM task_categories WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

// Service pour gérer les tâches
export const taskService = {
  // Récupérer toutes les tâches
  getAll: async (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks ORDER BY priority', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convertir les champs tags de JSON à tableau
          const tasks = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(tasks as Task[]);
        }
      });
    });
  },

  // Récupérer les tâches par catégorie
  getByCategory: async (categoryId: number): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE categoryId = ? ORDER BY priority', [categoryId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convertir les champs tags de JSON à tableau
          const tasks = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(tasks as Task[]);
        }
      });
    });
  },

  // Récupérer une tâche par ID
  getById: async (id: number): Promise<Task | null> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Convertir les champs tags de JSON à tableau
            const task = {
              ...row,
              tags: row.tags ? JSON.parse(row.tags) : []
            };
            resolve(task as Task);
          } else {
            resolve(null);
          }
        }
      });
    });
  },

  // Créer une nouvelle tâche
  create: async (task: Task): Promise<number> => {
    return new Promise((resolve, reject) => {
      // Convertir le tableau de tags en JSON
      const tagsJson = task.tags ? JSON.stringify(task.tags) : null;
      
      db.run(
        'INSERT INTO tasks (categoryId, title, description, type, priority, estimatedDuration, completed, tags, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          task.categoryId,
          task.title,
          task.description || '',
          task.type,
          task.priority,
          task.estimatedDuration || null,
          task.completed || false,
          tagsJson,
          task.dueDate || null
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Mettre à jour une tâche
  update: async (task: Task): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Convertir le tableau de tags en JSON
      const tagsJson = task.tags ? JSON.stringify(task.tags) : null;
      
      db.run(
        'UPDATE tasks SET categoryId = ?, title = ?, description = ?, type = ?, priority = ?, estimatedDuration = ?, completed = ?, tags = ?, dueDate = ? WHERE id = ?',
        [
          task.categoryId,
          task.title,
          task.description || '',
          task.type,
          task.priority,
          task.estimatedDuration || null,
          task.completed || false,
          tagsJson,
          task.dueDate || null,
          task.id
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  },

  // Mettre à jour le statut de complétion d'une tâche
  updateCompletionStatus: async (id: number, completed: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Supprimer une tâche
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Récupérer les tâches par type
  getByType: async (type: TaskType): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE type = ? ORDER BY priority', [type], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convertir les champs tags de JSON à tableau
          const tasks = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(tasks as Task[]);
        }
      });
    });
  },

  // Récupérer les tâches par priorité
  getByPriority: async (priority: TaskPriority): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE priority = ? ORDER BY title', [priority], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convertir les champs tags de JSON à tableau
          const tasks = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(tasks as Task[]);
        }
      });
    });
  }
};

// Service pour gérer les complétions de tâches
export const taskCompletionService = {
  // Récupérer toutes les complétions
  getAll: async (): Promise<TaskCompletion[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM task_completions ORDER BY date DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as TaskCompletion[]);
        }
      });
    });
  },

  // Récupérer les complétions par tâche
  getByTask: async (taskId: number): Promise<TaskCompletion[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM task_completions WHERE taskId = ? ORDER BY date DESC', [taskId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as TaskCompletion[]);
        }
      });
    });
  },

  // Récupérer les complétions pour une date spécifique
  getByDate: async (date: string): Promise<TaskCompletion[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM task_completions WHERE date = ?', [date], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as TaskCompletion[]);
        }
      });
    });
  },

  // Créer une nouvelle complétion
  create: async (completion: TaskCompletion): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO task_completions (taskId, date, completed, duration, notes) VALUES (?, ?, ?, ?, ?)',
        [
          completion.taskId,
          completion.date,
          completion.completed,
          completion.duration || null,
          completion.notes || ''
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Mettre à jour une complétion
  update: async (completion: TaskCompletion): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE task_completions SET taskId = ?, date = ?, completed = ?, duration = ?, notes = ? WHERE id = ?',
        [
          completion.taskId,
          completion.date,
          completion.completed,
          completion.duration || null,
          completion.notes || '',
          completion.id
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  },

  // Supprimer une complétion
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM task_completions WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Obtenir des statistiques de complétion pour un intervalle de dates
  getCompletionStats: async (startDate: string, endDate: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          t.categoryId, 
          COUNT(*) as totalTasks, 
          SUM(CASE WHEN tc.completed = 1 THEN 1 ELSE 0 END) as completedTasks,
          SUM(tc.duration) as totalDuration
        FROM task_completions tc
        JOIN tasks t ON tc.taskId = t.id
        WHERE tc.date BETWEEN ? AND ?
        GROUP BY t.categoryId`,
        [startDate, endDate],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
};