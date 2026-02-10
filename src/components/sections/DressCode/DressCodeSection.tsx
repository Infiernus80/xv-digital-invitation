import Image from "next/image";

export const DressCodeSection = () => {
  return (
    <section className="w-full bg-white ">
      <div className="mx-auto px-8">
        <div className="relative text-center">
          {/* Flor decorativa izquierda */}
          <div className="absolute -left-32 top-0">
            <Image
              src="/images/MusicSection/flower-left-music.svg"
              alt=""
              width={188}
              height={385}
              className=""
            />
          </div>

          {/* Flor decorativa derecha */}
          <div className="absolute -right-32 top-0">
            <Image
              src="/images/MusicSection/flower-rigth-music.svg"
              alt=""
              width={188}
              height={385}
              className=""
            />
          </div>

          <h2 className="mb-8 font-dancing-script text-5xl font-bold text-slate-700">
            Dress Code Formal
          </h2>

          {/* Ilustración de trajes */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/dressCode/dressCode.svg"
              alt=""
              width={300}
              height={300}
            />
          </div>

          <p className="font-bad-script text-xl text-black">
            Por favor evitemos el color rosa en cualquier
            <br />
            tono, lo reservaremos para la quinceañera
          </p>
        </div>
      </div>
    </section>
  );
};
