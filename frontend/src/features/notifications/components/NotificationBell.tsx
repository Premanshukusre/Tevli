import { useState, useRef, useEffect } from 'react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, Notification } from '../queries';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);

    // Deep linking logic using the exact entity details
    if (notification.project_id && notification.task_id) {
      navigate(`/projects/${notification.project_id}?taskId=${notification.task_id}`);
    } else if (notification.project_id) {
      navigate(`/projects/${notification.project_id}`);
    } else if (notification.type === 'TASK_ASSIGNED' || notification.type === 'COMMENT_ADDED') {
      navigate('/my-tasks');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-medium text-primary-600 hover:text-primary-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                <svg className="w-8 h-8 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                You're all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((n: Notification) => (
                  <li key={n.id}>
                    <button 
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}
                    >
                      <div className="w-8 h-8 shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {n.actor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">{n.actor.name}</span>
                          {n.type === 'TASK_ASSIGNED' && ' assigned a task to you.'}
                          {n.type === 'COMMENT_ADDED' && ' commented on a task you follow.'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.read && <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1"></div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
