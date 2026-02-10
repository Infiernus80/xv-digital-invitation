import Image from "next/image";

export const CeremonySection = () => {
  return (
    <section className="w-full  from-white to-pink-200 ">
      <div className="mx-auto max-w-110 px-8">
        <div className="text-center">
          <h2 className="mb-6 font-dancing-script text-5xl font-bold text-slate-700">
            Ceremonia
          </h2>
          <p className="mb-4 font-bad-script text-xl text-black">
            Santuario de Nuestra Señora de
            <br />
            la Soledad a las O8:OO p.m.
          </p>

          {/* Ilustración del templo */}
          <div className="mb-6 flex justify-end">
            <Image
              src="/images/ceremony/Templo.svg"
              alt=""
              width={317}
              height={291}
            />
          </div>

          <div>
            <a
              href="https://www.google.com/maps/dir//20.6398619,-103.3125349"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block rounded-full 
              bg-[#F35A7EB3] px-8 py-3 text-[18px]
              font-bad-script
              font-semibold text-white shadow-lg transition-all hover:bg-pink-400 hover:shadow-xl w-62 h-12.25`}
            >
              Ver mapa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
