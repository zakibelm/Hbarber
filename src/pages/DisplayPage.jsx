import { useParams } from 'react-router-dom';
import { HB, HBLogo, TicketNum, Eyebrow } from '../design/atoms';
import { useQueue, selectWaiting, selectCalled } from '../store/useQueue';

function FooterStat({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 24, fontWeight: 700, color: HB.bone }}>{value}</span>
      <span style={{ fontSize: 12, color: HB.mute, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
  );
}

export default function DisplayPage() {
  const { shopSlug } = useParams();
  const { shop, tickets, loading } = useQueue(shopSlug);

  if (loading) return <div style={{ color: HB.bone, padding: 20 }}>Chargement...</div>;
  if (!shop) return <div style={{ color: HB.bone, padding: 20 }}>Boutique introuvable</div>;

  const waiting = selectWaiting(tickets);
  const called = selectCalled(tickets);

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', 
      background: HB.ink, color: HB.bone, fontFamily: HB.sans, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <HBLogo size={50} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>{shop.name.toUpperCase()}</div>
            <div style={{ fontSize: 12, color: HB.mute, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
              FILE DU JOUR • {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,180,0,0.1)', color: '#00D000', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, marginTop: 8 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D000' }} /> OUVERT
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, display: 'flex', padding: '0 60px 40px 60px', gap: 60 }}>
        
        {/* Left: Current Client */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: HB.gold, marginBottom: 40 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: HB.gold }} />
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>AU FAUTEUIL MAINTENANT</span>
          </div>
          
          {called ? (
            <div className="animate-fade-in">
              <div style={{ fontSize: 240, fontWeight: 700, lineHeight: 0.8, letterSpacing: -10, color: HB.bone, opacity: 0.9 }}>
                {String(called.num).padStart(3, '0')}
              </div>
              <div style={{ fontSize: 80, fontWeight: 600, fontFamily: HB.serif, fontStyle: 'italic', marginTop: 40, color: HB.bone }}>
                {called.name}
              </div>
              <div style={{ marginTop: 60, maxWidth: 500, fontSize: 16, color: HB.mute, lineHeight: 1.6 }}>
                Le numéro <span style={{ color: HB.gold, fontWeight: 700 }}>n'est pas votre tour</span> ? Restez à proximité. Une notification vous parviendra <span style={{ color: HB.gold, fontWeight: 700 }}>3 minutes avant</span>.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
               <HBLogo size={200} />
            </div>
          )}
        </div>

        {/* Right: Next Clients */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Eyebrow style={{ marginBottom: 32 }}>PROCHAINS</Eyebrow>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {waiting.slice(0, 5).map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 40, paddingBottom: 24, borderBottom: `1px solid ${HB.ink3}` }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: HB.gold, width: 40, opacity: 0.8 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 600, color: HB.bone }}>{t.name}</div>
                  <div style={{ fontSize: 14, color: HB.mute, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{t.service}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: HB.mute }}>#{t.num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div style={{ 
        padding: '30px 60px', borderTop: `1px solid ${HB.ink3}`, 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 60 }}>
          <FooterStat label="en file" value={waiting.length} />
          <FooterStat label="attente" value={`~${waiting.length * (shop.avg_service_min || 15)}m`} />
          <FooterStat label="service moyen" value={`${shop.avg_service_min || 15}m`} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, color: HB.mute }}>
          SCANNER POUR REJOINDRE • <span style={{ color: HB.bone }}>{window.location.host}/{shopSlug}</span>
        </div>
      </div>
    </div>
  );
}
