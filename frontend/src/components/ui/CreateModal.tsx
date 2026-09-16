import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  placeholder?: string;
  contextMessage?: React.ReactNode;
  submitText?: string;
  onSubmit: (name: string) => Promise<void>;
  isPending: boolean;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  title,
  label,
  placeholder,
  contextMessage,
  submitText = 'Create',
  onSubmit,
  isPending
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(`${label} is required`);
      return;
    }
    
    setError('');
    try {
      await onSubmit(trimmed);
    } catch (err: any) {
      setError(err.message || 'An error occurred during creation');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && onClose()}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            
            {contextMessage && (
              <div className="text-sm text-gray-500 mb-4">{contextMessage}</div>
            )}

            <div className="space-y-1">
              <Input
                label={label}
                type="text"
                placeholder={placeholder}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isPending}
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Creating...' : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
