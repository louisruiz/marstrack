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
    todoCompletion: number;
    meditation: number;
    sport: number;
    checkCrypto: number;
    backtest: number;
    notes?: string;
    // Pour les évaluations qualitatives (1-5) et durées
    tradingQuality?: number;
    tradingDuration?: number;
    studyQuality?: number;
    studyDuration?: number;
    // autres évaluations si nécessaires...
  }