import React, { useState, useEffect } from 'react';
import { journalService } from '../../../database/journalService';

interface EmotionAnalysisProps {
  startDate: string;
  endDate: string;
}

const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ startDate, endDate }) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      try {
        const data = await journalService.analyzeEmotions(startDate, endDate);
        setAnalysisData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de l\'analyse des émotions:', err);
        setError('Impossible de charger l\'analyse des émotions');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [startDate, endDate]);

  if (isLoading) {
    return <div className="p-4 text-center">Chargement de l'analyse...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!analysisData || analysisData.analysis.length === 0) {
    return <div className="p-4 text-center">Pas assez de données pour l'analyse</div>;
  }

  const { analysis, stats } = analysisData;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Analyse des Émotions</h3>

      {/* Graphique simple des sentiments */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Répartition des sentiments</h4>
        <div className="flex h-8 w-full rounded-lg overflow-hidden">
          {stats.positif > 0 && (
            <div 
              className="bg-green-500" 
              style={{ width: `${(stats.positif / stats.total) * 100}%` }}
              title={`Positif: ${stats.positif} entrées (${Math.round((stats.positif / stats.total) * 100)}%)`}
            ></div>
          )}
          {stats.neutre > 0 && (
            <div 
              className="bg-gray-400" 
              style={{ width: `${(stats.neutre / stats.total) * 100}%` }}
              title={`Neutre: ${stats.neutre} entrées (${Math.round((stats.neutre / stats.total) * 100)}%)`}
            ></div>
          )}
          {stats.négatif > 0 && (
            <div 
              className="bg-red-500" 
              style={{ width: `${(stats.négatif / stats.total) * 100}%` }}
              title={`Négatif: ${stats.négatif} entrées (${Math.round((stats.négatif / stats.total) * 100)}%)`}
            ></div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1">
          <div>
            <span className="inline-block w-3 h-3 bg-green-500 mr-1"></span>
            Positif: {stats.positif} ({Math.round((stats.positif / stats.total) * 100)}%)
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-gray-400 mr-1"></span>
            Neutre: {stats.neutre} ({Math.round((stats.neutre / stats.total) * 100)}%)
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-red-500 mr-1"></span>
            Négatif: {stats.négatif} ({Math.round((stats.négatif / stats.total) * 100)}%)
          </div>
        </div>
      </div>

      {/* Historique des sentiments */}
      <div>
        <h4 className="font-medium mb-2">Historique</h4>
        <div className="max-h-40 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      item.sentiment === 'positif' ? 'bg-green-100 text-green-800' :
                      item.sentiment === 'négatif' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysis;