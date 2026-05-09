import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HB, Eyebrow, TicketNum, Pill, HBButton } from '../design/atoms';
import { useQueue, selectWaiting, selectCalled, selectServed, selectSkipped, updateMockBarber, addMockBarber } from '../store/useQueue';
import { supabase } from '../supabase';
import { sendSMSTour } from '../utils/sms';

function QueueRow({ t, isCalled, onAction }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '16px 20px',
      borderBottom: `1px solid ${HB.ink3}`,
      background: isCalled ? `${HB.gold}0D` : 'transparent',
      transition: 'all 0.2s'
    }}>
      <div style={{ width: 80 }}>
        <TicketNum n={t.num} size={32} color={isCalled ? HB.gold : HB.bone} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: isCalled ? HB.gold : HB.bone, letterSpacing: 0.3 }}>{t.name}</div>
        <div style={{ fontSize: 13, color: HB.mute, marginTop: 2 }}>{t.service} • {t.phone || 'Pas de tél'} • Arr: {t.arrived}</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {isCalled ? (
          <>
            <HBButton kind="danger" onClick={() => onAction(t.id, 'skipped')}>Passer</HBButton>
            <HBButton onClick={() => onAction(t.id, 'served')}>Terminé</HBButton>
          </>
        ) : (
          <HBButton kind="ghost" onClick={() => onAction(t.id, 'called')}>Appeler</HBButton>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { shopSlug } = useParams();
  const { shop, tickets, barbers, loading } = useQueue(shopSlug);
  const [newBarberName, setNewBarberName] = useState('');

  const toggleBarber = async (id, isActive) => {
    if (shop?.id === 'mock-1') {
      updateMockBarber(id, isActive);
      return;
    }
    await supabase.from('barbers').update({ is_active: isActive }).eq('id', id);
  };

  const addBarber = async (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    if (shop?.id === 'mock-1') {
      addMockBarber(newBarberName.trim());
      setNewBarberName('');
      return;
    }
    await supabase.from('barbers').insert([{ shop_id: shop.id, name: newBarberName.trim(), is_active: true }]);
    setNewBarberName('');
  };

  const handleAction = async (ticketId, status) => {
    // Find the ticket to get the phone number
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (shop?.id === 'mock-1') {
       if (status === 'called') {
         alert(`[MOCK] SMS envoyé à ${ticket?.name || 'Client'} (+1 514 ...)`);
       }
       alert(`[MOCK] Mise à jour du ticket ${ticketId} vers ${status}`);
       return;
    }

    if (status === 'called' && ticket?.phone) {
      try {
        await sendSMSTour(ticket.phone, ticket.name);
        alert(`🔔 SMS de notification envoyé à ${ticket.name} !`);
      } catch (err) {
        alert(`❌ Erreur lors de l'envoi du SMS : ${err.message}`);
      }
    }

    const update = { status };
    if (status === 'called') update.called_at = new Date().toISOString();
    if (status === 'served' || status === 'skipped') update.served_at = new Date().toISOString();

    const { error } = await supabase
      .from('tickets')
      .update(update)
      .eq('id', ticketId);

    if (error) {
      console.error(error);
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const waiting = selectWaiting(tickets);
  const called = selectCalled(tickets);
  const served = selectServed(tickets);

  return (
    <div style={{ display: 'flex', height: '100vh', background: HB.ink, color: HB.bone, fontFamily: HB.sans }}>
      {/* Sidebar */}
      <div style={{ width: 280, background: HB.ink2, borderRight: `1px solid ${HB.ink3}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px 24px', borderBottom: `1px solid ${HB.ink3}` }}>
          <div style={{ fontFamily: HB.serif, fontSize: 24, fontWeight: 700, fontStyle: 'italic', color: HB.gold }}>{shop.name}</div>
          <div style={{ fontSize: 13, color: HB.mute, marginTop: 4, letterSpacing: 0.5 }}>Admin Dashboard</div>
        </div>
        
        <div style={{ padding: '24px', borderBottom: `1px solid ${HB.ink3}` }}>
          <Eyebrow style={{ marginBottom: 16 }}>Statistiques du jour</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: HB.mute, fontSize: 14 }}>En attente</span>
              <span style={{ fontWeight: 700 }}>{waiting.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: HB.mute, fontSize: 14 }}>Servis</span>
              <span style={{ fontWeight: 700 }}>{served.length}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <Eyebrow style={{ marginBottom: 16 }}>Coiffeurs</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {barbers?.map(b => (
              <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={b.is_active} onChange={() => toggleBarber(b.id, !b.is_active)} />
                <span style={{ color: b.is_active ? HB.bone : HB.mute, fontSize: 14 }}>{b.name}</span>
              </label>
            ))}
            <form onSubmit={addBarber} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input 
                value={newBarberName} 
                onChange={(e) => setNewBarberName(e.target.value)} 
                placeholder="Nouveau..." 
                style={{ flex: 1, padding: '6px 10px', background: 'transparent', border: `1px solid ${HB.ink3}`, color: HB.bone, borderRadius: 4, outline: 'none' }} 
              />
              <button type="submit" style={{ background: HB.gold, border: 'none', color: HB.ink, padding: '0 12px', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 40px', borderBottom: `1px solid ${HB.ink3}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: HB.serif, fontSize: 28, margin: 0, fontWeight: 600 }}>File d'attente</h2>
          <Pill color={HB.ok}>En direct</Pill>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
          {called && (
            <div style={{ marginBottom: 40 }}>
              <Eyebrow style={{ marginBottom: 12, color: HB.gold }}>En cours de service</Eyebrow>
              <div style={{ background: HB.ink2, borderRadius: 8, border: `1px solid ${HB.gold}40`, overflow: 'hidden' }}>
                <QueueRow t={called} isCalled onAction={handleAction} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
            {/* File Générale */}
            <div>
              <Eyebrow style={{ marginBottom: 12 }}>File Générale ({waiting.filter(t => !t.barber_id).length})</Eyebrow>
              <div style={{ background: HB.ink2, borderRadius: 8, border: `1px solid ${HB.ink3}`, overflow: 'hidden' }}>
                {waiting.filter(t => !t.barber_id).length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: HB.mute, fontSize: 13 }}>Vide.</div>
                ) : (
                  waiting.filter(t => !t.barber_id).map(t => <QueueRow key={t.id} t={t} onAction={handleAction} />)
                )}
              </div>
            </div>

            {/* Files par coiffeur actif */}
            {barbers?.filter(b => b.is_active).map(b => {
              const bTickets = waiting.filter(t => t.barber_id === b.id);
              return (
                <div key={b.id}>
                  <Eyebrow style={{ marginBottom: 12, color: HB.gold }}>File: {b.name} ({bTickets.length})</Eyebrow>
                  <div style={{ background: HB.ink2, borderRadius: 8, border: `1px solid ${HB.ink3}`, overflow: 'hidden' }}>
                    {bTickets.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: HB.mute, fontSize: 13 }}>Vide.</div>
                    ) : (
                      bTickets.map(t => <QueueRow key={t.id} t={t} onAction={handleAction} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
