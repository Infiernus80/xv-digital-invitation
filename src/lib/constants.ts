export const SiteConfig = {
  title: "Invitación XV",
  description: "Invitación digital de XV años",
} as const;

export const FontConfig = {
  moonTime: "var(--font-moon-time)",
  elegant: "font-moon-time",
  heading: "heading-elegant",
  text: "text-elegant",
} as const;

export const RSVPConfig = {
  // Edad límite para considerar un menor como boleto infantil
  // Menores de esta edad: 2 niños = 1 boleto
  // Mayor o igual a esta edad: 1 boleto normal
  // Con valor 9, aplica 2x1 para niños de 8 años o menos.
  childTicketAgeLimit: 9,
} as const;
