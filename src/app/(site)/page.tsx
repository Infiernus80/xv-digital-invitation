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

export default function Page() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden">
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
        <RSVPSection />
      </div>
    </main>
  );
}
