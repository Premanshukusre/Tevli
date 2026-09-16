import React, { useEffect, useRef } from 'react';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div 
        ref={drawerRef}
        className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-primary-50 text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 text-sm">
          
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-xs">Workspaces & Projects</h3>
            <p className="text-gray-600 leading-relaxed">
              Tevli organizes work into <strong className="font-medium text-gray-900">Workspaces</strong> (for your organization or team) and <strong className="font-medium text-gray-900">Projects</strong> (for specific initiatives). 
              Use the Global Create menu to quickly start a new workspace or project.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-xs">Tasks & Kanban</h3>
            <p className="text-gray-600 leading-relaxed">
              Each project has its own Kanban board. You can drag and drop tasks between <span className="font-medium">To Do</span>, <span className="font-medium">In Progress</span>, and <span className="font-medium">Done</span>. 
              Click any task to view its details, assign team members, and add comments.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-xs">Collaboration</h3>
            <p className="text-gray-600 leading-relaxed">
              Invite team members via the Workspace or Project settings. Updates to tasks and new comments sync in real-time across your team using WebSockets.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-xs">Keyboard Shortcuts</h3>
            <ul className="space-y-2 mt-2">
              <li className="flex justify-between items-center text-gray-600">
                <span>Global Search</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-mono font-medium shadow-sm text-gray-500">Cmd/Ctrl + K</kbd>
              </li>
              <li className="flex justify-between items-center text-gray-600">
                <span>Close Modals</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-mono font-medium shadow-sm text-gray-500">Esc</kbd>
              </li>
            </ul>
          </section>
          
          <div className="pt-4 mt-6 border-t border-gray-200">
            <a 
              href="mailto:support@tevli.com" 
              className="flex items-center justify-center w-full py-2.5 px-4 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
