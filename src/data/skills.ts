export const technologies = [
  { name: 'Java', icon: '/icons/tech/java.svg', category: 'Backend core' },
  { name: 'Spring Boot', icon: '/icons/tech/spring-boot.svg', category: 'Framework' },
  { name: 'Spring Security', icon: '/icons/tech/spring-security.svg', category: 'Security' },
  { name: 'MySQL', icon: '/icons/tech/mysql.svg', category: 'Database' },
  { name: 'Docker', icon: '/icons/tech/docker.svg', category: 'Delivery' },
  { name: 'AWS', icon: '/icons/tech/aws.svg', category: 'Cloud' },
  { name: 'Linux', icon: '/icons/tech/linux.svg', category: 'Systems' },
  { name: 'Angular', icon: '/icons/tech/angular.svg', category: 'Frontend support' },
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
