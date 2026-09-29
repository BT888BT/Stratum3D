export default function HeroArtwork() {
  return (
    <div className="hero-artwork">
      <svg
        className="hero-artwork-svg"
        viewBox="0 0 520 480"
        role="img"
        aria-labelledby="hero-artwork-title hero-artwork-description"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="hero-artwork-title">Sculptural layered form</title>
        <desc id="hero-artwork-description">
          An original illustration of a warm copper sculptural vessel with fine additive-manufacturing layer lines.
        </desc>
        <defs>
          <radialGradient id="hero-artwork-aura" cx="50%" cy="48%" r="54%">
            <stop offset="0" stopColor="#f97316" stopOpacity=".22" />
            <stop offset=".58" stopColor="#f97316" stopOpacity=".07" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-artwork-body" x1="0" y1="0" x2="1" y2=".25">
            <stop offset="0" stopColor="#8c3516" />
            <stop offset=".22" stopColor="#d85b1c" />
            <stop offset=".52" stopColor="#ff9a4a" />
            <stop offset=".78" stopColor="#e96c25" />
            <stop offset="1" stopColor="#7d2e17" />
          </linearGradient>
          <linearGradient id="hero-artwork-highlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff0dd" stopOpacity="0" />
            <stop offset=".42" stopColor="#fff0dd" stopOpacity=".43" />
            <stop offset="1" stopColor="#fff0dd" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-artwork-plinth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b4a48" />
            <stop offset="1" stopColor="#202326" />
          </linearGradient>
          <clipPath id="hero-artwork-vase-clip">
            <path d="M220 113C220 99 300 99 300 113C300 151 313 176 321 201C331 232 329 272 322 306C317 333 309 359 305 378C301 396 219 396 215 378C211 359 203 333 198 306C191 272 189 232 199 201C207 176 220 151 220 113Z" />
          </clipPath>
          <filter id="hero-artwork-shadow" x="-40%" y="-40%" width="180%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Quiet instrument-like backdrop: drawn lines, not a photo or machine scene. */}
        <circle cx="260" cy="235" r="204" fill="url(#hero-artwork-aura)" />
        <circle cx="260" cy="235" r="177" fill="none" stroke="#f97316" strokeOpacity=".13" />
        <circle cx="260" cy="235" r="151" fill="none" stroke="#f3e9dc" strokeOpacity=".09" strokeDasharray="1 8" />
        <path d="M70 314A207 207 0 0 1 113 120" fill="none" stroke="#f97316" strokeOpacity=".28" strokeWidth="1.2" />
        <path d="M450 158A207 207 0 0 1 470 274" fill="none" stroke="#f3e9dc" strokeOpacity=".18" strokeWidth="1.2" />
        <circle cx="89" cy="178" r="3" fill="#fb923c" fillOpacity=".8" />
        <circle cx="426" cy="326" r="2.5" fill="#fb923c" fillOpacity=".7" />
        <path d="M67 342h38m-19-19v38M404 119h34m-17-17v34" stroke="#f3e9dc" strokeOpacity=".24" strokeWidth="1" />

        {/* Grounding shadow and a small machined display plinth. */}
        <ellipse cx="260" cy="409" rx="113" ry="19" fill="#080a0c" fillOpacity=".5" filter="url(#hero-artwork-shadow)" />
        <path d="M155 391 260 370l105 21-105 24z" fill="#55514d" />
        <path d="m155 391 105 24v18l-105-24z" fill="url(#hero-artwork-plinth)" />
        <path d="m260 415 105-24v18l-105 24z" fill="#25282a" />
        <path d="m170 393 90-18 90 18-90 20z" fill="#6a6259" fillOpacity=".55" />

        {/* The vessel is a clean vector sculpture with visible, restrained layer contours. */}
        <path d="M220 113C220 99 300 99 300 113C300 151 313 176 321 201C331 232 329 272 322 306C317 333 309 359 305 378C301 396 219 396 215 378C211 359 203 333 198 306C191 272 189 232 199 201C207 176 220 151 220 113Z" fill="url(#hero-artwork-body)" stroke="#ffd0a5" strokeOpacity=".58" strokeWidth="1.5" />
        <g clipPath="url(#hero-artwork-vase-clip)">
          {Array.from({ length: 42 }, (_, index) => {
            const y = 124 + index * 6.4;
            return (
              <path
                key={index}
                d={`M172 ${y} C214 ${y - 2.6} 306 ${y + 2.6} 348 ${y}`}
                fill="none"
                stroke={index % 4 === 0 ? "#ffe0c3" : "#702a13"}
                strokeOpacity={index % 4 === 0 ? ".3" : ".2"}
                strokeWidth="1.15"
              />
            );
          })}
          <path d="M229 137C232 181 239 216 235 254C231 303 222 335 230 379" fill="none" stroke="url(#hero-artwork-highlight)" strokeWidth="25" />
          <path d="M294 137C290 181 282 216 286 254C290 303 299 335 291 379" fill="none" stroke="#5f2110" strokeOpacity=".23" strokeWidth="31" />
          <path d="M171 246h180M171 330h180" stroke="#ffbf8b" strokeOpacity=".11" strokeWidth="1" />
        </g>

        {/* A raised lip and dark inner opening give the form a finished silhouette. */}
        <ellipse cx="260" cy="113" rx="40" ry="12" fill="#742d16" stroke="#ffc18e" strokeOpacity=".76" strokeWidth="1.5" />
        <ellipse cx="260" cy="112" rx="31" ry="7" fill="#211a17" />
        <ellipse cx="260" cy="111" rx="24" ry="4.5" fill="#0d0d0e" />
        <path d="M222 117C234 125 286 125 298 117" fill="none" stroke="#ffd5b0" strokeOpacity=".74" strokeWidth="1.5" />
        <path d="M215 378C231 389 289 389 305 378" fill="none" stroke="#ffd7b6" strokeOpacity=".66" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
