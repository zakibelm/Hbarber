import React from 'react';
import { HB } from './tokens';
export { HB };
import { QRCodeSVG } from 'qrcode.react';

export function HBLogo({ size = 64, color = HB.gold, mono = false, withName = true, phone = false }) {
  const c = mono ? color : color;
  const stroke = mono ? color : '#9C7E47';
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.18, lineHeight: 1 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.6"/>
        <circle cx="50" cy="50" r="44" fill="none" stroke={c} strokeWidth="1.2"/>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 32 + i * 8;
          return (
            <g key={i}>
              <ellipse cx="11" cy={y} rx="5.5" ry="2.2" fill="none" stroke={c} strokeWidth="0.9" transform={`rotate(${-30 + i * 6} 11 ${y})`} />
              <ellipse cx="89" cy={y} rx="5.5" ry="2.2" fill="none" stroke={c} strokeWidth="0.9" transform={`rotate(${30 - i * 6} 89 ${y})`} />
            </g>
          );
        })}
        <path d="M38 18 L42 22 L46 14 L50 22 L54 14 L58 22 L62 18 L60 26 L40 26 Z" fill={c} opacity="0.85"/>
        <circle cx="50" cy="12" r="1.6" fill={c}/>
        <circle cx="42" cy="14" r="1" fill={c} opacity="0.8"/>
        <circle cx="58" cy="14" r="1" fill={c} opacity="0.8"/>
        <circle cx="50" cy="56" r="18" fill="none" stroke={c} strokeWidth="1.2"/>
        <circle cx="50" cy="56" r="15.5" fill="#0E0C0A"/>
        <text x="50" y="62" textAnchor="middle"
          fontFamily={HB.serif} fontSize="20" fontWeight="700" fill={c}
          style={{ fontStyle: 'italic', letterSpacing: '-0.5px' }}>H</text>
        <circle cx="50" cy="80" r="1.6" fill={c}/>
      </svg>
      {withName && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.04 }}>
          <div style={{
            fontFamily: HB.serif, fontWeight: 700, color: HB.bone,
            fontSize: size * 0.36, letterSpacing: size * 0.018,
            textTransform: 'uppercase',
          }}>
            BARBER<span style={{ fontWeight: 400, marginLeft: size * 0.12 }}>SHOP</span>
          </div>
          {phone && (
            <div style={{
              fontFamily: HB.mono, color: HB.bone, opacity: 0.85,
              fontSize: size * 0.18, letterSpacing: size * 0.01,
            }}>
              {phone}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TicketNum({ n, size = 96, color = HB.gold, weight = 800 }) {
  const padded = String(n).padStart(3, '0');
  return (
    <span style={{
      fontFamily: HB.serif, fontWeight: weight, color, fontSize: size,
      letterSpacing: -size * 0.02, lineHeight: 0.9,
      fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline',
    }}>
      <span style={{ fontFamily: HB.sans, fontWeight: 300, fontSize: size * 0.36, marginRight: size * 0.08, transform: 'translateY(-' + (size * 0.4) + 'px)', opacity: 0.55 }}>№</span>
      {padded}
    </span>
  );
}

export function Pill({ children, color = HB.gold, bg, dot = true, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 10px', borderRadius: 999,
      fontFamily: HB.sans, fontSize: 11, fontWeight: 600,
      letterSpacing: 1.4, textTransform: 'uppercase',
      color, background: bg || `${color}1F`, border: `1px solid ${color}33`,
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}99` }}/>}
      {children}
    </span>
  );
}

export function GoldRule({ width = '100%', color = HB.gold, opacity = 0.5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width, opacity }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color} 30%, ${color} 70%, transparent)` }} />
      <div style={{ width: 5, height: 5, transform: 'rotate(45deg)', background: color }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color} 30%, ${color} 70%, transparent)` }} />
    </div>
  );
}

export function Eyebrow({ children, color = HB.mute, size = 10, style }) {
  return (
    <div style={{
      fontFamily: HB.sans, fontSize: size, fontWeight: 700,
      letterSpacing: size * 0.32, textTransform: 'uppercase',
      color, ...style,
    }}>{children}</div>
  );
}

export function HBButton({ kind = 'primary', children, onClick, full, style, type = 'button', disabled = false }) {
  const base = {
    fontFamily: HB.sans, fontWeight: 700, fontSize: 13,
    letterSpacing: 1.6, textTransform: 'uppercase',
    padding: '14px 22px', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', transition: 'all .15s',
    width: full ? '100%' : undefined, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    opacity: disabled ? 0.6 : 1,
  };
  const kinds = {
    primary: { background: HB.gold, color: HB.ink, borderColor: HB.gold,
      boxShadow: `0 1px 0 ${HB.goldHi} inset, 0 0 0 1px ${HB.goldLo}` },
    ghost:   { background: 'transparent', color: HB.bone, borderColor: 'rgba(242,237,227,0.2)' },
    dim:     { background: HB.ink3, color: HB.bone, borderColor: 'rgba(242,237,227,0.08)' },
    danger:  { background: 'transparent', color: '#D87B4E', borderColor: 'rgba(216,123,78,0.4)' },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...kinds[kind], ...style }}>{children}</button>;
}

export function QRCode({ value = 'h-barber-mtl', size = 220, fg = '#0E0C0A', bg = '#fff', logo = true }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, background: bg, padding: 0 }}>
      <QRCodeSVG value={value} size={size} fgColor={fg} bgColor={bg} level="H" />
      {logo && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: size * 0.22, height: size * 0.22, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${fg}`,
        }}>
          <span style={{
            fontFamily: HB.serif, fontWeight: 700, fontStyle: 'italic',
            fontSize: size * 0.13, color: fg,
          }}>H</span>
        </div>
      )}
    </div>
  );
}
