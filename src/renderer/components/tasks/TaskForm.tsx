import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskPriority } from '../../../shared/models/Task';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  categoryId: number;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  initialTask, 
  categoryId,
  onSubmit, 
  onCancel 
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    categoryId,
    title: '',
    description: '',
    type: 'perpetual' as TaskType,
    priority: 3 as TaskPriority,
    estimatedDuration: 30,
    completed: false,
    tags: [],
    dueDate: '',
    ...(initialTask || {})
  });
  
  const [tagInput, setTagInput] = useState('');

  // Mise à jour du state si la catégorie change
  useEffect(() => {
    setTask(current => ({
      ...current,
      categoryId
    }));
  }, [categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
  };

  const handleTagAdd = () => {
    if (tagInput && !task.tags?.includes(tagInput)) {
      setTask({
        ...task,
        tags: [...(task.tags || []), tagInput]
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTask({
      ...task,
      tags: task.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {initialTask?.id ? 'Modifier la tâche' : 'Nouvelle tâche'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={task.description || ''}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full p-2 border rounded"
            value={task.type}
            onChange={(e) => setTask({ ...task, type: e.target.value as TaskType })}
          >
            <option value="perpetual">Perpétuelle</option>
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
            <option value="specific">Spécifique</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Priorité</label>
          <select
            className="w-full p-2 border rounded"
            value={task.priority}
            onChange={(e) => setTask({ ...task, priority: parseInt(e.target.value) as TaskPriority })}
          >
            <option value="1">1 - Très haute</option>
            <option value="2">2 - Haute</option>
            <option value="3">3 - Moyenne</option>
            <option value="4">4 - Basse</option>
            <option value="5">5 - Très basse</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Durée estimée (minutes)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            min="1"
            value={task.estimatedDuration || ''}
            onChange={(e) => setTask({ ...task, estimatedDuration: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Date d'échéance</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={task.dueDate || ''}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l"
            placeholder="Ajouter un tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 rounded-r"
            onClick={handleTagAdd}
          >
            +
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {task.tags?.map((tag, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
            >
              #{tag}
              <button
                type="button"
                className="ml-1 text-blue-800 hover:text-blue-600"
                onClick={() => handleTagRemove(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={!task.title}
        >
          {initialTask?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;