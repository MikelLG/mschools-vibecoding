export function MSchoolsLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? { box: 16, font: 11, gap: 2, text: 14 }
    : size === 'lg' ? { box: 28, font: 18, gap: 3, text: 22 }
    : { box: 20, font: 13, gap: 2, text: 16 };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: s.box, height: s.box,
        background: '#00e082', borderRadius: 3,
        color: 'white', fontWeight: 900, fontSize: s.font, lineHeight: 1,
        fontFamily: 'inherit',
      }}>m</span>
      <span style={{ fontWeight: 700, fontSize: s.text, color: '#1a1a1a', letterSpacing: -0.3 }}>Schools</span>
    </span>
  );
}
