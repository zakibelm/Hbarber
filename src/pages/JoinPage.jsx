import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HB, Eyebrow, Pill, HBButton } from '../design/atoms';
import { useQueue, selectWaiting, selectCalled } from '../store/useQueue';
import { supabase } from '../supabase';

export function ShopChip({ small, name, slug }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: small ? 26 : 30, height: small ? 26 : 30, borderRadius: '50%',
        border: `1px solid ${HB.gold}`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: HB.serif, fontStyle: 'italic', fontWeight: 700,
          fontSize: small ? 14 : 16, color: HB.gold, lineHeight: 1,
        }}>H</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{
          fontFamily: HB.serif, color: HB.bone, fontSize: small ? 13 : 14,
          fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>{name || 'H Barber'}</span>
        <span style={{
          fontFamily: HB.sans, color: HB.mute, fontSize: 9, fontWeight: 600,
          letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 2,
        }}>{slug || 'mtl'}</span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, hint }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(20,16,12,0.5)', color: HB.bone,
        border: `1px solid ${HB.hairline}`, borderRadius: 0,
        padding: '14px 14px', fontFamily: HB.sans, fontSize: 16,
        fontWeight: 500, letterSpacing: 0.2, outline: 'none',
      }} onFocus={(e) => e.target.style.borderColor = HB.gold}
        onBlur={(e) => e.target.style.borderColor = HB.hairline}/>
      {hint && <div style={{ fontSize: 11, color: HB.mute, marginTop: 6, fontStyle: 'italic' }}>{hint}</div>}
    </div>
  );
}

export default function JoinPage() {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const { shop, tickets, barbers, loading } = useQueue(shopSlug);
  
  const waiting = tickets ? selectWaiting(tickets) : [];
  const eta = waiting.length * (shop?.avg_service_min || 15) + (selectCalled(tickets) ? 7 : 0);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Coupe + barbe');
  const [barberId, setBarberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeBarbers = barbers?.filter(b => b.is_active) || [];

  const handleJoin = async () => {
    if (!name.trim()) return alert('Veuillez entrer votre nom');
    setIsSubmitting(true);
    
    try {
      if (shop?.id === 'mock-1') {
        // Mock fallback mode
        setTimeout(() => navigate(`/${shopSlug}/ticket/mock-tnew`), 500);
        return;
      }
      
      const { data, error } = await supabase
        .from('tickets')
        .insert([{ 
          shop_id: shop.id,
          name, 
          phone, 
          service,
          barber_id: barberId,
          status: 'waiting'
        }])
        .select()
        .single();
        
      if (error) throw error;
      navigate(`/${shopSlug}/ticket/${data.id}`);
      
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const mobileBg = (
    <div style={{
      position: 'absolute', inset: 0, background: HB.ink, zIndex: -1,
      backgroundImage:
        `radial-gradient(120% 80% at 50% -10%, rgba(212,178,108,0.18), transparent 60%),` +
        `radial-gradient(80% 60% at 50% 110%, rgba(212,178,108,0.08), transparent 70%)`,
    }} />
  );

  return (
    <div className="animate-fade-in" style={{ position: 'relative', color: HB.bone, fontFamily: HB.sans, overflowX: 'hidden', minHeight: '100vh', maxWidth: '480px', margin: '0 auto' }}>
      {mobileBg}
      <div style={{ padding: '40px 26px 30px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/')} style={{
              background: 'transparent', border: `1px solid ${HB.hairline}`,
              color: HB.bone, width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <ShopChip name={shop.name} slug={shop.slug} />
          </div>
          <Pill color={shop.is_open ? HB.ok : HB.mute}>{shop.is_open ? 'Ouvert' : 'Fermé'}</Pill>
        </div>

        <div style={{ marginTop: 38 }} className="animate-slide-up">
          <Eyebrow>Bienvenue</Eyebrow>
          <h1 style={{
            fontFamily: HB.serif, fontWeight: 600, fontSize: 38, lineHeight: 1.05,
            margin: '10px 0 0', letterSpacing: -0.5, color: HB.bone,
          }}>
            Prenez votre<br/>
            <span style={{ fontStyle: 'italic', color: HB.gold }}>place</span>
            <span style={{ color: HB.mute, fontWeight: 300 }}> en file.</span>
          </h1>
          <p style={{ marginTop: 14, color: HB.mute, fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
            Pas d'application à télécharger. Inscrivez-vous, attendez où vous voulez, on vous appelle quand c'est votre tour.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '24px 0 22px' }} className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {[
            { label: 'En attente', val: waiting.length },
            { label: 'Attente est.', val: `~${eta}m` },
            { label: 'Barbiers', val: '2' },
          ].map((m, i) => (
            <div key={i} style={{
              flex: 1, padding: '12px 12px 10px',
              border: `1px solid ${HB.hairline}`, background: 'rgba(20,16,12,0.5)',
            }}>
              <div style={{ fontFamily: HB.serif, fontSize: 24, fontWeight: 700, color: HB.bone, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{m.val}</div>
              <div style={{ fontFamily: HB.sans, fontSize: 9, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: HB.mute, marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <Field label="Votre nom" value={name} onChange={setName} />
          <Field label="Téléphone" value={phone} onChange={setPhone} hint="Notif SMS quand c'est votre tour" />
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>Service</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Coupe', 'Coupe + barbe', 'Dégradé', 'Barbe'].map((s) => (
                <button key={s} onClick={() => setService(s)} style={{
                  padding: '9px 14px', fontFamily: HB.sans, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${service === s ? HB.gold : HB.hairline}`,
                  background: service === s ? `${HB.gold}1A` : 'transparent',
                  color: service === s ? HB.gold : HB.bone,
                  borderRadius: 0, letterSpacing: 0.3,
                  transition: 'all 0.2s'
                }}>{s}</button>
              ))}
            </div>
          </div>
          
          {activeBarbers.length > 0 && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Coiffeur</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button onClick={() => setBarberId(null)} style={{
                  padding: '9px 14px', fontFamily: HB.sans, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${barberId === null ? HB.gold : HB.hairline}`,
                  background: barberId === null ? `${HB.gold}1A` : 'transparent',
                  color: barberId === null ? HB.gold : HB.bone,
                  borderRadius: 0, letterSpacing: 0.3,
                  transition: 'all 0.2s'
                }}>Peu importe</button>
                {activeBarbers.map((b) => (
                  <button key={b.id} onClick={() => setBarberId(b.id)} style={{
                    padding: '9px 14px', fontFamily: HB.sans, fontSize: 12,
                    fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${barberId === b.id ? HB.gold : HB.hairline}`,
                    background: barberId === b.id ? `${HB.gold}1A` : 'transparent',
                    color: barberId === b.id ? HB.gold : HB.bone,
                    borderRadius: 0, letterSpacing: 0.3,
                    transition: 'all 0.2s'
                  }}>{b.name}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 22 }}>
          <HBButton full onClick={handleJoin} disabled={isSubmitting || !shop.is_open}>
            {isSubmitting ? 'Inscription...' : 'Rejoindre la file'}
            {!isSubmitting && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h8M8 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </HBButton>
          <p style={{ fontSize: 10.5, color: HB.mute, textAlign: 'center', marginTop: 12, letterSpacing: 0.2 }}>
            On garde vos infos pour aujourd'hui seulement.
          </p>
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: HB.mute, borderTop: `1px solid ${HB.hairline}`, paddingTop: 16 }}>
            <p style={{ margin: '0 0 4px' }}>📍 555 Boul. Lacombe Local K, Repentigny, QC J5Z 3B5</p>
            <p style={{ margin: 0 }}>📞 (514) 583-4712</p>
          </div>
        </div>
      </div>
    </div>
  );
}
