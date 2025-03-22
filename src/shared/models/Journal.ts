export interface Position {
  id?: number; // Ajout d'un ID pour faciliter les mises à jour
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  size?: number; // Taille de la position
  pnl?: number; // Profit and Loss
  notes?: string;
  strategy?: string; // Stratégie employée
  entryReason?: string; // Raison d'entrée
  exitReason?: string; // Raison de sortie
}

export type JournalTemplate = 'trading' | 'study' | 'development' | 'default';

export interface JournalEntry {
  id?: number;
  date: string;
  template?: JournalTemplate; // Type de template utilisé
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
  tags?: string[]; // Tags pour catégorisation et recherche
}