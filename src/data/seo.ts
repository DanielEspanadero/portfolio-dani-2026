import { profile } from './profile';

export const defaultSeo = {
  title: 'Daniel Españadero | Software Engineer Java, Spring Boot e IA',
  description:
    'Software Engineer especializado en backend, Java, Spring Boot, arquitectura e IA aplicada. Autor de un libro de programación y creador técnico en YouTube.',
  siteName: 'Daniel Españadero',
  image: '/og/default-og-image.png',
  url: profile.website,
} as const;
