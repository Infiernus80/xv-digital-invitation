import Image from "next/image";

export const SponsorsSection = () => {
  return (
    <section className="w-full bg-white py-5 flex justify-center">
      {/* Contenedor responsivo */}
      <div className="relative w-[95%] max-w-150 aspect-square">
        {/* Marco */}
        <Image
          src="/images/sponsors/Marco.svg"
          alt="Marco"
          fill
          priority
          className="object-contain select-none"
        />

        {/* Texto centrado DENTRO del marco */}
        <div className="absolute inset-0 flex flex-col items-center mt-[15%] text-center px-[20%]">
          <h2 className="mb-[2%] font-dancing-script text-[clamp(30px,4vw,36px)] text-black">
            Mis padrinos
          </h2>

          <p className="font-dancing-script text-[clamp(25px,3.5vw,28px)] leading-relaxed text-black">
            Irma Reveles Santana
          </p>

          <p className="font-dancing-script text-[clamp(25px,3.5vw,28px)] text-black">
            y
          </p>

          <p className="font-dancing-script text-[clamp(25px,3.5vw,28px)] leading-relaxed text-black">
            Pablo Sandoval Vera
          </p>
        </div>
      </div>
    </section>
  );
};
