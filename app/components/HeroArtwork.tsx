const RING =
  "M 68 220 a192 98 0 1 0 384 0 a192 98 0 1 0 -384 0 M 184 220 a76 39 0 1 0 152 0 a76 39 0 1 0 -152 0";

export default function HeroArtwork() {
  return (
    <div className="hero-artwork" role="img" aria-label="Satin-metal 3D-printed ring with subtle layer details">
      <svg className="hero-artwork-svg" viewBox="0 0 520 460" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="ring-glow" cx="50%" cy="46%" r="56%">
            <stop offset="0" stopColor="#d37639" stopOpacity=".15" />
            <stop offset=".7" stopColor="#754021" stopOpacity=".035" />
            <stop offset="1" stopColor="#754021" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ring-side" x1="0" y1=".1" x2="1" y2=".9">
            <stop offset="0" stopColor="#8e684c" />
            <stop offset=".3" stopColor="#3e3025" />
            <stop offset=".66" stopColor="#725038" />
            <stop offset="1" stopColor="#30261e" />
          </linearGradient>
          <linearGradient id="ring-top" x1=".12" y1=".12" x2=".9" y2=".86">
            <stop offset="0" stopColor="#d3c1a8" />
            <stop offset=".28" stopColor="#8f7a62" />
            <stop offset=".64" stopColor="#52463a" />
            <stop offset="1" stopColor="#b47645" />
          </linearGradient>
          <linearGradient id="ring-bevel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1dec1" stopOpacity=".76" />
            <stop offset=".38" stopColor="#c39b70" stopOpacity=".22" />
            <stop offset="1" stopColor="#f4a260" stopOpacity=".44" />
          </linearGradient>
          <filter id="ring-shadow" x="-35%" y="-90%" width="170%" height="280%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>

        <ellipse cx="260" cy="226" rx="213" ry="180" fill="url(#ring-glow)" />
        <ellipse cx="260" cy="323" rx="162" ry="29" fill="#000" opacity=".4" filter="url(#ring-shadow)" />
        <ellipse cx="260" cy="294" rx="202" ry="71" fill="none" stroke="#c58c5c" strokeOpacity=".14" strokeWidth="1" transform="rotate(-9 260 294)" />
        <ellipse cx="260" cy="294" rx="174" ry="60" fill="none" stroke="#c58c5c" strokeOpacity=".08" strokeWidth="1" transform="rotate(-9 260 294)" />

        {[39, 32, 25, 18, 11, 4].map((depth, index) => (
          <path
            key={depth}
            d={RING}
            transform={`translate(0 ${depth})`}
            fill="url(#ring-side)"
            fillRule="evenodd"
            stroke={index < 2 ? "#d6a274" : "#211a14"}
            strokeOpacity={index < 2 ? ".34" : ".62"}
            strokeWidth="1.2"
          />
        ))}

        <path d={RING} fill="url(#ring-top)" fillRule="evenodd" stroke="url(#ring-bevel)" strokeWidth="1.5" />
        <ellipse cx="260" cy="220" rx="190" ry="96" fill="none" stroke="#f4dfc3" strokeOpacity=".22" strokeWidth="1" />
        <ellipse cx="260" cy="220" rx="76" ry="39" fill="none" stroke="#241c16" strokeOpacity=".8" strokeWidth="2" />
        <ellipse cx="260" cy="220" rx="72" ry="35" fill="none" stroke="#e6bd91" strokeOpacity=".34" strokeWidth="1" />
        <path d="M 111 191 C 143 139 214 120 275 122" fill="none" stroke="#fff0d8" strokeOpacity=".38" strokeLinecap="round" strokeWidth="2" />
        <path d="M 408 251 C 382 281 345 297 312 300" fill="none" stroke="#f5a565" strokeOpacity=".38" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
