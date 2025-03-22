import * as XLSX from 'xlsx';
import { Habit } from '../models/Habit';

export const importExcelHabits = (filePath: string): Habit[] => {
  try {
    // Lire le fichier Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir en JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Traiter les données
    const headers = rawData[0] as string[];
    const habits: Habit[] = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (!row || row.length === 0) continue;
      
      // Extraire les données de chaque ligne
      const habit: any = {
        date: formatExcelDate(row[0]),
        wakeUpAt7: convertToBinary(row[findColumnIndex(headers, "réveil7h")]),
        sleepAt12: convertToBinary(row[findColumnIndex(headers, "dormir00h")]),
        trading: convertToBinary(row[findColumnIndex(headers, "trading")]),
        financeDocReading: convertToBinary(row[findColumnIndex(headers, "lecturelivreamoifinanc")]),
        tradeAnalysis: convertToBinary(row[findColumnIndex(headers, "analysedetrade")]),
        toolDevelopment: convertToBinary(row[findColumnIndex(headers, "devoutil")]),
        study: convertToBinary(row[findColumnIndex(headers, "study")]),
        studyDetails: row[findColumnIndex(headers, "studydetails")],
        todoCompletion: parseFloat(row[findColumnIndex(headers, "todocompleted")] || 0),
        meditation: convertToBinary(row[findColumnIndex(headers, "meditation")]),
        sport: convertToBinary(row[findColumnIndex(headers, "sport")]),
        checkCrypto: convertToBinary(row[findColumnIndex(headers, "farmorcheckc")]),
        backtest: convertToBinary(row[findColumnIndex(headers, "backtest")]),
        notes: row[findColumnIndex(headers, "notes")]
      };
      
      habits.push(habit as Habit);
    }
    
    return habits;
  } catch (error) {
    console.error("Erreur lors de l'importation Excel:", error);
    throw new Error(`Erreur lors de l'importation: ${error.message}`);
  }
};

// Fonctions utilitaires
const findColumnIndex = (headers: string[], columnName: string): number => {
  const index = headers.findIndex(h => 
    h && h.toLowerCase().replace(/\s+/g, '').includes(columnName.toLowerCase())
  );
  return index !== -1 ? index : -1;
};

const convertToBinary = (value: any): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value > 0 ? 1 : 0;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase().trim();
    return lowercased === '1' || lowercased === 'yes' || lowercased === 'true' || lowercased === 'oui' ? 1 : 0;
  }
  return 0;
};

const formatExcelDate = (excelDate: any): string => {
  if (typeof excelDate === 'string') {
    // Tenter de parser comme date ISO
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return excelDate;
  }
  
  if (typeof excelDate === 'number') {
    // Convertir date Excel en date JS
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  return '';
};