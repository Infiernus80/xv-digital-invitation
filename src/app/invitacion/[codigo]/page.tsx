"use client";

import { useParams } from "next/navigation";
import { RSVPModal } from "@/components/sections/RSVP/RSVPModal";
import { useState, useEffect } from "react";

export default function InvitacionPage() {
  const params = useParams();
  const codigo = params.codigo as string;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (codigo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [codigo]);

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-dancing-script text-5xl sm:text-6xl text-slate-700 mb-4">
          Invitación XV Años
        </h1>
        <p className="font-bad-script text-xl text-slate-600">
          Jennifer Samantha
        </p>
      </div>

      <RSVPModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inviteCode={codigo}
      />
    </div>
  );
}
