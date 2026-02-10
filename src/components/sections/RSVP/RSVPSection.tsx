"use client";

import Image from "next/image";
import { useState } from "react";
import { RSVPModal } from "./RSVPModal";

export const RSVPSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="w-full py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-110 px-4 sm:px-6 md:px-8">
        <div className="text-center">
          <h2 className="mb-4 font-dancing-script text-3xl sm:text-4xl">
            Confirma tu asistencia
          </h2>

          <p className="mb-6 sm:mb-8 text-base sm:text-lg font-bad-script px-4">
            Favor de confirmar antes del primero de enero
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block rounded-full bg-[#F35A7EB3] px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg md:text-[18px] font-bad-script font-semibold text-white shadow-lg transition-all hover:bg-pink-400 hover:shadow-xl"
          >
            Confirmar
          </button>

          {/* Decoración floral inferior */}
          <div className="my-8 sm:my-10 md:my-12 flex justify-center">
            <Image
              src="/images/message/linea.svg"
              alt=""
              width={600}
              height={20}
              className="w-full max-w-[600px] h-auto"
            />
          </div>
        </div>
      </div>

      <RSVPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
