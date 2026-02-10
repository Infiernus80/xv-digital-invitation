"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const DateSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-03-21T21:00:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor(
          (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
        );
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );

        setTimeLeft({ months, days, hours, minutes });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full mt-10">
      <div className="mx-auto max-w-110 overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Imagen superior */}
        <div className="flex w-full justify-center">
          <Image
            src="/images/Reception/Jenni D.jpeg"
            alt=""
            width={382}
            height={572}
          />
        </div>

        {/* Banner rosa con countdown */}
        <div className="bg-[#F35A7E] px-8 py-8">
          <div className="relative mb-6 flex items-center justify-center">
            <hr className="absolute left-0 w-1/4 border-white" />
            <h2 className="px-6 text-center font-dancing-script text-5xl text-white">
              Faltan
            </h2>
            <hr className="absolute right-0 w-1/4 border-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="font-dancing-script text-6xl italic leading-none text-white">
              {String(timeLeft.months).padStart(2, "0")}
            </span>
            <span className="flex items-center justify-center pb-4 ms-2 mt-4">
              <Image
                src="/images/date/Ellipse.svg"
                alt="·"
                width={20}
                height={20}
                className="opacity-100"
              />
            </span>
            <span className="font-dancing-script text-6xl italic leading-none text-white">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="flex items-center justify-center pb-4 ms-2 mt-4">
              <Image
                src="/images/date/Ellipse.svg"
                alt="·"
                width={20}
                height={20}
                className="opacity-100"
              />
            </span>
            <span className="font-dancing-script text-6xl italic leading-none text-white">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="font-dancing-script text-6xl italic leading-none text-white">
              :
            </span>
            <span className="font-dancing-script text-6xl italic leading-none text-white">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-2 flex justify-center gap-12 px-4">
            <span className="font-dancing-script text-xl text-white">
              Meses
            </span>
            <span className="font-dancing-script text-xl text-white">Días</span>
            <span className="font-dancing-script text-xl text-white">
              Horas
            </span>
            <span className="font-dancing-script text-xl text-white">
              Minutos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
