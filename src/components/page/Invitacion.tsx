"use client";

import {
  CeremonySection,
  CoverSection,
  DateSection,
  DressCodeSection,
  HeroSection,
  MessageSection,
  MusicSection,
  ParentsSection,
  ReceptionSection,
  RSVPSection,
  SponsorsSection,
} from "@/components/sections";
import { RSVPModal } from "@/components/sections/RSVP/RSVPModal";
import { useEffect, useState } from "react";

type Props = {
  inviteCode?: string;
  autoOpenModal?: boolean;
};

export const InvitationClient = ({
  inviteCode = "",
  autoOpenModal = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [fadeCover, setFadeCover] = useState(false);

  useEffect(() => {
    if (autoOpenModal && inviteCode) {
      setIsOpen(true);
    }
  }, [autoOpenModal, inviteCode]);

  // Handler para click en el sello
  const handleSealClick = () => {
    setFadeCover(true);
    setTimeout(() => {
      setShowCover(false);
    }, 700); // Debe coincidir con la duración del fadeOut
  };

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-105 overflow-hidden">
        {showCover && (
          <CoverSection fadeOut={fadeCover} onSealClick={handleSealClick} />
        )}
        {!showCover && (
          <>
            <HeroSection />
            <MusicSection />
            <MessageSection />
            <DateSection />
            <SponsorsSection />
            <ParentsSection />
            <CeremonySection />
            <ReceptionSection />
            <DressCodeSection />
            <RSVPSection inviteCode={inviteCode} />
          </>
        )}
      </div>

      <RSVPModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inviteCode={inviteCode}
      />
    </main>
  );
};
