import Image from "next/image";

interface PolaroidFrameProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
}

export default function PolaroidFrame({
  src,
  alt,
  caption,
  rotation = 0,
}: PolaroidFrameProps) {
  return (
    <div
      className="group mb-6 inline-block w-full break-inside-avoid"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      }}
      /* Hover: rotate back to 0 and lift — applied via onMouseEnter/Leave for inline style override */
    >
      <div
        className="overflow-hidden border-[20px] border-b-[52px] border-white transition-all duration-200 group-hover:-translate-y-1"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Photo */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        </div>

        {/* Caption inside the thick bottom border area — positioned via negative margin */}
        {caption && (
          <p
            className="mt-2 text-center font-script text-sm text-ink"
            style={{ marginBottom: "-36px" }}
          >
            {caption}
          </p>
        )}
      </div>

      {/* CSS for hover rotation reset */}
      <style>{`
        .group:hover {
          transform: rotate(0deg) translateY(-4px) !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
