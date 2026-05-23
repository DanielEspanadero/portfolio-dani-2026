export type Locale = 'es' | 'en';

export const defaultLocale: Locale = 'es';

export const localeMeta: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  es: { label: 'ES', htmlLang: 'es', ogLocale: 'es_ES' },
  en: { label: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
};

export const localizedRoutes = {
  es: {
    home: '/',
    projects: '/proyectos/',
    book: '/libro/',
    youtube: '/youtube/',
  },
  en: {
    home: '/en/',
    projects: '/en/projects/',
    book: '/en/book/',
    youtube: '/en/youtube/',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const layoutCopy = {
  es: {
    skip: 'Saltar al contenido principal',
    navigationLabel: 'Navegación principal',
    brandLabel: 'Inicio - Daniel Españadero',
    profile: 'Perfil',
    stack: 'Stack',
    experience: 'Experiencia',
    authority: 'Autoridad',
    contact: 'Contacto',
    languageLabel: 'Cambiar idioma',
    footer: 'Backend, arquitectura e IA aplicada.',
  },
  en: {
    skip: 'Skip to main content',
    navigationLabel: 'Main navigation',
    brandLabel: 'Home - Daniel Españadero',
    profile: 'Profile',
    stack: 'Stack',
    experience: 'Experience',
    authority: 'Authority',
    contact: 'Contact',
    languageLabel: 'Change language',
    footer: 'Backend, architecture and applied AI.',
  },
} as const satisfies Record<Locale, Record<string, string>>;
