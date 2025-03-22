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