import Image from "next/image";

type HeroSectionProps = {
  title?: string;
  name?: string;
};

export function HeroSection(props: HeroSectionProps) {
  const title = props.title ?? "Mis XV Años";
  const name = props.name ?? "Jennifer Samantha";

  return (
    <section className="w-full bg-white">
      {/* Landing: ancho fijo del diseño (440). Alto automático */}
      <div className="mx-auto w-full max-w-[440px]">
        {/* Contenedor relativo para posicionar todo como Figma */}
        <div className="relative w-[440px] overflow-hidden bg-white">
          {/* FLORES (absolute, no afectan altura) */}
          <div className="pointer-events-none absolute left-[-150px] top-[50px] h-[570px] w-[600px] select-none">
            <Image
              src="/images/hero/flower-left.png"
              alt=""
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="pointer-events-none absolute left-[-50px] top-[-50px] h-[570px] w-[600px] select-none">
            <Image
              src="/images/hero/flower-right.png"
              alt=""
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Imagen principal (define el alto real del hero) */}
          <div className="relative pl-[43px] pt-[63px]">
            <div className="relative h-[571px] w-[371px]">
              <Image
                src="/images/hero/hero-girl.png"
                alt="Hero"
                fill
                priority
                className="select-none object-contain"
              />
            </div>
          </div>

          {/* Recuadro + título (absolute encima de la imagen) */}
          <div className="absolute left-[61px] top-[325px] h-[84px] w-[321px]">
            {/* Recuadro blanco 55% */}
            <div className="h-full w-full bg-white/55" />

            {/* Texto */}
            <p className="font-dancing-script absolute left-[13px] top-[16px] text-[56px] leading-[56px] text-slate-800">
              {title}
            </p>
          </div>

          {/* Nombre debajo (si aplica, aún no me diste medidas exactas) */}
          <div className="pb-[26px] pt-[10px] text-center">
            <p className="font-moon-time text-[48px] leading-[20px] text-slate-500">
              {name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
