import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '../types';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(typeof window !== 'undefined' ? window.location.origin : '', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
}

export const initSocket = getSocket;

export function useRealtimeSocket(currentUser: User | null, onEvent?: (event: string, data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setLastUpdated(new Date());
      if (currentUser) {
        socket.emit('authenticate', {
          userId: currentUser.id,
          role: currentUser.role,
          portal: currentUser.portal,
          designation: currentUser.designation,
          jurisdiction: {
            ward: currentUser.ward,
            village: currentUser.village,
            district: currentUser.district,
            department: currentUser.department,
          },
        });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    const genericEvents = [
      'complaint:created',
      'complaint:updated',
      'complaint:assigned',
      'complaint:forwarded',
      'complaint:escalated',
      'complaint:resolved',
      'complaint:reopened',
      'notification:new',
      'sla:warning',
      'sla:breached',
      'analytics:updated',
      'auditLog:new',
      'account:status',
    ];

    genericEvents.forEach(evt => {
      socket.on(evt, data => {
        setLastUpdated(new Date());
        if (onEvent) onEvent(evt, data);
      });
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      genericEvents.forEach(evt => socket.off(evt));
    };
  }, [currentUser, onEvent]);

  return { isConnected, lastUpdated, socket: getSocket() };
}
