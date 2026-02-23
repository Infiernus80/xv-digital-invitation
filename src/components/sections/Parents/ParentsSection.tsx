import Image from "next/image";

export const ParentsSection = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto w-[95%] max-w-120">
        <div className="space-y-6">
          {/* Línea decorativa superior */}
          <div className="flex justify-center">
            <Image
              src="/images/message/linea.svg"
              alt=""
              width={600}
              height={20}
              className="w-[90%] max-w-150 h-auto"
            />
          </div>

          {/* Título */}
          <h2 className="text-center font-dancing-script text-[clamp(34px,7vw,56px)] leading-none text-black">
            Mis padres
          </h2>

          {/* Bloque central */}
          <div className="relative mx-auto flex w-full justify-center py-8">
            {/* Flor de fondo */}
            <div className="relative h-[clamp(130px,34vw,170px)] w-[clamp(130px,34vw,170px)]">
              <Image
                src="/images/MusicSection/flower-rigth-music.svg"
                alt=""
                fill
                className="select-none object-contain"
                priority
              />
            </div>

            {/* Contenido sobre la flor */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-2">
              {/* Primera fila */}
              <div className="grid w-full grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="font-bad-script text-[clamp(16px,4.2vw,20px)] leading-relaxed text-black">
                    Erick Sandoval
                    <br />
                    Reveles
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-bad-script text-[clamp(16px,4.2vw,20px)] leading-relaxed text-black">
                    Pedro Ornelas
                    <br />
                    Ruiz
                  </p>
                </div>
              </div>

              {/* Corazones */}
              <div className="grid w-full grid-cols-2 items-center">
                <div className="flex justify-center">
                  <Image
                    src="/images/parents/corazon.svg"
                    alt=""
                    width={26}
                    height={28}
                    className="w-[clamp(18px,4vw,26px)] h-auto select-none"
                  />
                </div>

                <div className="flex justify-center">
                  <Image
                    src="/images/parents/corazon.svg"
                    alt=""
                    width={26}
                    height={28}
                    className="w-[clamp(18px,4vw,26px)] h-auto select-none"
                  />
                </div>
              </div>

              {/* Segunda fila */}
              <div className="grid w-full grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="font-bad-script text-[clamp(16px,4.2vw,20px)] leading-relaxed text-black">
                    Tania Jiménez
                    <br />
                    Márquez
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-bad-script text-[clamp(16px,4.2vw,20px)] leading-relaxed text-black">
                    Guadalupe
                    <br />
                    Garibay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Línea decorativa superior */}
          <div className="flex justify-center">
            <Image
              src="/images/message/linea.svg"
              alt=""
              width={600}
              height={20}
              className="w-[90%] max-w-150 h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
