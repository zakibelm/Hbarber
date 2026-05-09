import { useState, useEffect } from 'react';
import { api, socket } from '../api';

// Helper to format HH:MM
const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export function useQueue(shopSlug) {
  const [state, setState] = useState({
    shop: null,
    tickets: [],
    barbers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!shopSlug) return;

    const fetchQueue = async () => {
      try {
        // Fetch shop
        const { data: shop } = await api.get(`/api/shops/${shopSlug}`);
        
        // Fetch today's tickets
        const { data: tickets } = await api.get(`/api/tickets/${shop.id}`);

        // Fetch barbers
        const { data: barbers } = await api.get(`/api/barbers/${shop.id}`);

        const formattedTickets = tickets.map(t => ({
          ...t,
          arrived: formatTime(t.arrived_at),
          calledAt: formatTime(t.called_at),
          servedAt: formatTime(t.served_at),
        }));

        setState({ shop, tickets: formattedTickets, barbers, loading: false, error: null });

      } catch (error) {
        console.error('Error fetching queue:', error);
        setState(s => ({ ...s, loading: false, error: 'Erreur de connexion au serveur' }));
      }
    };

    fetchQueue();

    // Socket.io Realtime update
    socket.on('queue-update', (data) => {
      // Check if update is for our shop
      // if (state.shop && data.shopId === state.shop.id) {
        fetchQueue();
      // }
    });

    return () => {
      socket.off('queue-update');
    };
  }, [shopSlug]);

  return state;
}

export function selectWaiting(tickets) { return tickets.filter((t) => t.status === 'waiting'); }
export function selectCalled(tickets)  { return tickets.find((t) => t.status === 'called') || null; }
export function selectServed(tickets)  { return tickets.filter((t) => t.status === 'served'); }
export function selectSkipped(tickets) { return tickets.filter((t) => t.status === 'skipped'); }
export function positionOf(tickets, ticket) {
  if (!ticket || ticket.status !== 'waiting') return 0;
  return tickets
    .filter((t) => t.status === 'waiting' && t.num < ticket.num)
    .length;
}
export function etaMinutes(shop, tickets, ticket) {
  if (!shop || !tickets || !ticket) return 0;
  const avgService = shop.avg_service_min || 15;
  return Math.max(0, positionOf(tickets, ticket)) * avgService
       + (selectCalled(tickets) ? Math.round(avgService / 2) : 0);
}
