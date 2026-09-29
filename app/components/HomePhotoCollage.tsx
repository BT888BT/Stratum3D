import Image from "next/image";

const PHOTO_SIZES = "(max-width: 768px) 80vw, 38vw";

export default function HomePhotoCollage() {
  return (
    <div className="hero-photo-collage" role="group" aria-label="Examples of recent Stratum3D prints">
      <figure className="hero-photo-frame hero-photo-frame-main">
        <Image
          src="/home-gallery/print-3.webp"
          alt="White 3D-printed Raspberry Pi enclosure"
          fill
          sizes={PHOTO_SIZES}
          priority
        />
      </figure>

      <figure className="hero-photo-frame hero-photo-frame-top">
        <Image
          src="/home-gallery/print-1.webp"
          alt="Custom 3D-printed raised dog bowl stand"
          fill
          sizes={PHOTO_SIZES}
        />
      </figure>

      <figure className="hero-photo-frame hero-photo-frame-bottom">
        <Image
          src="/home-gallery/print-2.webp"
          alt="Detailed 3D-printed tabletop terrain pieces"
          fill
          sizes={PHOTO_SIZES}
        />
      </figure>
    </div>
  );
}
