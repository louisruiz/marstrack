import React, { useState } from 'react';
import { Task, TaskCategory } from '../../shared/models/Task';
import { taskService } from '../../database/taskService';
import TaskCategoryList from '../components/tasks/TaskCategoryList';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

const TodoPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategorySelect = (category: TaskCategory) => {
    setSelectedCategory(category);
    setSelectedTask(null);
    setShowAddTaskForm(false);
    setShowEditTaskForm(false);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskForm(true);
    setShowAddTaskForm(false);
  };

  const handleAddTaskClick = () => {
    setShowAddTaskForm(true);
    setShowEditTaskForm(false);
    setSelectedTask(null);
  };

  const handleTaskFormCancel = () => {
    setShowAddTaskForm(false);
    setShowEditTaskForm(false);
    setSelectedTask(null);
  };

  const handleTaskSubmit = async (task: Partial<Task>) => {
    try {
      if (task.id) {
        // Mise à jour d'une tâche existante
        await taskService.update(task as Task);
      } else {
        // Création d'une nouvelle tâche
        await taskService.create(task as Task);
      }
      
      // Réinitialiser l'état
      setShowAddTaskForm(false);
      setShowEditTaskForm(false);
      setSelectedTask(null);
      
      // Forcer le rechargement de la liste des tâches
      setRefreshKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la tâche:', err);
      alert('Erreur lors de la sauvegarde de la tâche');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Todo Global</h1>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Liste des catégories (gauche) */}
        <div className="col-span-3">
          <TaskCategoryList 
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategory?.id}
          />
        </div>
        
        {/* Liste des tâches (centre) */}
        <div className="col-span-5">
          {selectedCategory ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    <span 
                      className="inline-block w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: selectedCategory.color || '#808080' }}
                    />
                    {selectedCategory.name}
                  </h2>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={handleAddTaskClick}
                  >
                    + Ajouter une tâche
                  </button>
                </div>
                {selectedCategory.description && (
                  <p className="text-gray-600 mt-1">{selectedCategory.description}</p>
                )}
              </div>
              
              <TaskList 
                key={refreshKey}
                categoryId={selectedCategory.id!} 
                onTaskSelect={handleTaskSelect}
              />
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Sélectionnez une catégorie pour voir les tâches</p>
            </div>
          )}
        </div>
        
        {/* Formulaire (droite) */}
        <div className="col-span-4">
          {showAddTaskForm && selectedCategory && (
            <TaskForm
              categoryId={selectedCategory.id!}
              onSubmit={handleTaskSubmit}
              onCancel={handleTaskFormCancel}
            />
          )}
          
          {showEditTaskForm && selectedTask && (
            <TaskForm
              initialTask={selectedTask}
              categoryId={selectedTask.categoryId}
              onSubmit={handleTaskSubmit}
              onCancel={handleTaskFormCancel}
            />
          )}
          
          {!showAddTaskForm && !showEditTaskForm && (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">
                {selectedCategory 
                  ? 'Cliquez sur une tâche pour la modifier ou sur "Ajouter une tâche"'
                  : 'Sélectionnez une catégorie pour gérer les tâches'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;