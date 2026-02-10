import Image from "next/image";

export const ParentsSection = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-110 px-8">
        <div className="space-y-6">
          {/* Línea decorativa superior */}
          <div className="flex justify-center">
            <Image
              src="/images/message/linea.svg"
              alt=""
              width={600}
              height={20}
            />
          </div>

          {/* Título */}
          <h2 className="text-center font-dancing-script text-6xl text-black">
            Mis padres
          </h2>

          {/* Contenedor con flor de fondo y textos superpuestos */}
          <div className="relative flex justify-center py-8">
            {/* Flor de fondo */}
            <Image
              src="/images/MusicSection/flower-rigth-music.svg"
              alt=""
              width={150}
              height={150}
            />

            {/* Textos posicionados sobre la flor */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              {/* Primera fila de nombres */}
              <div className="flex w-full justify-between">
                <div className="text-center">
                  <p className="font-bad-script text-xl leading-relaxed text-black">
                    Erick Sandoval
                    <br />
                    Reveles
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bad-script text-xl leading-relaxed text-black">
                    Pedro Ornelas
                    <br />
                    Ruiz
                  </p>
                </div>
              </div>

              {/* Corazones */}
              <div className="flex gap-55.5">
                <Image
                  src="/images/parents/corazon.svg"
                  alt=""
                  width={26}
                  height={28}
                />
                <Image
                  src="/images/parents/corazon.svg"
                  alt=""
                  width={26}
                  height={28}
                />
              </div>

              {/* Segunda fila de nombres */}
              <div className="flex w-full justify-between px-2">
                <div className="text-center">
                  <p className="font-bad-script text-xl leading-relaxed text-black">
                    Tania Jiménez
                    <br />
                    Márquez
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bad-script text-xl leading-relaxed text-black">
                    Guadalupe
                    <br />
                    Garibay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Línea decorativa inferior */}
          <div className="flex justify-center">
            <Image
              src="/images/message/linea.svg"
              alt=""
              width={600}
              height={20}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
