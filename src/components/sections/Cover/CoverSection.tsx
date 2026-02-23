import Image from "next/image";

type CoverSectionProps = {
  name?: string;
  subtitle?: string;
  onSealClick?: () => void;
  fadeOut?: boolean;
};

export const CoverSection = (props: CoverSectionProps) => {
  const {
    name = "Jennifer Samantha",
    subtitle = "Mis XV",
    onSealClick,
    fadeOut,
  } = props;

  return (
    <section
      className={`w-full bg-white transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Viewport que llena pantalla y hace "cover" */}
      <div className="cover-viewport">
        {/* Artboard fijo escalado proporcionalmente */}
        <div className="cover-stage">
          {/* Flor superior izquierda */}
          <div className="absolute left-0 top-0 h-92.75 w-110">
            <Image
              src="/images/cover/flower-top-left.png"
              alt=""
              fill
              priority
              className="pointer-events-none select-none object-cover"
            />
          </div>

          {/* Flor inferior derecha */}
          <div className="absolute left-0 top-121 h-92.75 w-[95%]">
            <Image
              src="/images/cover/flower-bottom-right.png"
              alt=""
              fill
              priority
              className="pointer-events-none select-none object-cover"
            />
          </div>

          {/* Envelope */}
          <div className="absolute -left-[18%] top-21 h-103.25 w-[140%]">
            <Image
              src="/images/cover/envelope.png"
              alt="Sobre"
              fill
              priority
              className="select-none object-contain"
            />
          </div>

          {/* Seal (clickable) */}
          <div
            className="absolute left-[32%] top-[25%] h-37.75 w-37.5 cursor-pointer z-10"
            onClick={onSealClick}
            role="button"
            tabIndex={0}
            aria-label="Abrir invitación"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSealClick?.();
            }}
          >
            <Image
              src="/images/cover/seal.png"
              alt="Sello"
              fill
              priority
              className="select-none object-contain"
            />
          </div>

          {/* Name */}
          <div className="absolute left-1/4 top-107.5 w-65 text-center">
            <p className="font-moon-time text-[48px] leading-4.5 text-slate-500">
              {name}
            </p>
            <p className="mt-5 font-moon-time text-[38px] leading-4.5 text-slate-400">
              {subtitle}
            </p>
          </div>

          {/* Girl */}
          <div className="absolute -left-8.75 top-110 h-119 w-82.5">
            <Image
              src="/images/cover/girl.png"
              alt="Ilustración"
              fill
              priority
              className="select-none object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverSection;
