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

  useEffect(() => {
    if (autoOpenModal && inviteCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [autoOpenModal, inviteCode]);

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-105 overflow-hidden">
        <CoverSection />
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
      </div>

      <RSVPModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inviteCode={inviteCode}
      />
    </main>
  );
};
