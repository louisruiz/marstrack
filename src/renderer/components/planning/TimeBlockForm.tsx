import React, { useState, useEffect } from 'react';
import { TimeBlock } from '../../../shared/models/Planning';
import { TaskCategory } from '../../../shared/models/Task';
import { Task } from '../../../shared/models/Task';

interface TimeBlockFormProps {
  initialBlock?: Partial<TimeBlock>;
  dailyPlanId: number;
  categories: TaskCategory[];
  tasks: Task[];
  onSubmit: (block: TimeBlock) => void;
  onCancel: () => void;
}

const TimeBlockForm: React.FC<TimeBlockFormProps> = ({
  initialBlock,
  dailyPlanId,
  categories,
  tasks,
  onSubmit,
  onCancel
}) => {
  const [block, setBlock] = useState<Partial<TimeBlock>>({
    dailyPlanId,
    startTime: "09:00",
    endTime: "10:00",
    title: "",
    description: "",
    categoryId: undefined,
    taskIds: [],
    completed: false,
    ...(initialBlock || {})
  });
  
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  
  // Mise à jour des tâches disponibles lorsque la catégorie change
  useEffect(() => {
    if (block.categoryId) {
      const filteredTasks = tasks.filter(task => task.categoryId === block.categoryId);
      setAvailableTasks(filteredTasks);
    } else {
      setAvailableTasks(tasks);
    }
  }, [block.categoryId, tasks]);
  
  // Mettre à jour le plan quotidien si nécessaire
  useEffect(() => {
    setBlock(current => ({
      ...current,
      dailyPlanId
    }));
  }, [dailyPlanId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(block as TimeBlock);
  };
  
  const handleTaskToggle = (taskId: number) => {
    const taskIds = block.taskIds || [];
    if (taskIds.includes(taskId)) {
      setBlock({
        ...block,
        taskIds: taskIds.filter(id => id !== taskId)
      });
    } else {
      setBlock({
        ...block,
        taskIds: [...taskIds, taskId]
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {initialBlock?.id ? 'Modifier le bloc' : 'Nouveau bloc de temps'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={block.title}
          onChange={(e) => setBlock({ ...block, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Heure de début</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={block.startTime}
            onChange={(e) => setBlock({ ...block, startTime: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Heure de fin</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={block.endTime}
            onChange={(e) => setBlock({ ...block, endTime: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={block.description || ''}
          onChange={(e) => setBlock({ ...block, description: e.target.value })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Catégorie</label>
        <select
          className="w-full p-2 border rounded"
          value={block.categoryId || ''}
          onChange={(e) => setBlock({ 
            ...block, 
            categoryId: e.target.value ? parseInt(e.target.value) : undefined,
            // Réinitialiser les taskIds si la catégorie change
            taskIds: []
          })}
        >
          <option value="">-- Sélectionner une catégorie --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {block.categoryId && availableTasks.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tâches associées</label>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {availableTasks.map(task => (
              <div key={task.id} className="flex items-center py-1">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={(block.taskIds || []).includes(task.id!)}
                  onChange={() => handleTaskToggle(task.id!)}
                  className="mr-2"
                />
                <label htmlFor={`task-${task.id}`} className="text-sm">
                  {task.title}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={block.completed}
            onChange={(e) => setBlock({ ...block, completed: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm">Marquer comme complété</span>
        </label>
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
          disabled={!block.title}
        >
          {initialBlock?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default TimeBlockForm;