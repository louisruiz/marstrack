import React, { useState } from 'react';

interface MediaPanelProps {
  attachments: string[];
  onAddAttachment: (path: string) => void;
  onRemoveAttachment: (index: number) => void;
}

const MediaPanel: React.FC<MediaPanelProps> = ({ 
  attachments, 
  onAddAttachment,
  onRemoveAttachment
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const handleSelectFile = async () => {
    setIsSelecting(true);
    
    try {
      // Dans une vraie app Electron, utilisez dialog.showOpenDialog
      // Ici, nous utilisons un simple prompt pour simuler
      const filePath = prompt('Entrez le chemin du fichier:');
      
      if (filePath) {
        onAddAttachment(filePath);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Médias et captures d'écran</h3>
        <button
          onClick={handleSelectFile}
          disabled={isSelecting}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSelecting ? 'Sélection...' : '+ Ajouter'}
        </button>
      </div>

      {attachments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucun média attaché à cette entrée
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {attachments.map((path, index) => (
            <div key={index} className="relative group">
              <div className="border rounded p-2 h-24 flex items-center justify-center bg-gray-50">
                <div className="text-sm truncate max-w-full">
                  {path.split('/').pop()}
                </div>
              </div>
              <button
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveAttachment(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPanel;