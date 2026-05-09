import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HB, Eyebrow, TicketNum, Pill, HBButton } from '../design/atoms';
import { useQueue, selectWaiting, selectCalled, selectServed, selectSkipped, updateMockBarber, addMockBarber, deleteMockBarber, updateMockBarberName } from '../store/useQueue';
import { supabase } from '../supabase';
import { sendSMSTour } from '../utils/sms';

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: 1, padding: '20px 0', borderRight: `1px solid ${HB.ink3}` }}>
      <div style={{ color: HB.mute, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: HB.bone, fontSize: 28, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: HB.mute, fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { shopSlug } = useParams();
  const { shop, tickets, barbers, loading } = useQueue(shopSlug);
  const [newBarberName, setNewBarberName] = useState('');
  const [editingBarber, setEditingBarber] = useState(null); // { id, name }
  const [editName, setEditName] = useState('');

  const handleAction = async (ticketId, status) => {
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (shop?.id === 'mock-1') {
       if (status === 'called') alert(`[MOCK] SMS envoyé à ${ticket?.name}`);
       alert(`[MOCK] Statut mis à jour : ${status}`);
       return;
    }

    if (status === 'called' && ticket?.phone) {
      try {
        await sendSMSTour(ticket.phone, ticket.name);
      } catch (err) {
        console.error('Erreur SMS:', err);
      }
    }

    const update = { status };
    if (status === 'called') update.called_at = new Date().toISOString();
    if (status === 'served' || status === 'skipped') update.served_at = new Date().toISOString();

    await supabase.from('tickets').update(update).eq('id', ticketId);
  };

  const toggleBarber = async (id, isActive) => {
    if (shop?.id === 'mock-1') { updateMockBarber(id, isActive); return; }
    await supabase.from('barbers').update({ is_active: isActive }).eq('id', id);
  };

  const addBarber = async (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    if (shop?.id === 'mock-1') { addMockBarber(newBarberName.trim()); setNewBarberName(''); return; }
    await supabase.from('barbers').insert([{ shop_id: shop.id, name: newBarberName.trim(), is_active: true }]);
    setNewBarberName('');
  };

  const deleteBarber = async (id) => {
    if (!confirm('Supprimer ce coiffeur ?')) return;
    if (shop?.id === 'mock-1') { deleteMockBarber(id); return; }
    await supabase.from('barbers').delete().eq('id', id);
  };

  const renameBarber = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (shop?.id === 'mock-1') { updateMockBarberName(editingBarber.id, editName.trim()); setEditingBarber(null); return; }
    await supabase.from('barbers').update({ name: editName.trim() }).eq('id', editingBarber.id);
    setEditingBarber(null);
  };

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const waiting = selectWaiting(tickets);
  const called = selectCalled(tickets);
  const served = selectServed(tickets);

  return (
    <div style={{ minHeight: '100vh', background: HB.ink, color: HB.bone, fontFamily: HB.sans, display: 'flex', flexDirection: 'column' }}>
      {/* Header / Nav */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HB.ink3}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: HB.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: HB.serif, fontWeight: 700, color: HB.ink, fontSize: 20 }}>H</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>{shop.name} <span style={{ color: HB.gold, fontStyle: 'italic' }}>console</span></div>
            <div style={{ fontSize: 11, color: HB.mute, textTransform: 'uppercase', letterSpacing: 1 }}>Plateau • {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <HBButton kind="ghost" small>FILE OUVERTE</HBButton>
          <div style={{ width: 32, height: 32, borderRadius: 4, border: `1px solid ${HB.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HB.mute }}>?</div>
          <div style={{ width: 32, height: 32, borderRadius: 4, border: `1px solid ${HB.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HB.mute }}>⚙️</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: 40 }}>
          
          {/* Stats Row */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${HB.ink3}`, paddingBottom: 10 }}>
            <StatCard label="En attente" value={waiting.length} sub={`${tickets.filter(t => t.status !== 'served').length} tickets actifs`} />
            <StatCard label="Servis • Jour" value={served.length} sub="14 hier • +21%" />
            <StatCard label="Temps Moyen" value="14m" sub="objectif 15m" />
            <StatCard label="No-Show" value="1" sub="sur 19 inscrits" />
          </div>

          <div style={{ display: 'flex', gap: 40 }}>
            {/* Left Column: Au Fauteuil & File */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 40 }}>
              
              {/* Au Fauteuil Card */}
              <div style={{ background: HB.ink2, borderRadius: 12, padding: 32, border: `1px solid ${HB.ink3}`, position: 'relative' }}>
                <Eyebrow style={{ marginBottom: 24, fontSize: 10 }}>AU FAUTEUIL</Eyebrow>
                {called ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    <div style={{ fontSize: 100, fontWeight: 700, fontFamily: HB.sans, color: HB.gold, opacity: 0.8, letterSpacing: -5 }}>
                      N°{String(called.num).padStart(3, '0')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{called.name}</div>
                      <div style={{ color: HB.mute, fontSize: 14 }}>{called.service} • Arrivé {called.arrived}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <Pill>SMS</Pill>
                        <Pill>NOTE</Pill>
                        <Pill>PHOTO</Pill>
                      </div>
                    </div>
                    <div>
                      <HBButton style={{ padding: '20px 40px', fontSize: 18 }} onClick={() => handleAction(called.id, 'served')}>
                        TERMINER<br/><span style={{ fontSize: 12, opacity: 0.7 }}>SUIVANT</span>
                      </HBButton>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HB.mute, fontStyle: 'italic' }}>
                    Aucun client au fauteuil. Appelez le prochain.
                  </div>
                )}
              </div>

              {/* File d'attente List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Eyebrow size={10}>FILE D'ATTENTE • {waiting.length}</Eyebrow>
                  <div style={{ fontSize: 10, color: HB.gold, fontWeight: 700 }}>• TEMPS RÉEL</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {waiting.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: HB.ink2, border: `1px solid ${HB.ink3}`, borderRadius: 4 }}>
                      <div style={{ width: 40, color: HB.mute, fontSize: 14, fontWeight: 700 }}>{i + 1}</div>
                      <div style={{ width: 80 }}>
                        <TicketNum n={t.num} size={36} color={HB.bone} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: HB.mute }}>{t.service} • Arrivé {t.arrived}</div>
                      </div>
                      <div style={{ color: HB.mute, fontSize: 12, marginRight: 24 }}>~7m</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <HBButton kind="ghost" small onClick={() => handleAction(t.id, 'called')}>APPELER</HBButton>
                        <HBButton kind="ghost" small onClick={() => handleAction(t.id, 'skipped')}>ABSENT</HBButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: History & Barbers */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40 }}>
              
              {/* Aujourd'hui Card */}
              <div style={{ background: HB.ink2, borderRadius: 12, padding: 24, border: `1px solid ${HB.ink3}` }}>
                <Eyebrow style={{ marginBottom: 16 }}>AUJOURD'HUI</Eyebrow>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</div>
                <div style={{ fontSize: 12, color: HB.mute, marginBottom: 24 }}>Ouverture 09:00 • Fermeture 19:00</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                  {[4, 6, 8, 5, 9, 12, 15, 10, 8, 4].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 6 ? HB.gold : HB.ink3, height: `${(h/15)*100}%`, borderRadius: 2 }} />
                  ))}
                </div>
              </div>

              {/* Historique Mini */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Eyebrow size={10}>HISTORIQUE</Eyebrow>
                  <div style={{ fontSize: 10, fontWeight: 700, color: HB.mute }}>TOUT VOIR</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {served.slice(0, 5).map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: HB.mute, paddingBottom: 8, borderBottom: `1px solid ${HB.ink3}` }}>
                      <span>#{t.num} {t.name}</span>
                      <span>{t.servedAt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barber Management */}
              <div style={{ borderTop: `1px solid ${HB.ink3}`, paddingTop: 24 }}>
                <Eyebrow style={{ marginBottom: 16 }}>COIFFEURS</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {barbers?.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, group: 'true' }}>
                      <input type="checkbox" checked={b.is_active} onChange={() => toggleBarber(b.id, !b.is_active)} />
                      
                      {editingBarber?.id === b.id ? (
                        <form onSubmit={renameBarber} style={{ flex: 1, display: 'flex', gap: 8 }}>
                          <input 
                            autoFocus
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => setEditingBarber(null)}
                            style={{ background: HB.ink3, border: 'none', color: HB.bone, fontSize: 13, padding: '2px 8px', borderRadius: 4, width: '100%' }}
                          />
                        </form>
                      ) : (
                        <>
                          <span 
                            style={{ fontSize: 14, color: b.is_active ? HB.bone : HB.mute, flex: 1, cursor: 'pointer' }}
                            onDoubleClick={() => { setEditingBarber(b); setEditName(b.name); }}
                          >
                            {b.name}
                          </span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => { setEditingBarber(b); setEditName(b.name); }}
                              style={{ background: 'none', border: 'none', color: HB.mute, fontSize: 10, cursor: 'pointer', padding: 4 }}
                            >
                              ÉDITER
                            </button>
                            <button 
                              onClick={() => deleteBarber(b.id)}
                              style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 10, cursor: 'pointer', padding: 4 }}
                            >
                              SUPPR.
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <form onSubmit={addBarber} style={{ marginTop: 8 }}>
                    <input 
                      value={newBarberName} 
                      onChange={(e) => setNewBarberName(e.target.value)}
                      placeholder="+ Ajouter"
                      style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${HB.hairline}`, color: HB.bone, fontSize: 14, padding: '4px 0', width: '100%' }}
                    />
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
