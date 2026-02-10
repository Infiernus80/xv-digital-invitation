import Image from "next/image";

export const SponsorsSection = () => {
  return (
    <section className="w-full bg-white mt-15">
      <div className="">
        <div className="relative flex items-center justify-center">
          {/* Imagen del marco */}
          <Image
            src="/images/sponsors/Marco.svg"
            alt=""
            width={600}
            height={600}
          />

          {/* Texto centrado sobre el marco */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-16 pb-12 text-center">
            <h2 className="mb-4 font-dancing-script text-4xl text-black">
              Mis padrinos
            </h2>
            <p className="font-dancing-script text-3xl leading-relaxed text-black">
              Irma Reveles Santana
            </p>
            <p className="font-dancing-script text-3xl text-black">y</p>
            <p className="font-dancing-script text-3xl leading-relaxed text-black">
              Pablo Sandoval Vera
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
