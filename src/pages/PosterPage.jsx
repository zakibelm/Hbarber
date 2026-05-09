import { useParams } from 'react-router-dom';
import { HB, HBLogo, QRCode } from '../design/atoms';
import { useQueue } from '../store/useQueue';

export default function PosterPage() {
  const { shopSlug } = useParams();
  const { shop } = useQueue(shopSlug);
  const joinUrl = `${window.location.host}/${shopSlug}`;

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111', padding: 40
    }}>
      {/* Poster Frame */}
      <div style={{
        width: 800, height: 1100,
        background: HB.ink, position: 'relative', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 60px', border: `1px solid ${HB.ink3}`
      }}>
        {/* Borders */}
        <div style={{ position: 'absolute', inset: 20, border: `1px solid ${HB.gold}33`, pointerEvents: 'none' }} />
        
        <HBLogo size={100} />
        
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: HB.serif, fontSize: 32, fontWeight: 700, color: HB.bone, letterSpacing: 1 }}>
            {shop?.name?.toUpperCase() || 'H BARBER SHOP'}
          </div>
          <div style={{ fontFamily: HB.sans, fontSize: 18, color: HB.gold, fontWeight: 700, marginTop: 10, letterSpacing: 2 }}>
            {shop?.phone || '514 583-4712'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: HB.serif, fontStyle: 'italic', fontSize: 28, color: HB.gold, marginBottom: 20 }}>
            ~ Bienvenue ~
          </div>
          <h1 style={{
            fontFamily: HB.serif, fontSize: 100, fontWeight: 700,
            lineHeight: 1, margin: 0, color: HB.bone, letterSpacing: -2
          }}>
            Pas de file<br/>
            <span style={{ fontStyle: 'italic' }}>d'attente.</span>
          </h1>
          <p style={{
            fontFamily: HB.sans, fontSize: 20, color: HB.mute,
            marginTop: 40, maxWidth: 500, lineHeight: 1.5, fontWeight: 500
          }}>
            Scannez, inscrivez-vous, attendez où vous voulez.<br/>
            On vous prévient quand c'est votre tour.
          </p>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          <div style={{ padding: 24, background: HB.bone, borderRadius: 16, position: 'relative' }}>
            <QRCode value={`https://${joinUrl}`} size={300} />
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 60, height: 60, background: HB.bone, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
               <span style={{ fontFamily: HB.serif, fontWeight: 800, fontSize: 32, color: HB.ink }}>H</span>
            </div>
          </div>
          
          <div style={{ fontFamily: HB.sans, fontSize: 14, color: HB.mute, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            {joinUrl}
          </div>
        </div>

      </div>
    </div>
  );
}
