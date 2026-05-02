export const technologies = [
  { name: 'Java', icon: '/icons/tech/java.svg', category: 'Backend core', color: '248 152 32' },
  { name: 'Spring Boot', icon: '/icons/tech/spring-boot.svg', category: 'Framework', color: '109 179 63' },
  { name: 'Spring Security', icon: '/icons/tech/spring-security.svg', category: 'Security', color: '109 179 63' },
  { name: 'MySQL', icon: '/icons/tech/mysql.svg', category: 'Database', color: '0 117 143' },
  { name: 'Docker', icon: '/icons/tech/docker.svg', category: 'Delivery', color: '36 150 237' },
  { name: 'AWS', icon: '/icons/tech/aws.svg', category: 'Cloud', color: '255 153 0' },
  { name: 'Linux', icon: '/icons/tech/linux.svg', category: 'Systems', color: '252 199 54' },
  { name: 'Angular', icon: '/icons/tech/angular.svg', category: 'Frontend support', color: '221 0 49' },
] as const;

export const technicalPractices = [
  {
    title: 'Arquitectura backend',
    description: 'Hexagonal Architecture, límites claros, diseño de APIs y separación de responsabilidades.',
  },
  {
    title: 'Calidad y evolución',
    description: 'Clean Code, testing con JUnit/Mockito y código preparado para cambiar sin romperse.',
  },
  {
    title: 'IA aplicada',
    description: 'Spring AI, integraciones con LLMs, RAG y workflows útiles en sistemas reales.',
  },
  {
    title: 'Sistemas enterprise',
    description: 'Seguridad, SQL, Docker, Linux y despliegue en contextos donde la mantenibilidad importa.',
  },
] as const;
