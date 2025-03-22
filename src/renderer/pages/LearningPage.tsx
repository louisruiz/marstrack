import React, { useState, useEffect } from 'react';
import { LearningResource, ResourceType, ResourceFormat, ResourceStatus } from '../../shared/models/Learning';

// Dans une application réelle, vous importeriez le service
// import { resourceService } from '../../database/learningService';

const LearningPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Filtres
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Onglets de navigation
  const [activeTab, setActiveTab] = useState<string>('resources');
  
  // Chargement initial des données
  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      try {
        // Pour développement, utilisons des données fictives
        // Dans une application réelle, vous feriez:
        // const data = await resourceService.getAll();
        
        // Données fictives pour le développement
        const mockResources: LearningResource[] = [
          {
            id: 1,
            title: 'The Art of Quantitative Finance',
            type: 'book',
            category: 'Finance',
            format: 'pdf',
            status: 'in_progress',
            progress: 60,
            priority: 1,
            description: 'Chapitres 8-11: Options Pricing',
            dateAdded: '2025-02-15',
            lastStudyDate: '2025-03-20',
            totalStudyTime: 240,
            tags: ['options', 'quant', 'pricing']
          },
          {
            id: 2,
            title: 'MIT OCW 15.401',
            type: 'course',
            category: 'Finance',
            format: 'video',
            status: 'in_progress',
            progress: 75,
            priority: 2,
            description: 'Finance quantitative - Fondamentaux',
            dateAdded: '2025-01-10',
            lastStudyDate: '2025-03-18',
            totalStudyTime: 720,
            tags: ['fundamentals', 'mit', 'lecture']
          },
          {
            id: 3,
            title: 'Morgan Stanley Report',
            type: 'document',
            category: 'Market Analysis',
            format: 'pdf',
            status: 'in_progress',
            progress: 20,
            priority: 3,
            description: 'Impact de l\'inflation sur les marchés',
            dateAdded: '2025-03-21',
            tags: ['inflation', 'markets', 'analysis']
          },
          {
            id: 4,
            title: 'Options Volatility & Pricing',
            type: 'book',
            category: 'Options Trading',
            format: 'pdf',
            status: 'not_started',
            progress: 0,
            priority: 2,
            description: 'Recommandé par l\'Assistant IA',
            dateAdded: '2025-03-19',
            tags: ['options', 'volatility', 'trading']
          }
        ];
        
        setResources(mockResources);
        setFilteredResources(mockResources);
      } catch (error) {
        console.error('Erreur lors du chargement des ressources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResources();
  }, []);
  
  // Appliquer les filtres quand ils changent
  useEffect(() => {
    // Fonction pour appliquer tous les filtres
    const applyFilters = () => {
      let result = [...resources];
      
      // Filtre par catégorie
      if (categoryFilter !== 'all') {
        result = result.filter(resource => resource.category === categoryFilter);
      }
      
      // Filtre par format
      if (formatFilter !== 'all') {
        result = result.filter(resource => resource.format === formatFilter);
      }
      
      // Filtre par statut
      if (statusFilter !== 'all') {
        result = result.filter(resource => resource.status === statusFilter);
      }
      
      // Filtre par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(resource => 
          resource.title.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query) ||
          resource.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      setFilteredResources(result);
    };
    
    applyFilters();
  }, [resources, categoryFilter, formatFilter, statusFilter, searchQuery]);
  
  // Récupérer les catégories uniques pour le filtre
  const categories = ['all', ...new Set(resources.map(resource => resource.category))];
  
  // Gérer la sélection d'une ressource
  const handleResourceSelect = (resource: LearningResource) => {
    setSelectedResource(resource);
    setShowAddForm(false);
  };
  
  // Gérer l'ajout d'une nouvelle ressource
  const handleAddResource = () => {
    setSelectedResource(null);
    setShowAddForm(true);
  };
  
  // Formater la durée en heures et minutes
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    
    return `${mins}m`;
  };
  
  // Obtenir le statut formaté
  const getStatusLabel = (status: ResourceStatus): string => {
    switch (status) {
      case 'not_started': return 'Non commencé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'on_hold': return 'En pause';
      default: return status;
    }
  };
  
  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status: ResourceStatus): string => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtenir la classe CSS pour le type
  const getTypeClass = (type: ResourceType): string => {
    switch (type) {
      case 'book': return 'bg-blue-500 text-white';
      case 'course': return 'bg-purple-500 text-white';
      case 'document': return 'bg-red-500 text-white';
      case 'video': return 'bg-green-500 text-white';
      case 'article': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Obtenir la classe CSS pour la priorité
  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Très haute';
      case 2: return 'Haute';
      case 3: return 'Moyenne';
      case 4: return 'Basse';
      case 5: return 'Très basse';
      default: return `Priorité ${priority}`;
    }
  };
  
  // Afficher le temps d'étude hebdomadaire
  const getWeeklyStudyTime = (): string => {
    // Dans une app réelle, calculez ça à partir des sessions d'étude
    return '5h / 8h';
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apprentissage</h1>
        <div className="bg-white p-3 rounded-lg shadow text-sm">
          <span className="font-medium">Objectif hebdomadaire: </span>
          {getWeeklyStudyTime()}
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'resources' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              Ressources
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'progress' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              Progression
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'plan' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('plan')}
            >
              Plan d'Étude
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'assistant' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('assistant')}
            >
              Assistant IA
            </button>
          </nav>
        </div>
      </div>
      
      {/* Afficher l'onglet actif */}
      {activeTab === 'resources' && (
        <>
          {/* Barre de filtres */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4">
            <div className="flex-grow">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 border border-gray-200 rounded p-2 pr-8 focus:outline-none focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Catégorie: Toutes</option>
                    {categories.filter(c => c !== 'all').map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 border border-gray-200 rounded p-2 pr-8 focus:outline-none focus:border-blue-500"
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                  >
                    <option value="all">Format: Tous</option>
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                    <option value="audio">Audio</option>
                    <option value="text">Texte</option>
                    <option value="interactive">Interactif</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 border border-gray-200 rounded p-2 pr-8 focus:outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Statut: Tous</option>
                    <option value="not_started">Non commencé</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="on_hold">En pause</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-100 border border-gray-200 rounded p-2 pl-10 focus:outline-none focus:border-blue-500"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <button
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
                onClick={handleAddResource}
              >
                <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Ajouter
              </button>
            </div>
          </div>
          
          {/* Grille de ressources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResourceSelect(resource)}
                >
                  <div className={`p-3 ${getTypeClass(resource.type)}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{resource.type === 'book' ? 'Livre' : resource.type === 'course' ? 'Cours' : resource.type === 'document' ? 'Document' : resource.type}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(resource.status)}`}>
                        {getStatusLabel(resource.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progression: {resource.progress}%</span>
                        {resource.totalStudyTime && <span>Temps d'étude: {formatDuration(resource.totalStudyTime)}</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${resource.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Dernière session: {resource.lastStudyDate ? new Date(resource.lastStudyDate).toLocaleDateString() : 'Jamais'}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                          Continuer
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                          Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Aucune ressource ne correspond à vos critères.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'progress' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progression</h2>
          <p className="text-gray-500">
            Section en cours de développement. Elle affichera des graphiques et statistiques sur votre progression d'apprentissage.
          </p>
        </div>
      )}
      
      {activeTab === 'plan' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Plan d'Étude</h2>
          <p className="text-gray-500">
            Section en cours de développement. Elle permettra de créer des plans d'étude structurés.
          </p>
        </div>
      )}
      
      {activeTab === 'assistant' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assistant IA</h2>
          <p className="text-gray-500">
            Section en cours de développement. Elle intégrera un assistant IA pour vous aider dans votre apprentissage.
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningPage;