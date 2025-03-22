import React from 'react';

interface JournalTagProps {
  tag: string;
  onRemove?: () => void;
}

const JournalTag: React.FC<JournalTagProps> = ({ tag, onRemove }) => {
  return (
    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">
      #{tag}
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }} 
          className="ml-1 text-blue-500 hover:text-blue-700"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default JournalTag;