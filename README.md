# marstrack
Application de suivi et planification pour traders


# MarsTrack - Documentation du Projet (v3)

## Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Architecture technique](#architecture-technique)
- [Structure des dossiers](#structure-des-dossiers)
- [Modèles de données](#modèles-de-données)
- [Services de base de données](#services-de-base-de-données)
- [Pages implémentées](#pages-implémentées)
- [Composants](#composants)
- [Fonctionnalités terminées](#fonctionnalités-terminées)
- [Fonctionnalités en cours](#fonctionnalités-en-cours)
- [Prochaines étapes](#prochaines-étapes)

## Vue d'ensemble

MarsTrack est une application de bureau développée avec Electron et React qui unifie le suivi des habitudes de trading, la gestion des tâches, la planification du temps, la journalisation quotidienne et l'optimisation de l'apprentissage dans une interface cohérente.

L'application vise à remplacer un système existant basé sur Excel et des fichiers texte avec une solution interactive, visuelle et efficace, spécialement conçue pour les traders.

## Architecture technique

- **Front-end** : React + TypeScript + TailwindCSS
- **Desktop** : Electron.js
- **Base de données** : SQLite (locale)
- **Gestion d'état** : React Hooks et Context API
- **Visualisations** : Charting libraries (en cours d'implémentation)

## Structure des dossiers

```
src/
├── renderer/              # Interface utilisateur React
│   ├── components/        # Composants réutilisables
│   │   ├── planning/      # Composants pour la section Planning
│   │   ├── tasks/         # Composants pour la section Todo
│   │   └── Sidebar.tsx    # Barre latérale de navigation
│   ├── pages/             # Pages principales de l'application
│   │   ├── DashboardPage.tsx
│   │   ├── HabitsPage.tsx
│   │   ├── JournalPage.tsx
│   │   ├── LearningPage.tsx
│   │   ├── PlanningPage.tsx
│   │   └── TodoPage.tsx
│   ├── App.tsx            # Composant principal
│   ├── index.css          # Styles globaux
│   └── index.tsx          # Point d'entrée React
├── shared/                # Code partagé
│   └── models/            # Interfaces TypeScript
│       ├── Habit.ts       # Modèle pour les habitudes
│       ├── Journal.ts     # Modèle pour le journal
│       ├── Learning.ts    # Modèle pour l'apprentissage
│       ├── Planning.ts    # Modèle pour la planification
│       └── Task.ts        # Modèle pour les tâches
├── database/              # Services de base de données
│   ├── database.ts        # Configuration SQLite
│   ├── habitService.ts    # Service pour les habitudes
│   ├── journalService.ts  # Service pour le journal
│   ├── learningService.ts # Service pour l'apprentissage
│   ├── planningService.ts # Service pour la planification
│   └── taskService.ts     # Service pour les tâches
└── main/                  # Processus principal Electron
    └── index.ts           # Configuration Electron
```

## Modèles de données

### 1. Habitudes (Habit.ts)

```typescript
export interface Habit {
  id?: number;
  date: string;
  wakeUpAt7: number;
  sleepAt12: number;
  trading: number;
  financeDocReading: number;
  tradeAnalysis: number;
  toolDevelopment: number;
  study: number;
  studyDetails?: string;
  todoCompletion: number; // 0.0-1.0
  meditation: number;
  sport: number;
  checkCrypto: number;
  backtest: number;
  notes?: string;
  // Évaluations qualitatives et durées
  tradingQuality?: number; // 1-5
  tradingDuration?: number; // minutes
  studyQuality?: number; // 1-5
  studyDuration?: number; // minutes
}
```

### 2. Tâches (Task.ts)

```typescript
export type TaskType = 'perpetual' | 'daily' | 'weekly' | 'monthly' | 'specific';
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id?: number;
  categoryId: number;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  estimatedDuration?: number; // minutes
  completed?: boolean;
  tags?: string[];
  dueDate?: string;
}

export interface TaskCategory {
  id?: number;
  name: string;
  description?: string;
  color?: string;
}

export interface TaskCompletion {
  id?: number;
  taskId: number;
  date: string;
  completed: boolean;
  duration?: number; // minutes
  notes?: string;
}
```

### 3. Planning (Planning.ts)

```typescript
export type ImportanceLevel = 'low' | 'medium' | 'high';

export interface TimeBlock {
  id?: number;
  dateId: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  categoryId?: number;
  taskIds?: number[];
  completed: boolean;
}

export interface EconomicEvent {
  id?: number;
  dateId: number;
  time: string;
  title: string;
  importance: ImportanceLevel;
  forecast?: string;
  previous?: string;
  actual?: string;
  notes?: string;
}

export interface DailyPlan {
  id?: number;
  date: string;
  notes?: string;
}
```

### 4. Journal (Journal.ts)

```typescript
export interface Position {
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  notes?: string;
}

export interface JournalEntry {
  id?: number;
  date: string;
  tradingSummary?: {
    positions: Position[];
    macroEvents?: string[];
    marketNotes?: string;
  };
  reflection?: string;
  learnings?: string[];
  completedTasks?: number[]; // IDs des tâches complétées
  emotions?: string;
  tomorrowPlan?: string;
  attachments?: string[]; // Chemins vers des fichiers
}
```

### 5. Apprentissage (Learning.ts)

```typescript
export type ResourceType = 'book' | 'course' | 'document' | 'video' | 'article';
export type ResourceStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';
export type ResourceFormat = 'pdf' | 'video' | 'audio' | 'text' | 'interactive';

export interface LearningResource {
  id?: number;
  title: string;
  type: ResourceType;
  category: string;
  format: ResourceFormat;
  status: ResourceStatus;
  progress: number; // 0-100
  priority: number; // 1-5
  description?: string;
  url?: string;
  filePath?: string;
  notes?: string;
  dateAdded: string;
  lastStudyDate?: string;
  totalStudyTime?: number; // minutes
  tags?: string[];
  chapters?: {
    id: number;
    title: string;
    completed: boolean;
  }[];
}

export interface StudySession {
  id?: number;
  resourceId: number;
  date: string;
  duration: number; // minutes
  notes?: string;
  chapterId?: number;
  rating?: number; // 1-5, évaluation de la session
}

export interface StudyPlan {
  id?: number;
  title: string;
  description?: string;
  resources: number[]; // IDs des ressources
  estimatedCompletionDate?: string;
  createdAt: string;
  priority: number; // 1-5
}

export interface Quiz {
  id?: number;
  resourceId: number;
  title: string;
  questions: {
    id: number;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  }[];
  createdAt: string;
  lastAttempt?: string;
  bestScore?: number;
}
```

## Services de base de données

### 1. Configuration SQLite (database.ts)

- Initialisation de la base de données SQLite
- Création des tables pour chaque module : habitudes, tâches, planning, journal, apprentissage
- Activation des clés étrangères et des contraintes
- Configuration des chemins de stockage dans le dossier utilisateur

### 2. Service d'habitudes (habitService.ts)

- `getAll()` : Récupérer toutes les entrées d'habitudes
- `getByDate(date)` : Récupérer l'entrée pour une date spécifique
- `getForRange(startDate, endDate)` : Récupérer les habitudes sur une période
- `create(habit)` : Créer une nouvelle entrée d'habitude
- `update(habit)` : Mettre à jour une entrée existante
- `deleteByDate(date)` : Supprimer une entrée
- `getWeeklyStats()` : Calculer des statistiques hebdomadaires
- `getMonthlyStats()` : Calculer des statistiques mensuelles
- `calculateTrends(habits)` : Analyser les tendances
- `importFromCSV(csvData)` : Importer des données depuis CSV

### 3. Service de tâches (taskService.ts)

- **taskCategoryService** : CRUD pour les catégories de tâches
- **taskService** : CRUD pour les tâches, filtrage, recherche
- **taskCompletionService** : Suivi de la complétion des tâches par date

### 4. Service de planning (planningService.ts)

- **dailyPlanService** : Gestion des plans journaliers
- **timeBlockService** : Gestion des blocs de temps
- **economicEventService** : Gestion des événements économiques
- Fonctions pour récupérer des données par date, par plan ou pour une période

### 5. Service de journal (journalService.ts)

- CRUD pour les entrées de journal
- Fonctions de recherche et d'analyse
- Extraction de mots-clés et d'insights
- Exploration des tendances émotionnelles

### 6. Service d'apprentissage (learningService.ts)

- **resourceService** : Gestion des ressources d'apprentissage (livres, cours, etc.)
- **studySessionService** : Suivi des sessions d'étude
- **studyPlanService** : Gestion des plans d'étude
- **quizService** : Gestion des quiz et tests
- Fonctions de filtrage, de recherche et d'analyse de progression

## Pages implémentées

### 1. DashboardPage

- Vue d'ensemble des activités quotidiennes
- Statistiques rapides : habitudes, tâches, journal, événements
- Accès rapide aux modules principaux
- Planning du jour et tâches prioritaires

### 2. HabitsPage

- Tracking quotidien des habitudes (binaire 0/1)
- Visualisation des streaks et tendances
- Suivi des habitudes liées au trading, à l'étude, etc.
- Statistiques hebdomadaires et mensuelles

### 3. TodoPage

- Gestion des tâches par catégories
- Filtrage par type (perpétuel, quotidien, hebdomadaire, etc.)
- Système de priorités et tags
- Création et modification de tâches

### 4. PlanningPage

- Vue chronologique de la journée
- Blocs de temps pour les activités
- Intégration des événements économiques importants
- Liaison avec les tâches du Todo global

### 5. JournalPage

- Journal quotidien avec différents templates (trading, étude, dev)
- Suivi des positions de trading
- Réflexions, émotions et apprentissages
- Plan pour le lendemain

### 6. LearningPage

- Bibliothèque de ressources d'apprentissage
- Suivi de progression par ressource
- Filtrage par catégorie, format et statut
- Visualisation du temps d'étude

## Composants

### 1. Composants de Planning

- **DateSelector** : Navigation entre les dates
- **TimeBlockList** : Affichage chronologique des activités
- **TimeBlockForm** : Formulaire pour créer/modifier des blocs de temps
- **EconomicEventList** : Liste des événements économiques
- **EconomicEventForm** : Formulaire pour les événements économiques

### 2. Composants de Tâches

- **TaskCategoryList** : Liste des catégories de tâches
- **TaskList** : Liste des tâches par catégorie
- **TaskForm** : Formulaire pour créer/modifier des tâches

### 3. Composants d'UI

- **Sidebar** : Navigation principale de l'application
- **StatCard** : Affichage des statistiques dans le dashboard
- **TrendGraph** : Graphique simplifié des tendances

## Fonctionnalités terminées

### 1. Navigation et structure

- ✅ Structure complète de l'application
- ✅ Navigation entre les différentes sections
- ✅ Système de routes avec React Router
- ✅ Layout principal avec sidebar

### 2. Module Habitudes

- ✅ Interface de suivi journalier des habitudes
- ✅ Visualisation des tendances hebdomadaires
- ✅ Statistiques de performance des habitudes
- ✅ Navigation entre les dates

### 3. Module Todo

- ✅ Gestion des catégories de tâches (CRUD)
- ✅ Gestion des tâches (CRUD)
- ✅ Système de filtrage et de priorités
- ✅ Interface utilisateur complète

### 4. Module Planning

- ✅ Vue chronologique de la journée
- ✅ Gestion des blocs de temps (CRUD)
- ✅ Gestion des événements économiques
- ✅ Navigation entre les dates
- ✅ Analyse du temps par catégorie

### 5. Base de données

- ✅ Schéma complet pour tous les modules
- ✅ Services CRUD pour les données principales
- ✅ Relations entre les différentes entités

## Fonctionnalités en cours

### 1. Module Journal

- ✅ Interface utilisateur de base
- ✅ Templates pour différents types de journée
- ✅ Gestion des positions de trading
- ⚠️ Sauvegarde et chargement des données réelles (à connecter)
- ⚠️ Analyse des tendances et insights

### 2. Module Apprentissage

- ✅ Interface utilisateur de base
- ✅ Affichage et filtrage des ressources
- ⚠️ Gestion des sessions d'étude
- ⚠️ Suivi détaillé de la progression
- ⚠️ Système de quiz

### 3. Dashboard

- ✅ Interface utilisateur de base
- ✅ Statistiques principales
- ⚠️ Visualisations avancées
- ⚠️ Personnalisation des widgets

### 4. Intégration de l'Assistant IA

- ✅ Modèle de données pour l'assistant
- ⚠️ Interface utilisateur de conversation
- ⚠️ Intégration avec l'API Claude
- ⚠️ Génération de quiz et recommandations

## Prochaines étapes

1. **Finalisation du module Journal**
   - Compléter l'intégration avec la base de données
   - Ajouter des visualisations d'analyse des sentiments
   - Implémentation de la recherche et du filtrage

2. **Développement du module Apprentissage**
   - Implémentation des sessions d'étude
   - Création du système de quiz
   - Développement du plan d'étude
   - Assistant IA pour les recommandations

3. **Amélioration du Dashboard**
   - Visualisations plus avancées
   - Personnalisation des widgets
   - Insights basés sur les données

4. **Module Trading**
   - Interface de suivi des positions
   - Graphiques de performance
   - Intégration avec Darwinex

5. **Fonctionnalités transversales**
   - Système de backup et restauration
   - Export des données
   - Thèmes visuels
   - Raccourcis clavier

6. **Tests et optimisations**
   - Tests unitaires et d'intégration
   - Optimisation des performances
   - Gestion de la mémoire et des ressources

---

## État actuel du projet

Le projet a une base solide avec une structure claire et organisée. Les modules principaux (Habitudes, Planning, Todo, Journal, et Apprentissage) sont en place avec des interfaces utilisateur fonctionnelles. La base de données est configurée avec les schémas pour tous les modules.

Les fonctionnalités de base sont implémentées pour la plupart des modules, mais certaines intégrations entre les composants UI et la base de données sont encore en cours de développement. Les visualisations avancées et l'intégration de l'IA sont les prochaines grandes priorités.

Le design est cohérent grâce à TailwindCSS, mais des améliorations de l'expérience utilisateur sont encore possibles, notamment pour les workflows compliqués comme la planification et le suivi des trades.
