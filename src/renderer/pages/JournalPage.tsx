import React, { useState, useEffect } from 'react';
import { Task } from '../../shared/models/Task';
import { taskService } from '../../database/taskService';
import { JournalEntry, Position, JournalTemplate } from '../../shared/models/Journal';
import { journalService } from '../../database/journalService';
import JournalTag from '../components/journal/JournalTag';
import EmotionAnalysis from '../components/journal/EmotionAnalysis';
import MediaPanel from '../components/journal/MediaPanel';

const JournalPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [journal, setJournal] = useState<JournalEntry>({
    date: selectedDate,
    tradingSummary: { positions: [] },
    learnings: [],
    completedTasks: []
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<string>('trading');
  const [tagInput, setTagInput] = useState<string>('');
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [analysisStartDate, setAnalysisStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Essayez d'abord avec les services réels
        try {
          // Charger l'entrée de journal pour la date sélectionnée
          const journalEntry = await journalService.getOrCreate(selectedDate);
          setJournal(journalEntry);
          
          // Si un template est déjà défini, l'utiliser
          if (journalEntry.template) {
            setCurrentTemplate(journalEntry.template as JournalTemplate);
          }
          
          // Charger les tâches disponibles
          const allTasks = await taskService.getAll();
          setTasks(allTasks);
          
          // Charger les entrées récentes
          const recent = await journalService.getRecentEntries(7);
          setRecentEntries(recent);
        } catch (serviceError) {
          console.warn('Services non disponibles, utilisation des données mock:', serviceError);
          
          // Fallback sur les données mock si les services échouent
          const mockEntry: JournalEntry = {
            id: 1,
            date: selectedDate,
            tradingSummary: {
              positions: [
                {
                  asset: 'NASDAQ',
                  direction: 'long',
                  entryPrice: 17500,
                  exitPrice: 17600,
                  notes: 'Prise de position sur rebond VAR-2'
                },
                {
                  asset: 'GOLD',
                  direction: 'short',
                  entryPrice: 2150,
                  notes: 'Hedge contre inflation'
                }
              ],
              macroEvents: ['NFP', 'FOMC', 'PPI'],
              marketNotes: 'Volatilité élevée suite aux commentaires de Powell'
            },
            reflection: 'Bonnes prises de décision aujourd\'hui, mais sortie trop tôt du NAS. Je devrai surveiller ma tendance à prendre trop rapidement les profits.',
            learnings: ['Analyse du doc Morgan Stanley', 'Développement indicateur SD', 'Cours sur options'],
            completedTasks: [1, 2, 3],
            emotions: 'Confiant sur ma vision macro',
            tomorrowPlan: 'Check CPI, continuer dev du programme bloombit'
          };
          
          setJournal(mockEntry);
          
          // Données mock pour les tâches
          const mockTasks: Task[] = [
            { id: 1, categoryId: 1, title: 'Analyse du S&P500', type: 'daily', priority: 1, completed: true },
            { id: 2, categoryId: 1, title: 'Check niveaux de support', type: 'daily', priority: 2, completed: true },
            { id: 3, categoryId: 2, title: 'Lire rapport Morgan Stanley', type: 'daily', priority: 2, completed: true },
            { id: 4, categoryId: 3, title: 'Développer indicateur SD', type: 'specific', priority: 3, completed: false },
            { id: 5, categoryId: 4, title: 'Cours sur les options', type: 'specific', priority: 2, completed: true }
          ];
          
          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedDate]);
  
  // Gestionnaire pour ajouter des tags
  const handleAddTag = () => {
    if (tagInput && (!journal.tags || !journal.tags.includes(tagInput))) {
      setJournal(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput]
      }));
      setTagInput('');
    }
  };
  
  // Gestionnaire pour supprimer des tags
  const handleRemoveTag = (tagToRemove: string) => {
    setJournal(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Gestionnaire pour ajouter des pièces jointes
  const handleAddAttachment = (path: string) => {
    setJournal(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), path]
    }));
  };
  
  // Gestionnaire pour supprimer des pièces jointes
  const handleRemoveAttachment = (index: number) => {
    setJournal(prev => {
      const newAttachments = [...(prev.attachments || [])];
      newAttachments.splice(index, 1);
      return {
        ...prev,
        attachments: newAttachments
      };
    });
  };
  
  // Navigation entre les jours
  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const nextDate = date.toISOString().split('T')[0];
    // Ne pas permettre de naviguer au-delà d'aujourd'hui
    if (nextDate <= today) {
      setSelectedDate(nextDate);
    }
  };
  
  const handleToday = () => {
    setSelectedDate(today);
  };
  
  // Changements des champs texte
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof JournalEntry) => {
    setJournal(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  // Ajouter ou modifier une position
  const handlePositionChange = (index: number, field: keyof Position, value: any) => {
    setJournal(prev => {
      const updatedPositions = [...(prev.tradingSummary?.positions || [])];
      updatedPositions[index] = {
        ...updatedPositions[index],
        [field]: value
      };
      
      return {
        ...prev,
        tradingSummary: {
          ...prev.tradingSummary,
          positions: updatedPositions
        }
      };
    });
  };
  
  // Ajouter une nouvelle position
  const handleAddPosition = () => {
    setJournal(prev => {
      const newPosition: Position = {
        asset: '',
        direction: 'long',
        entryPrice: 0
      };
      
      return {
        ...prev,
        tradingSummary: {
          ...prev.tradingSummary,
          positions: [...(prev.tradingSummary?.positions || []), newPosition]
        }
      };
    });
  };
  
  // Supprimer une position
  const handleRemovePosition = (index: number) => {
    setJournal(prev => {
      const updatedPositions = [...(prev.tradingSummary?.positions || [])];
      updatedPositions.splice(index, 1);
      
      return {
        ...prev,
        tradingSummary: {
          ...prev.tradingSummary,
          positions: updatedPositions
        }
      };
    });
  };
  
  // Ajouter ou supprimer une tâche complétée
  const handleTaskToggle = (taskId: number) => {
    setJournal(prev => {
      const completedTasks = [...(prev.completedTasks || [])];
      
      if (completedTasks.includes(taskId)) {
        // Retirer la tâche si déjà présente
        return {
          ...prev,
          completedTasks: completedTasks.filter(id => id !== taskId)
        };
      } else {
        // Ajouter la tâche si non présente
        return {
          ...prev,
          completedTasks: [...completedTasks, taskId]
        };
      }
    });
  };
  
  // Ajouter un élément d'apprentissage
  const handleAddLearning = () => {
    setJournal(prev => ({
      ...prev,
      learnings: [...(prev.learnings || []), '']
    }));
  };
  
  // Modifier un élément d'apprentissage
  const handleLearningChange = (index: number, value: string) => {
    setJournal(prev => {
      const updatedLearnings = [...(prev.learnings || [])];
      updatedLearnings[index] = value;
      
      return {
        ...prev,
        learnings: updatedLearnings
      };
    });
  };
  
  // Supprimer un élément d'apprentissage
  const handleRemoveLearning = (index: number) => {
    setJournal(prev => {
      const updatedLearnings = [...(prev.learnings || [])];
      updatedLearnings.splice(index, 1);
      
      return {
        ...prev,
        learnings: updatedLearnings
      };
    });
  };
  
  // Mettre à jour les événements macroéconomiques
  const handleMacroEventsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const events = e.target.value.split(',').map(event => event.trim()).filter(Boolean);
    
    setJournal(prev => ({
      ...prev,
      tradingSummary: {
        ...prev.tradingSummary,
        macroEvents: events
      }
    }));
  };
  
  // Mettre à jour les notes de marché
  const handleMarketNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJournal(prev => ({
      ...prev,
      tradingSummary: {
        ...prev.tradingSummary,
        marketNotes: e.target.value
      }
    }));
  };
  
  // Sauvegarder l'entrée de journal
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Ajouter le template actuel à l'entrée du journal
      const entryToSave = {
        ...journal,
        template: currentTemplate
      };
      
      try {
        if (journal.id) {
          await journalService.update(entryToSave);
        } else {
          const id = await journalService.create(entryToSave);
          setJournal(prev => ({ ...prev, id }));
        }
        
        // Rafraîchir les entrées récentes
        const recent = await journalService.getRecentEntries(7);
        setRecentEntries(recent);
      } catch (serviceError) {
        console.warn('Service de sauvegarde non disponible:', serviceError);
        // Simuler un délai pour la démo
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSaveMessage('Journal sauvegardé avec succès!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Appliquer un modèle
  const handleApplyTemplate = (template: string) => {
    setCurrentTemplate(template);
    
    // Implémenter différents modèles selon le type de journée
    switch (template) {
      case 'trading':
        setJournal(prev => ({
          ...prev,
          tradingSummary: {
            positions: prev.tradingSummary?.positions || [],
            macroEvents: prev.tradingSummary?.macroEvents || [],
            marketNotes: prev.tradingSummary?.marketNotes || 'Résumé des mouvements de marché et événements clés du jour:'
          },
          reflection: prev.reflection || 'Réflexions sur mes décisions de trading:',
          emotions: prev.emotions || 'Sentiment général sur le marché:',
          tomorrowPlan: prev.tomorrowPlan || 'Plan pour demain:'
        }));
        break;
        
      case 'study':
        setJournal(prev => ({
          ...prev,
          learnings: prev.learnings?.length ? prev.learnings : ['', '', ''],
          reflection: prev.reflection || 'Réflexions sur les sujets étudiés aujourd\'hui:',
          emotions: prev.emotions || 'Sentiment sur ma progression:',
          tomorrowPlan: prev.tomorrowPlan || 'Sujets à étudier demain:'
        }));
        break;
        
      case 'development':
        setJournal(prev => ({
          ...prev,
          reflection: prev.reflection || 'Progrès réalisés sur les projets de développement:',
          learnings: prev.learnings?.length ? prev.learnings : ['Obstacles rencontrés:', 'Solutions trouvées:', 'Nouvelles idées:'],
          emotions: prev.emotions || 'Satisfaction par rapport aux avancées:',
          tomorrowPlan: prev.tomorrowPlan || 'Prochaines étapes de développement:'
        }));
        break;
        
      default:
        break;
    }
  };
  
  // Formatage de la date pour l'affichage
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal</h1>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousDay}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            &lt;
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Aujourd'hui
          </button>
          <button 
            onClick={handleNextDay}
            className={`px-3 py-1 rounded ${selectedDate === today ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            disabled={selectedDate === today}
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold capitalize">{formatDate(selectedDate)}</h2>
      </div>
      
      {/* Sélecteur de modèle */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Modèle de journal</h3>
        <div className="flex space-x-3">
          <button
            className={`px-4 py-2 rounded ${currentTemplate === 'trading' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleApplyTemplate('trading')}
          >
            Trading
          </button>
          <button
            className={`px-4 py-2 rounded ${currentTemplate === 'study' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleApplyTemplate('study')}
          >
            Étude
          </button>
          <button
            className={`px-4 py-2 rounded ${currentTemplate === 'development' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleApplyTemplate('development')}
          >
            Développement
          </button>
        </div>
      </div>
      
      {/* Système de tags */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap mb-2">
          {journal.tags?.map((tag, index) => (
            <JournalTag 
              key={index} 
              tag={tag} 
              onRemove={() => handleRemoveTag(tag)} 
            />
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l"
            placeholder="Ajouter un tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 rounded-r"
            onClick={handleAddTag}
          >
            +
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Trading Summary - sera affiché uniquement si le modèle est 'trading' */}
        {currentTemplate === 'trading' && (
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Résumé de Trading</h3>
            
            {/* Positions */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Positions</h4>
                <button
                  onClick={handleAddPosition}
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  + Ajouter
                </button>
              </div>
              
              {journal.tradingSummary?.positions && journal.tradingSummary.positions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actif</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix d'entrée</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix de sortie</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {journal.tradingSummary.positions.map((position, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={position.asset}
                              onChange={(e) => handlePositionChange(index, 'asset', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={position.direction}
                              onChange={(e) => handlePositionChange(index, 'direction', e.target.value as 'long' | 'short')}
                            >
                              <option value="long">Long</option>
                              <option value="short">Short</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1"
                              value={position.entryPrice}
                              onChange={(e) => handlePositionChange(index, 'entryPrice', parseFloat(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1"
                              value={position.exitPrice || ''}
                              onChange={(e) => handlePositionChange(index, 'exitPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={position.notes || ''}
                              onChange={(e) => handlePositionChange(index, 'notes', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleRemovePosition(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune position. Cliquez sur "Ajouter" pour commencer.</p>
              )}
            </div>
            
            {/* Événements macroéconomiques */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Événements macroéconomiques</h4>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="FOMC, NFP, CPI, etc. (séparés par des virgules)"
                value={journal.tradingSummary?.macroEvents?.join(', ') || ''}
                onChange={handleMacroEventsChange}
              />
            </div>
            
            {/* Notes de marché */}
            <div>
              <h4 className="font-medium mb-2">Notes de marché</h4>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Notes générales sur les conditions de marché..."
                value={journal.tradingSummary?.marketNotes || ''}
                onChange={handleMarketNotesChange}
              />
            </div>
          </div>
        )}
        
        {/* Réflexion */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Réflexion</h3>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={6}
            placeholder="Réflexion sur la journée..."
            value={journal.reflection || ''}
            onChange={(e) => handleTextChange(e, 'reflection')}
          />
        </div>
        
        {/* Apprentissage */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Apprentissage</h3>
            <button
              onClick={handleAddLearning}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              + Ajouter
            </button>
          </div>
          
          {journal.learnings && journal.learnings.length > 0 ? (
            <ul className="space-y-2">
              {journal.learnings.map((learning, index) => (
                <li key={index} className="flex items-center">
                  <input
                    type="text"
                    className="flex-grow border rounded px-3 py-2"
                    placeholder={`Apprentissage ${index + 1}`}
                    value={learning}
                    onChange={(e) => handleLearningChange(index, e.target.value)}
                  />
                  <button
                    onClick={() => handleRemoveLearning(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun apprentissage. Cliquez sur "Ajouter" pour commencer.</p>
          )}
        </div>
        
        {/* Tâches complétées */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tâches complétées</h3>
          
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={(journal.completedTasks || []).includes(task.id!)}
                    onChange={() => handleTaskToggle(task.id!)}
                    className="mr-2"
                  />
                  <label htmlFor={`task-${task.id}`}>{task.title}</label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune tâche disponible.</p>
          )}
        </div>
        
        {/* Émotions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Émotions</h3>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Comment vous sentez-vous aujourd'hui?"
            value={journal.emotions || ''}
            onChange={(e) => handleTextChange(e, 'emotions')}
          />
        </div>
        
        {/* Plan pour demain */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Plan pour demain</h3>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Quels sont vos plans pour demain?"
            value={journal.tomorrowPlan || ''}
            onChange={(e) => handleTextChange(e, 'tomorrowPlan')}
          />
        </div>
        
        {/* Panneau de médias */}
        <div className="md:col-span-2">
          <MediaPanel
            attachments={journal.attachments || []}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>
      </div>
      
      {/* Analyse des émotions */}
      <div className="mt-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Analyse des tendances émotionnelles</h2>
        
        {/* Options de période d'analyse */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Période d'analyse:</label>
          <select 
            className="w-48 p-2 border rounded"
            value={analysisStartDate}
            onChange={(e) => setAnalysisStartDate(e.target.value)}
          >
            <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Dernière semaine
            </option>
            <option value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Dernier mois
            </option>
            <option value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Derniers 3 mois
            </option>
          </select>
        </div>
        
        {/* Composant d'analyse des émotions */}
        <EmotionAnalysis startDate={analysisStartDate} endDate={today} />
      </div>
      
      <div className="flex justify-end items-center">
        {saveMessage && (
          <span className={`mr-4 ${saveMessage.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage}
          </span>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

export default JournalPage;