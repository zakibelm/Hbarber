import { useParams } from 'react-router-dom';
import { HB, HBLogo, QRCode } from '../design/atoms';

export default function PosterPage() {
  const { shopSlug } = useParams();
  const joinUrl = `https://hbarber.app/${shopSlug}`; // Real URL here

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#222', padding: 40
    }}>
      {/* 11x17 ratio poster frame (scaled) */}
      <div style={{
        width: 1100 * 0.6, height: 1700 * 0.6,
        background: HB.ink, position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% -20%, ${HB.gold}22 0%, transparent 60%)`,
          zIndex: 0
        }} />

        <div style={{ zIndex: 1, marginTop: 120 }}>
          <HBLogo size={140} />
        </div>

        <div style={{ zIndex: 1, marginTop: 140, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: HB.serif, fontSize: 80, fontWeight: 700,
            lineHeight: 1.05, margin: 0, color: HB.bone, letterSpacing: -2
          }}>
            Prenez place<br/>
            <span style={{ fontStyle: 'italic', color: HB.gold }}>sans attendre.</span>
          </h1>
          <p style={{
            fontFamily: HB.sans, fontSize: 24, color: HB.mute,
            marginTop: 30, maxWidth: 440, lineHeight: 1.5
          }}>
            Scannez pour rejoindre la file. Nous vous envoyons un SMS 10 minutes avant votre tour.
          </p>
        </div>

        <div style={{ zIndex: 1, marginTop: 100, padding: 30, background: HB.bone, borderRadius: 24 }}>
          <QRCode value={joinUrl} size={260} />
        </div>

        <div style={{ zIndex: 1, marginTop: 40, fontFamily: HB.sans, fontSize: 18, color: HB.mute, fontWeight: 600, letterSpacing: 2 }}>
          {joinUrl.replace('https://', '')}
        </div>
      </div>
    </div>
  );
}
