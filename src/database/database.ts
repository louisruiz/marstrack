import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const getUserDataPath = () => {
  return app ? app.getPath('userData') : './';
};

const dbPath = path.join(getUserDataPath(), 'marstrack.db');
const db = new Database(dbPath);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

// Habitudes
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    wakeUpAt7 INTEGER NOT NULL DEFAULT 0,
    sleepAt12 INTEGER NOT NULL DEFAULT 0,
    trading INTEGER NOT NULL DEFAULT 0,
    financeDocReading INTEGER NOT NULL DEFAULT 0,
    tradeAnalysis INTEGER NOT NULL DEFAULT 0,
    toolDevelopment INTEGER NOT NULL DEFAULT 0,
    study INTEGER NOT NULL DEFAULT 0,
    studyDetails TEXT,
    todoCompletion REAL NOT NULL DEFAULT 0,
    meditation INTEGER NOT NULL DEFAULT 0,
    sport INTEGER NOT NULL DEFAULT 0,
    checkCrypto INTEGER NOT NULL DEFAULT 0,
    backtest INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    tradingQuality INTEGER,
    tradingDuration INTEGER,
    studyQuality INTEGER,
    studyDuration INTEGER,
    UNIQUE(date)
  )
`);

// Catégories de tâches
db.exec(`
  CREATE TABLE IF NOT EXISTS task_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT
  )
`);

// Tâches
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3,
    estimatedDuration INTEGER,
    completed INTEGER NOT NULL DEFAULT 0,
    tags TEXT,
    dueDate TEXT,
    FOREIGN KEY (categoryId) REFERENCES task_categories(id) ON DELETE CASCADE
  )
`);

// Complétion des tâches
db.exec(`
  CREATE TABLE IF NOT EXISTS task_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    duration INTEGER,
    notes TEXT,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

// Journal
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    tradingSummary TEXT,
    reflection TEXT,
    learnings TEXT,
    completedTasks TEXT,
    emotions TEXT,
    tomorrowPlan TEXT
  )
`);

// Planning journalier
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    notes TEXT
  )
`);

// Blocs de temps
db.exec(`
  CREATE TABLE IF NOT EXISTS time_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dateId INTEGER NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    categoryId INTEGER,
    taskIds TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (dateId) REFERENCES daily_plans(id) ON DELETE CASCADE
  )
`);

// Événements économiques
db.exec(`
  CREATE TABLE IF NOT EXISTS economic_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dateId INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    importance TEXT NOT NULL,
    forecast TEXT,
    previous TEXT,
    actual TEXT,
    notes TEXT,
    FOREIGN KEY (dateId) REFERENCES daily_plans(id) ON DELETE CASCADE
  )
`);

// Création de la table des plans journaliers
db.run(`CREATE TABLE IF NOT EXISTS daily_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  notes TEXT
)`);

// Création de la table des blocs de temps
db.run(`CREATE TABLE IF NOT EXISTS time_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dailyPlanId INTEGER NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  categoryId INTEGER,
  taskIds TEXT,
  completed BOOLEAN DEFAULT 0,
  FOREIGN KEY (dailyPlanId) REFERENCES daily_plans (id),
  FOREIGN KEY (categoryId) REFERENCES task_categories (id)
)`);

// Création de la table des événements économiques
db.run(`CREATE TABLE IF NOT EXISTS economic_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dailyPlanId INTEGER NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  importance TEXT NOT NULL,
  forecast TEXT,
  previous TEXT,
  actual TEXT,
  notes TEXT,
  FOREIGN KEY (dailyPlanId) REFERENCES daily_plans (id)
)`);

// Tables pour le module d'apprentissage
db.exec(`
  CREATE TABLE IF NOT EXISTS learning_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 3,
    description TEXT,
    url TEXT,
    filePath TEXT,
    notes TEXT,
    dateAdded TEXT NOT NULL,
    lastStudyDate TEXT,
    totalStudyTime INTEGER DEFAULT 0,
    tags TEXT,
    chapters TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resourceId INTEGER NOT NULL,
    date TEXT NOT NULL,
    duration INTEGER NOT NULL,
    notes TEXT,
    chapterId INTEGER,
    rating INTEGER,
    FOREIGN KEY (resourceId) REFERENCES learning_resources(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS study_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    resources TEXT,
    estimatedCompletionDate TEXT,
    createdAt TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resourceId INTEGER NOT NULL,
    title TEXT NOT NULL,
    questions TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    lastAttempt TEXT,
    bestScore INTEGER,
    FOREIGN KEY (resourceId) REFERENCES learning_resources(id) ON DELETE CASCADE
  )
`);

export default db;