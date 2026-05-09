import { useParams } from 'react-router-dom';
import { HB, HBLogo, TicketNum, Eyebrow } from '../design/atoms';
import { useQueue, selectWaiting, selectCalled } from '../store/useQueue';

export default function DisplayPage() {
  const { shopSlug } = useParams();
  const { shop, tickets, loading } = useQueue(shopSlug);

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const waiting = selectWaiting(tickets);
  const called = selectCalled(tickets);

  return (
    <div style={{ 
      display: 'flex', height: '100vh', background: HB.ink, 
      color: HB.bone, fontFamily: HB.sans, overflow: 'hidden'
    }}>
      {/* Called Ticket Section */}
      <div style={{ 
        flex: 1.2, display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle at center, ${HB.ink2} 0%, ${HB.ink} 100%)`,
        position: 'relative'
      }}>
        {called ? (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontFamily: HB.sans, fontSize: 32, fontWeight: 700, 
              letterSpacing: 8, textTransform: 'uppercase', color: HB.gold,
              marginBottom: 40 
            }}>C'est à vous</div>
            <TicketNum n={called.num} size={280} color={HB.bone} />
            <div style={{ 
              fontFamily: HB.serif, fontSize: 64, fontWeight: 600, 
              fontStyle: 'italic', marginTop: 30 
            }}>
              {called.name}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <HBLogo size={180} />
            <div style={{ marginTop: 40, fontFamily: HB.serif, fontSize: 32, fontStyle: 'italic' }}>
              En attente du prochain client
            </div>
          </div>
        )}
      </div>

      {/* Waiting List Section */}
      <div style={{ 
        flex: 1, background: HB.ink2, borderLeft: `1px solid ${HB.ink3}`,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '40px 60px', borderBottom: `1px solid ${HB.ink3}` }}>
          <Eyebrow size={14}>En attente ({waiting.length})</Eyebrow>
        </div>
        <div style={{ flex: 1, padding: '20px 60px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {waiting.slice(0, 7).map((t, i) => (
            <div key={t.id} className="animate-fade-in" style={{ 
              display: 'flex', alignItems: 'center', gap: 30,
              padding: '20px 0', borderBottom: `1px solid ${HB.ink3}`,
              animationDelay: `${i * 0.1}s`, opacity: 1 - (i * 0.1)
            }}>
              <TicketNum n={t.num} size={48} color={HB.gold} />
              <div style={{ flex: 1, fontSize: 24, fontWeight: 600, letterSpacing: 0.5 }}>{t.name}</div>
            </div>
          ))}
          {waiting.length > 7 && (
            <div style={{ textAlign: 'center', color: HB.mute, padding: 20, fontStyle: 'italic' }}>
              + {waiting.length - 7} autres
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
