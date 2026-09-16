import { useEffect, useState } from 'react';
import { socketClient } from '../../../lib/socket';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    const socket = socketClient.getSocket();
    if (!socket) return;

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnect = () => setStatus('reconnecting');

    // Initial state
    if (socket.connected) setStatus('connected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnect);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnect);
    };
  }, []);

  if (status === 'connected') {
    return <div className="flex items-center text-xs text-green-600" title="Live"><span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Live</div>;
  }
  if (status === 'reconnecting') {
    return <div className="flex items-center text-xs text-yellow-600" title="Reconnecting..."><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1 animate-pulse"></span> Reconnecting</div>;
  }
  return <div className="flex items-center text-xs text-gray-400" title="Offline"><span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Offline</div>;
};
