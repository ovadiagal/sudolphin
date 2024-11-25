import React from 'react';

interface GeneratedTestPreviewModalProps {
  material: any;
  onClose: () => void;
  onDelete: () => void;
}

const GeneratedTestPreviewModal: React.FC<GeneratedTestPreviewModalProps> = ({ material, onClose, onDelete }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{material.title}</h2>
        <p>{material.content}</p>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default GeneratedTestPreviewModal;