import Image from "next/image";

export const MessageSection = () => {
  return (
    <section className="w-full bg-white ">
      <div className="mx-auto max-w-110 px-8">
        <Image
          src="/images/message/linea.svg"
          alt=""
          // className="absolute left-0 top-15 -translate-y-1/2 -translate-x-1/2"
          width={390}
          height={135}
        />
        <div className="space-y-4 text-center">
          <p className="text-lg font-bad-script leading-relaxed text-slate-600">
            Con la bendición de Dios y el amor de mi familia, te invito a
            celebrar mis XV años.
          </p>
          <p className="text-lg font-bad-script leading-relaxed text-slate-600">
            Hay momentos inolvidables que se sueñan, se viven y se recuerdan
            para siempre, mi sueño se hace realidad y quiero que seas parte de
            él.
          </p>
          <Image
            src="/images/message/linea.svg"
            alt=""
            // className="absolute left-0 top-15 -translate-y-1/2 -translate-x-1/2"
            width={390}
            height={135}
          />
        </div>
      </div>
    </section>
  );
};
