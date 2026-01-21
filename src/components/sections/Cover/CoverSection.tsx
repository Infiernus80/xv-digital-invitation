import Image from "next/image";

type CoverSectionProps = {
  name?: string;
  subtitle?: string;
};

export const CoverSection = (props: CoverSectionProps) => {
  const name = props.name ?? "Jennifer Samantha";
  const subtitle = props.subtitle ?? "Mis XV";

  return (
    <section className="w-full bg-white">
      {/* Artboard fijo: 440 x 855 */}
      <div className="mx-auto w-full max-w-110">
        <div className="relative h-213.75 w-110 overflow-hidden bg-white">
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
          <div className="absolute left-0 top-121 h-92.75 w-110">
            <Image
              src="/images/cover/flower-bottom-right.png"
              alt=""
              fill
              priority
              className="pointer-events-none select-none object-cover"
            />
          </div>

          {/* Envelope */}
          <div className="absolute -left-22.5 top-21 h-103.25 w-154.75">
            <Image
              src="/images/cover/envelope.png"
              alt="Sobre"
              fill
              priority
              className="select-none object-contain"
            />
          </div>

          {/* Seal */}
          <div className="absolute left-36.25 top-55 h-37.75 w-37.5">
            <Image
              src="/images/cover/seal.png"
              alt="Sello"
              fill
              priority
              className="select-none object-contain"
            />
          </div>

          {/* Name */}
          <div className="absolute left-32.5 top-107.5 w-65 text-center">
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
