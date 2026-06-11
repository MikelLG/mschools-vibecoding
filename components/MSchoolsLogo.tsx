export function MSchoolsLogo({ size = 'md', subBrand = 'IA Lab' }: { size?: 'sm' | 'md' | 'lg'; subBrand?: string | null }) {
  const s = size === 'sm' ? { box: 16, font: 11, gap: 4, text: 14, divH: 16 }
    : size === 'lg' ? { box: 28, font: 18, gap: 8, text: 22, divH: 28 }
    : { box: 20, font: 13, gap: 6, text: 16, divH: 20 };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: s.box, height: s.box,
        background: '#00e082', borderRadius: 3,
        color: 'white', fontWeight: 900, fontSize: s.font, lineHeight: 1,
        fontFamily: 'inherit',
      }}>m</span>
      <span style={{ fontWeight: 700, fontSize: s.text, color: '#5e2440', letterSpacing: -0.3 }}>Schools</span>
      {subBrand && <>
        <span style={{ width: 1, height: s.divH, background: '#c9b8c5', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: s.text, color: '#5e2440', letterSpacing: -0.3 }}>{subBrand}</span>
      </>}
    </span>
  );
}
