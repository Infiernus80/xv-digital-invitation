import Image from "next/image";

export const ReceptionSection = () => {
  return (
    <section className="w-full  py-16">
      <div className="mx-auto max-w-110 px-8">
        <div className="text-center">
          <h2 className="mb-6 font-dancing-script text-5xl font-bold text-slate-700">
            Recepción
          </h2>
          <p className="mb-4 font-dancing-script text-2xl">
            Mandú Salón a las 09:00 p.m.
          </p>

          {/* Ilustración de copas con flores */}
          <div className="mb-6 flex justify-start">
            <Image
              src="/images/reception/Reception.svg"
              alt=""
              width={310}
              height={347}
            />
          </div>

          <a
            href="https://www.google.com/maps/dir//20.6380283,-103.3010843"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[#F35A7EB3] px-8 py-3 text-[18px] font-bad-script font-semibold text-white shadow-lg transition-all hover:bg-pink-400 hover:shadow-xl w-62 h-12.25"
          >
            Ver mapa
          </a>
        </div>
      </div>
      <Image
        src="/images/reception/Original.jpeg"
        alt=""
        width={441}
        height={556}
        className="w-full h-auto mt-10"
      />
    </section>
  );
};
