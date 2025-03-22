import React from 'react';
import { TimeBlock } from '../../../shared/models/Planning';
import { TaskCategory } from '../../../shared/models/Task';

interface TimeBlockListProps {
  timeBlocks: TimeBlock[];
  categories: TaskCategory[];
  onBlockSelect: (block: TimeBlock) => void;
  onStatusChange: (id: number, completed: boolean) => void;
  onDeleteBlock: (id: number) => void;
}

const TimeBlockList: React.FC<TimeBlockListProps> = ({
  timeBlocks,
  categories,
  onBlockSelect,
  onStatusChange,
  onDeleteBlock
}) => {
  // Obtenez le nom de la catégorie par ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return "";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "";
  };
  
  // Obtenez la couleur de la catégorie par ID
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return "#e0e0e0";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color || "#e0e0e0" : "#e0e0e0";
  };
  
  // Triez les blocs par heure de début
  const sortedBlocks = [...timeBlocks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Fonction pour générer les slots de temps (heures)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Trouvez les blocs pour chaque slot de temps
  const getBlocksForTimeSlot = (slot: string) => {
    const slotHour = parseInt(slot.split(':')[0]);
    
    return sortedBlocks.filter(block => {
      const blockStartHour = parseInt(block.startTime.split(':')[0]);
      const blockEndHour = parseInt(block.endTime.split(':')[0]);
      
      // Vérifie si le bloc commence, se termine ou couvre ce slot
      return blockStartHour === slotHour || 
             (blockStartHour < slotHour && blockEndHour > slotHour) ||
             (blockStartHour < slotHour && slotHour < blockEndHour);
    });
  };
  
  // Vérifie si le bloc est affiché pour la première fois dans les slots
  const isFirstOccurrence = (block: TimeBlock, slotIndex: number) => {
    const slotHour = parseInt(timeSlots[slotIndex].split(':')[0]);
    const blockStartHour = parseInt(block.startTime.split(':')[0]);
    
    return blockStartHour === slotHour;
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Planning de la journée</h2>
      </div>
      
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <tbody>
            {timeSlots.map((slot, index) => {
              const blocksForSlot = getBlocksForTimeSlot(slot);
              
              return (
                <tr key={slot} className="border-b hover:bg-gray-50">
                  <td className="p-2 border-r w-16 text-center text-sm text-gray-500">
                    {slot}
                  </td>
                  <td className="p-2">
                    {blocksForSlot.map(block => (
                      isFirstOccurrence(block, index) && (
                        <div 
                          key={block.id} 
                          className="mb-2 p-3 rounded cursor-pointer"
                          style={{ backgroundColor: `${getCategoryColor(block.categoryId)}30` }} // Ajout de transparence
                          onClick={() => onBlockSelect(block)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{block.title}</div>
                              <div className="text-sm text-gray-600">
                                {block.startTime} - {block.endTime}
                              </div>
                              {block.categoryId && (
                                <div className="text-xs mt-1 text-gray-500">
                                  Catégorie: {getCategoryName(block.categoryId)}
                                </div>
                              )}
                              {block.description && (
                                <div className="text-sm mt-1">{block.description}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={block.completed}
                                onChange={(e) => onStatusChange(block.id!, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlock(block.id!);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ❌
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeBlockList;