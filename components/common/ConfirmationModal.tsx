import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  return (
    <Modal isOpen={true} onClose={onCancel} title={title} className="max-w-md">
      <div className="p-6">
        <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-2">
          {title}
        </h2>
        <p className="text-brand-text-secondary">{description}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-colors">
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
