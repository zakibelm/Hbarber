import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HB } from './atoms';

export default function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine shop slug from URL, fallback to h-barber-mtl
  const match = location.pathname.match(/\/(?:admin\/|display\/|poster\/)?([^\/]+)/);
  let slug = 'h-barber-mtl';
  if (match && match[1]) {
    slug = match[1];
  }
  
  // Clean up if it matched 'admin', 'display', 'poster' due to regex matching the exact first segment instead of capturing group properly
  // Let's do a simpler extraction:
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    if (['admin', 'display', 'poster'].includes(parts[0])) {
      slug = parts[1] || 'h-barber-mtl';
    } else {
      slug = parts[0];
    }
  }

  // Hide global nav on the landing page if desired, but user said "dans toute les page"
  // Let's keep it everywhere.

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000
      }}>
        {/* Home Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: HB.gold,
            color: HB.ink,
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: `0 4px 12px rgba(0,0,0,0.3)`
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        {/* Menu Button */}
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: HB.ink2,
            color: HB.bone,
            border: `1px solid ${HB.hairline}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: `0 4px 12px rgba(0,0,0,0.3)`
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1001
          }}
        />
      )}

      {/* Sidebar Content */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0, right: isOpen ? 0 : '-300px',
        width: '280px', background: HB.ink, borderLeft: `1px solid ${HB.hairline}`,
        zIndex: 1002, transition: 'right 0.3s ease',
        padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: isOpen ? '-4px 0 20px rgba(0,0,0,0.5)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: HB.serif, color: HB.gold, fontSize: '20px', fontStyle: 'italic', fontWeight: 'bold' }}>Navigation</span>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: HB.mute, cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: HB.sans }}>
          {[
            { label: 'Accueil', path: '/' },
            { label: 'Parcours Client', path: `/${slug}` },
            { label: 'Tableau de bord Admin', path: `/admin/${slug}` },
            { label: 'Écran Public (TV)', path: `/display/${slug}` },
            { label: 'Affiche QR Code', path: `/poster/${slug}` }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => { navigate(item.path); setIsOpen(false); }} 
              style={{ 
                textAlign: 'left', background: 'transparent', border: 'none', 
                color: HB.bone, fontSize: '15px', cursor: 'pointer', 
                padding: '12px 16px', borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
