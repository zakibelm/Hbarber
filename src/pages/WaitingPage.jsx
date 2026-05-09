import { useParams } from 'react-router-dom';
import { HB, Eyebrow, TicketNum, Pill, GoldRule } from '../design/atoms';
import { useQueue, positionOf, etaMinutes } from '../store/useQueue';
import { ShopChip } from './JoinPage';

export default function WaitingPage() {
  const { shopSlug, ticketId } = useParams();
  const { shop, tickets, loading } = useQueue(shopSlug);

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const myTicket = tickets?.find(t => t.id === ticketId);

  if (!myTicket) return <div style={{ color: HB.bone, padding: 20 }}>Ticket introuvable</div>;

  const pos = positionOf(tickets, myTicket);
  const eta = etaMinutes(shop, tickets, myTicket);

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
            <button onClick={() => window.location.href = '/'} style={{
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
        </div>

        {myTicket.status === 'called' ? (
          <div className="animate-slide-up" style={{
            background: HB.gold, color: HB.ink, padding: '30px', margin: '60px -10px 0',
            textAlign: 'center', boxShadow: `0 0 40px ${HB.gold}40`
          }}>
            <h2 style={{ fontFamily: HB.serif, fontSize: 32, margin: 0, fontWeight: 700, fontStyle: 'italic' }}>C'est à vous!</h2>
            <p style={{ margin: '10px 0 0', fontWeight: 600 }}>Approchez-vous du comptoir.</p>
          </div>
        ) : myTicket.status === 'served' ? (
          <div className="animate-slide-up" style={{ textAlign: 'center', marginTop: 80 }}>
            <h2 style={{ fontFamily: HB.serif, fontSize: 32, margin: 0, color: HB.ok }}>Merci!</h2>
            <p style={{ margin: '10px 0 0', color: HB.mute }}>À la prochaine.</p>
          </div>
        ) : (
          <div className="animate-slide-up" style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Eyebrow style={{ marginBottom: 16 }}>Votre Numéro</Eyebrow>
            <TicketNum n={myTicket.num} size={110} />
            
            <div style={{ marginTop: 24, padding: '6px 16px', background: `${HB.bone}1A`, borderRadius: 999 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>{myTicket.name}</span>
              <span style={{ margin: '0 8px', color: HB.mute }}>|</span>
              <span style={{ fontSize: 13, color: HB.mute }}>{myTicket.service}</span>
            </div>

            <div style={{ margin: '40px 0', width: '100%' }}><GoldRule opacity={0.2} /></div>

            <div style={{ display: 'flex', width: '100%', gap: 10 }}>
              <div style={{ flex: 1, padding: '16px', background: 'rgba(20,16,12,0.5)', border: `1px solid ${HB.hairline}` }}>
                <Eyebrow style={{ marginBottom: 8 }}>Avant vous</Eyebrow>
                <div style={{ fontFamily: HB.serif, fontSize: 36, fontWeight: 700, color: HB.bone, lineHeight: 1 }}>{pos}</div>
                <div style={{ fontSize: 11, color: HB.mute, marginTop: 4 }}>personnes</div>
              </div>
              <div style={{ flex: 1, padding: '16px', background: 'rgba(20,16,12,0.5)', border: `1px solid ${HB.hairline}` }}>
                <Eyebrow style={{ marginBottom: 8 }}>Temps est.</Eyebrow>
                <div style={{ fontFamily: HB.serif, fontSize: 36, fontWeight: 700, color: HB.bone, lineHeight: 1 }}>{eta}</div>
                <div style={{ fontSize: 11, color: HB.mute, marginTop: 4 }}>minutes</div>
              </div>
            </div>

            <p style={{ marginTop: 30, fontSize: 13, color: HB.mute, lineHeight: 1.5, padding: '0 20px' }}>
              Vous recevrez un SMS 10 minutes avant votre tour.<br/>
              <span style={{ color: HB.gold }}>Vous pouvez quitter le salon.</span>
            </p>
          </div>
        )}

        <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 11, color: HB.mute, borderTop: `1px solid ${HB.hairline}`, paddingTop: 16, paddingBottom: 16 }}>
          <p style={{ margin: '0 0 4px' }}>📍 555 Boul. Lacombe Local K, Repentigny, QC J5Z 3B5</p>
          <p style={{ margin: 0 }}>📞 (514) 583-4712</p>
        </div>
      </div>
    </div>
  );
}
