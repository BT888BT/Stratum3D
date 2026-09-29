function gearPath(
  cx: number,
  cy: number,
  rootRadius: number,
  toothRadius: number,
  teeth: number,
  phase = 0,
) {
  const step = (Math.PI * 2) / teeth;
  const profile: Array<[number, number]> = [
    [-0.5, rootRadius],
    [-0.34, rootRadius],
    [-0.24, toothRadius],
    [0.24, toothRadius],
    [0.34, rootRadius],
    [0.5, rootRadius],
  ];
  const points = Array.from({ length: teeth }, (_, tooth) =>
    profile.map(([fraction, radius]) => {
      const angle = -Math.PI / 2 + phase + tooth * step + fraction * step;
      return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
    }),
  ).flat();

  return `M${points.join(" L")}Z`;
}

export default function HeroArtwork() {
  const largeGear = gearPath(215, 259, 87, 101, 18, 0.04);
  const smallGear = gearPath(337, 191, 46, 55, 10, 0.15);

  return (
    <div className="hero-artwork">
      <svg
        className="hero-artwork-svg"
        viewBox="0 0 520 480"
        role="img"
        aria-labelledby="hero-artwork-title hero-artwork-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="hero-artwork-title">Interlocking precision gears</title>
        <desc id="hero-artwork-description">
          An original vector illustration of two custom, layered gears with warm copper and graphite finishes.
        </desc>
        <defs>
          <radialGradient id="hero-artwork-aura" cx="49%" cy="48%" r="58%">
            <stop offset="0" stopColor="#f97316" stopOpacity=".2" />
            <stop offset=".62" stopColor="#f97316" stopOpacity=".055" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-artwork-copper" x1="0" y1="0" x2="1" y2=".25">
            <stop offset="0" stopColor="#733018" />
            <stop offset=".2" stopColor="#c34e1d" />
            <stop offset=".5" stopColor="#ff9c4b" />
            <stop offset=".77" stopColor="#d45a20" />
            <stop offset="1" stopColor="#682816" />
          </linearGradient>
          <linearGradient id="hero-artwork-steel" x1="0" y1="0" x2="1" y2=".5">
            <stop offset="0" stopColor="#333b41" />
            <stop offset=".43" stopColor="#abb0ad" />
            <stop offset=".7" stopColor="#6b7375" />
            <stop offset="1" stopColor="#303538" />
          </linearGradient>
          <linearGradient id="hero-artwork-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b64c20" />
            <stop offset="1" stopColor="#542316" />
          </linearGradient>
          <linearGradient id="hero-artwork-plinth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#555756" />
            <stop offset="1" stopColor="#222527" />
          </linearGradient>
          <linearGradient id="hero-artwork-glint" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff1df" stopOpacity="0" />
            <stop offset=".48" stopColor="#fff1df" stopOpacity=".54" />
            <stop offset="1" stopColor="#fff1df" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hero-artwork-large-clip">
            <path d={largeGear} />
          </clipPath>
          <clipPath id="hero-artwork-small-clip">
            <path d={smallGear} />
          </clipPath>
          <filter id="hero-artwork-shadow" x="-50%" y="-60%" width="200%" height="220%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        {/* Restrained technical linework keeps the artwork graphic and uncluttered. */}
        <circle cx="262" cy="231" r="205" fill="url(#hero-artwork-aura)" />
        <circle cx="262" cy="231" r="177" fill="none" stroke="#f97316" strokeOpacity=".14" />
        <circle cx="262" cy="231" r="150" fill="none" stroke="#f3e9dc" strokeOpacity=".09" strokeDasharray="1 8" />
        <path d="M71 314A207 207 0 0 1 112 121M436 134A207 207 0 0 1 468 278" fill="none" stroke="#f97316" strokeOpacity=".26" strokeWidth="1.2" />
        <circle cx="96" cy="173" r="3" fill="#fb923c" fillOpacity=".8" />
        <circle cx="438" cy="322" r="2.5" fill="#fb923c" fillOpacity=".7" />
        <path d="M65 344h38m-19-19v38M416 107h34m-17-17v34" stroke="#f3e9dc" strokeOpacity=".23" strokeWidth="1" />

        {/* Soft grounding shadow and a low display plinth. */}
        <ellipse cx="260" cy="388" rx="122" ry="18" fill="#080a0c" fillOpacity=".55" filter="url(#hero-artwork-shadow)" />
        <path d="m145 381 115-22 115 22-115 24z" fill="#55514b" />
        <path d="m145 381 115 24v18l-115-24z" fill="url(#hero-artwork-plinth)" />
        <path d="m260 405 115-24v18l-115 24z" fill="#242729" />
        <path d="m162 383 98-19 98 19-98 20z" fill="#747069" fillOpacity=".42" />

        {/* Smaller graphite gear sits behind the copper gear. */}
        <path d={smallGear} transform="translate(0 8)" fill="#101315" stroke="#111517" strokeWidth="4" />
        <path d={smallGear} fill="url(#hero-artwork-steel)" stroke="#d9dad4" strokeOpacity=".64" strokeWidth="1.4" />
        <g clipPath="url(#hero-artwork-small-clip)">
          {Array.from({ length: 25 }, (_, index) => {
            const y = 139 + index * 4.6;
            return <path key={index} d={`M270 ${y}h135`} fill="none" stroke="#f4e9da" strokeOpacity={index % 3 === 0 ? ".26" : ".13"} strokeWidth=".9" />;
          })}
        </g>
        <circle cx="337" cy="191" r="28" fill="#31383b" stroke="#d9dad4" strokeOpacity=".52" strokeWidth="1.4" />
        <circle cx="337" cy="191" r="20" fill="#171b1d" stroke="#222729" strokeWidth="2" />
        <circle cx="337" cy="191" r="7" fill="#778084" />

        {/* Main gear: visible print layers, inset spokes, and a clean central bore. */}
        <path d={largeGear} transform="translate(0 11)" fill="url(#hero-artwork-side)" stroke="#542316" strokeWidth="2" />
        <path d={largeGear} fill="url(#hero-artwork-copper)" stroke="#ffd0a5" strokeOpacity=".64" strokeWidth="1.5" />
        <g clipPath="url(#hero-artwork-large-clip)">
          {Array.from({ length: 30 }, (_, index) => {
            const y = 162 + index * 6.4;
            return <path key={index} d={`M105 ${y}h220`} fill="none" stroke={index % 4 === 0 ? "#ffe3c9" : "#713019"} strokeOpacity={index % 4 === 0 ? ".31" : ".2"} strokeWidth="1.1" />;
          })}
          <path d="M160 177C190 210 185 281 170 330" fill="none" stroke="url(#hero-artwork-glint)" strokeWidth="23" />
          <path d="M270 163C246 207 252 290 275 341" fill="none" stroke="#572514" strokeOpacity=".23" strokeWidth="25" />
        </g>
        <circle cx="215" cy="259" r="66" fill="#7c3519" fillOpacity=".48" stroke="#ffd2a9" strokeOpacity=".63" strokeWidth="1.4" />
        <circle cx="215" cy="259" r="53" fill="none" stroke="#ffca9a" strokeOpacity=".48" strokeWidth="2" />
        <circle cx="215" cy="259" r="44" fill="#a74319" fillOpacity=".55" stroke="#772f17" strokeOpacity=".75" strokeWidth="2" />
        <g stroke="#ffcea2" strokeOpacity=".68" strokeWidth="5" strokeLinecap="round">
          <path d="M215 221v-15M215 312v-15M177 259h-15M268 259h-15M188 232l-11-11M253 297l-11-11M242 232l11-11M177 297l11-11" />
        </g>
        <circle cx="215" cy="259" r="25" fill="#301f18" stroke="#ffc18e" strokeOpacity=".83" strokeWidth="2" />
        <circle cx="215" cy="259" r="15" fill="#111214" stroke="#7c4427" strokeWidth="2" />
        <circle cx="210" cy="254" r="3" fill="#ffead7" fillOpacity=".65" />
      </svg>
    </div>
  );
}
