import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);

  const confirm = (opts: ConfirmationOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (options) {
      options.onConfirm();
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel}></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{options.title}</h3>
              <p className="text-sm text-gray-500">{options.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
              <Button variant="ghost" onClick={handleCancel}>
                {options.cancelText || 'Cancel'}
              </Button>
              <Button 
                variant={options.variant === 'danger' ? 'danger' : 'primary'} 
                onClick={handleConfirm}
              >
                {options.confirmText || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};
