import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// Helper to format HH:MM
const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Global mock state for demonstration without database
export const mockState = {
  shop: { id: 'mock-1', name: 'H Barber Shop', slug: 'h-barber-mtl', avg_service_min: 15, is_open: true, phone: '514 583-4712' },
  tickets: [
    { id: 't1', num: 41, name: 'Julien R.', status: 'called', arrived: '14:01', calledAt: '14:23', service: 'Coupe', barber_id: 'b1' },
    { id: 't2', num: 42, name: 'Marcus T.', status: 'waiting', arrived: '14:10', service: 'Coupe + barbe', barber_id: null },
  ],
  barbers: [
    { id: 'b1', name: 'Zaki', is_active: true },
    { id: 'b2', name: 'Hamza', is_active: true },
    { id: 'b3', name: 'Karim', is_active: false }
  ]
};

export function updateMockBarber(id, isActive) {
  const b = mockState.barbers.find(x => x.id === id);
  if (b) b.is_active = isActive;
  window.dispatchEvent(new Event('mock-update'));
}

export function addMockBarber(name) {
  mockState.barbers.push({ id: 'b' + Date.now(), name, is_active: true });
  window.dispatchEvent(new Event('mock-update'));
}

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

    let ticketSubscription;

    const fetchQueue = async () => {
      try {
        // Fetch shop
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', shopSlug)
          .single();

        if (shopError) throw shopError;

        // Fetch today's tickets
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .eq('shop_id', shop.id)
          .gte('arrived_at', today.toISOString())
          .order('num', { ascending: true });

        if (ticketsError) throw ticketsError;

        // Fetch barbers
        const { data: barbers, error: barbersError } = await supabase
          .from('barbers')
          .select('*')
          .eq('shop_id', shop.id)
          .order('name', { ascending: true });

        if (barbersError) throw barbersError;

        const formattedTickets = tickets.map(t => ({
          ...t,
          arrived: formatTime(t.arrived_at),
          calledAt: formatTime(t.called_at),
          servedAt: formatTime(t.served_at),
        }));

        setState({ shop, tickets: formattedTickets, barbers, loading: false, error: null });

        // Subscribe to real-time changes
        ticketSubscription = supabase
          .channel('public:tickets')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'tickets',
            filter: `shop_id=eq.${shop.id}` 
          }, payload => {
            // Re-fetch to keep it simple and ensure correct order/formatting
            // In a highly optimized app, we'd patch the local state here
            fetchQueue();
          })
          .subscribe();

        const barberSubscription = supabase
          .channel('public:barbers')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'barbers',
            filter: `shop_id=eq.${shop.id}`
          }, payload => {
            fetchQueue();
          })
          .subscribe();

        // Assign to a ref or just keep track to unsubscribe
        ticketSubscription = [ticketSubscription, barberSubscription];

      } catch (error) {
        // Fallback to mock data if DB isn't set up yet for demonstration purposes
        console.error('Error fetching queue:', error);
        setState({
          shop: { ...mockState.shop, slug: shopSlug },
          tickets: [...mockState.tickets],
          barbers: [...mockState.barbers],
          loading: false,
          error: null
        });
      }
    };

    fetchQueue();
    
    window.addEventListener('mock-update', fetchQueue);

    return () => {
      window.removeEventListener('mock-update', fetchQueue);
      if (ticketSubscription) {
        if (Array.isArray(ticketSubscription)) {
          ticketSubscription.forEach(sub => supabase.removeChannel(sub));
        } else {
          supabase.removeChannel(ticketSubscription);
        }
      }
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
