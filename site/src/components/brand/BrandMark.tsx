// Símbolo do Impostômetro Rolante (medidor). Geometria em docs/brand/impostometro-rolante/README.md, seção 2.
type Props = { height?: number; tone?: 'auto' | 'ink' | 'white'; title?: string };

export function BrandMark({ height = 34, tone = 'auto', title }: Props) {
  const stroke = tone === 'ink' ? 'var(--tinta)' : tone === 'white' ? 'var(--branco)' : 'var(--accent)';
  const fill = tone === 'auto' ? 'var(--brand-bg)' : 'none';
  return (
    <svg
      width={(height * 26) / 34}
      height={height}
      viewBox="0 0 26 34"
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="2" y="2" width="22" height="30" rx="11" fill={fill} stroke={stroke} strokeWidth="1.8" />
      <path d="M6.2 22 A6.8 6.8 0 0 1 19.8 22" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity=".45" />
      <path d="M13 22 L17.2 15.6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="13" cy="22" r="1.9" fill={stroke} />
    </svg>
  );
}
