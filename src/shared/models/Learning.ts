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