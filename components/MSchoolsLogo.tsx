export function MSchoolsLogo({ size = 'md', subBrand = 'IA Lab' }: { size?: 'sm' | 'md' | 'lg'; subBrand?: string | null }) {
  const h = size === 'sm' ? 20 : size === 'lg' ? 36 : 26;

  if (subBrand === 'IA Lab') {
    return <img src="/mschools-ia-lab.png" alt="mSchools IA Lab" style={{ height: h, width: 'auto' }} />;
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src="/mschools.png" alt="mSchools" style={{ height: h, width: 'auto' }} />
      {subBrand && <>
        <span style={{ width: 1, height: h, background: '#c9b8c5', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: h * 0.65, color: '#5e2440', letterSpacing: -0.3 }}>{subBrand}</span>
      </>}
    </span>
  );
}
