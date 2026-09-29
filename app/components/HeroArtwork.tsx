const CUBE_FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

export default function HeroArtwork() {
  return (
    <div className="hero-artwork" role="img" aria-label="Slowly rotating three-dimensional orange cube">
      <span className="hero-cube-orbit" aria-hidden="true" />
      <span className="hero-cube-shadow" aria-hidden="true" />
      <div className="hero-cube-scene" aria-hidden="true">
        <div className="hero-cube">
          {CUBE_FACES.map((face) => (
            <span className={`hero-cube-face hero-cube-face-${face}`} key={face} />
          ))}
        </div>
      </div>
    </div>
  );
}
