import { Link } from 'react-router-dom';
import { HB, HBLogo, HBButton } from '../design/atoms';

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center',
      background: `radial-gradient(circle at center, ${HB.ink2} 0%, ${HB.ink} 100%)`
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        background: 'rgba(20,16,12,0.85)',
        borderBottom: `1px solid ${HB.hairline}`,
        padding: '12px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
        fontFamily: HB.sans,
        fontSize: '13px',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: HB.gold, fontFamily: HB.serif, fontSize: '15px', fontStyle: 'italic', fontWeight: 600 }}>H Barber Repentigny</span>
          <span style={{ color: HB.bone }}>📍 555 Boul. Lacombe Local K</span>
          <span style={{ color: HB.bone }}>📞 (514) 583-4712</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', color: HB.mute, fontSize: '12px' }}>
          <span><span style={{color: HB.bone}}>Lun</span> 13h-18h</span>
          <span><span style={{color: HB.bone}}>Mar-Mer</span> 10h-18h</span>
          <span><span style={{color: HB.bone}}>Jeu-Ven</span> 10h-19h</span>
          <span><span style={{color: HB.bone}}>Sam</span> 10h-17h</span>
          <span><span style={{color: HB.bone}}>Dim</span> 12h-17h</span>
        </div>
      </div>

      <div className="animate-slide-up" style={{ marginTop: '60px' }}>
        <HBLogo size={120} />
        
        <h1 style={{
          fontFamily: HB.serif,
          fontSize: '48px',
          fontWeight: 600,
          marginTop: '40px',
          letterSpacing: '-1px'
        }}>
          Le système d'attente <br/>
          <span style={{ fontStyle: 'italic', color: HB.gold }}>réinventé.</span>
        </h1>
        
        <p style={{
          fontFamily: HB.sans,
          color: HB.mute,
          maxWidth: '400px',
          margin: '20px auto 40px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          Gérez votre salon sans effort. Vos clients scannent un QR code et attendent où ils veulent. 
          Idéal pour H Barber Shop et autres salons premium.
        </p>



        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/h-barber-mtl" style={{ textDecoration: 'none' }}>
            <HBButton>Voir le parcours client</HBButton>
          </Link>
          <Link to="/admin/h-barber-mtl" style={{ textDecoration: 'none' }}>
            <HBButton kind="ghost">Accès Admin</HBButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
