import Image from "next/image";

type HeroSectionProps = {
  title?: string;
};

export function HeroSection(props: HeroSectionProps) {
  const title = props.title ?? "Mis XV Años";

  return (
    <section className="w-full bg-white">
      {/* Landing: ancho fijo del diseño (440). Alto automático */}
      <div className="mx-auto w-full ">
        {/* Contenedor relativo para posicionar todo como Figma */}
        <div className="relative w-full overflow-hidden bg-white">
          {/* Imagen principal (define el alto real del hero) */}
          <div className="flex items-center">
            <div className="relative h-142.75 w-screen">
              <Image
                src="/images/hero/Principal.jpeg"
                alt="Hero"
                fill
                priority
                className="select-none object-cover"
              />
            </div>
          </div>

          {/* Recuadro + título (absolute encima de la imagen) */}
          <div className="absolute top-81.25 h-21 w-full">
            {/* Recuadro blanco 55% */}
            <div className="h-full w-full bg-white/55" />

            {/* Texto */}
            <p className="font-dancing-script absolute inset-x-0 top-4 text-center text-[56px] leading-14 text-slate-800">
              {title}
            </p>
          </div>

          {/* Nombre debajo (si aplica, aún no me diste medidas exactas) */}
          {/* <div className="pb-[26px] pt-[10px] text-center">
            <p className="font-moon-time text-[48px] leading-[20px] text-slate-500">
              {name}
            </p>
          </div> */}
        </div>
      </div>
    </section>
  );
}
