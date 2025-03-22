import React, { useState, useEffect } from 'react';
import { TaskCategory } from '../../../shared/models/Task';
import { taskCategoryService } from '../../../database/taskService';

interface TaskCategoryListProps {
  onCategorySelect: (category: TaskCategory) => void;
  selectedCategoryId?: number;
}

const TaskCategoryList: React.FC<TaskCategoryListProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<TaskCategory>>({
    name: '',
    color: '#3498db'
  });

  // Charger les catégories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await taskCategoryService.getAll();
      setCategories(data);
      setError(null);
      
      // Sélectionner automatiquement la première catégorie si aucune n'est sélectionnée
      if (data.length > 0 && !selectedCategoryId) {
        onCategorySelect(data[0]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Ajouter une nouvelle catégorie
  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    
    try {
      await taskCategoryService.create({
        name: newCategory.name,
        description: newCategory.description || '',
        color: newCategory.color || '#3498db'
      } as TaskCategory);
      
      setNewCategory({ name: '', color: '#3498db' });
      setShowAddForm(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de l\'ajout de la catégorie');
      console.error(err);
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Toutes les tâches associées seront également supprimées.')) {
      try {
        await taskCategoryService.delete(id);
        loadCategories();
      } catch (err) {
        setError('Erreur lors de la suppression de la catégorie');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-4">Chargement des catégories...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Catégories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center">
            <button
              className={`flex items-center flex-grow p-2 rounded ${
                selectedCategoryId === category.id ? 'bg-blue-100 border-blue-500 border' : 'hover:bg-gray-200'
              }`}
              onClick={() => onCategorySelect(category)}
            >
              <span 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: category.color || '#808080' }}
              />
              <span>{category.name}</span>
            </button>
            <button 
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => handleDeleteCategory(category.id!)}
            >
              <span>❌</span>
            </button>
          </li>
        ))}
      </ul>
      
      {showAddForm ? (
        <div className="mt-4 p-3 bg-white rounded shadow-sm">
          <input
            type="text"
            placeholder="Nom de la catégorie"
            className="w-full p-2 mb-2 border rounded"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description (optionnel)"
            className="w-full p-2 mb-2 border rounded"
            value={newCategory.description || ''}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
          <div className="flex items-center mb-2">
            <label className="mr-2">Couleur:</label>
            <input
              type="color"
              className="w-10 h-10 border rounded"
              value={newCategory.color || '#3498db'}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            />
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={handleAddCategory}
            >
              Ajouter
            </button>
            <button
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              onClick={() => setShowAddForm(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddForm(true)}
        >
          + Ajouter une catégorie
        </button>
      )}
    </div>
  );
};

export default TaskCategoryList;