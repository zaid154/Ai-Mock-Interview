// Initial seed bank for offline fallback questions and sample candidate profiles
const questions = [
  // Frontend
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'Explain the difference between let, const, and var in JavaScript.' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'What is the box model in CSS?' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'How does event delegation work in DOM scripting, and what are its benefits?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: "How does React's virtual DOM work, and why is it useful?" },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'When would you reach for useMemo or useCallback, and what are the risks of overusing them?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'Explain the difference between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR).' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'A page is janky while scrolling a long list. How do you diagnose and fix it?' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'How would you architect a micro-frontend architecture for a large enterprise web portal?' },

  // Backend
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What is the difference between PUT and PATCH in a REST API?' },
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What are database indexes, and how do B-tree indexes speed up SELECT queries?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'What are the trade-offs between SQL and NoSQL databases?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'How would you design an idempotent payment endpoint?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'Explain how the Node.js event loop handles non-blocking I/O operations.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'Design a rate limiter for a public REST API. Walk through your approach.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'A query that used to take 20ms now takes 3s under load. How do you investigate?' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'How do you handle distributed transactions across multiple microservices without 2PC deadlocks?' },

  // Full Stack
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'Walk me through what happens when a user types a URL and hits enter.' },
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'What are CORS headers, and how do you configure them securely on client and server?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How would you secure a JWT-based authentication flow end to end?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How do you keep the client and server in sync on shared validation rules?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'Compare WebSockets vs Server-Sent Events (SSE) vs Polling for real-time notifications.' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'Design a URL shortener. Cover the API, storage, and how you generate short codes.' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'How would you build a real-time collaborative document editor like Google Docs?' },

  // System Design & DevOps
  { role: 'System Design', difficulty: 'medium', prompt: 'How do content delivery networks (CDNs) cache dynamic asset payloads near edge users?' },
  { role: 'System Design', difficulty: 'hard', prompt: 'Design a high-throughput notification service that handles millions of push notifications per second.' },
  { role: 'DevOps & Cloud', difficulty: 'medium', prompt: 'What is the difference between Docker containers and virtual machines?' },
  { role: 'DevOps & Cloud', difficulty: 'hard', prompt: 'Walk through setting up a zero-downtime blue/green deployment strategy on Kubernetes.' },

  // Behavioral
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Tell me about a time you resolved a conflict with a teammate.' },
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Describe a project you are proud of and your specific contribution to it.' },
  { role: 'Behavioral', difficulty: 'medium', prompt: 'Tell me about a time you disagreed with a technical decision. What did you do?' },
  { role: 'Behavioral', difficulty: 'medium', prompt: 'Describe a time you shipped something under a tight deadline. What did you trade off?' },
]

const SAMPLE_CANDIDATES = [
  {
    name: 'Mohd Zaid',
    email: 'zaidm1323@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Lead Fullstack & AI Systems Architect',
    password: 'ChangeMe123!',
    interviews: [
      { role: 'Frontend Developer', difficulty: 'hard', mode: 'questions', overallScore: 94, summary: 'Outstanding technical depth in React fiber reconciliation and DOM optimization.' },
      { role: 'Backend Architect', difficulty: 'hard', mode: 'questions', overallScore: 96, summary: 'Exceptional knowledge of Node.js event loop lag and Redis rate limiting.' },
      { role: 'System Design', difficulty: 'hard', mode: 'questions', overallScore: 92, summary: 'Strong design breakdown for globally distributed URL shortener.' },
      { role: 'DevOps & Cloud', difficulty: 'hard', mode: 'questions', overallScore: 95, summary: 'Excellent explanation of Istio canary deployments and Prometheus alerts.' },
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'quiz', overallScore: 98, summary: 'Perfect score on end-to-end full stack security & JWT token validation quiz.' },
    ],
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Senior Distributed Systems & Backend Engineer',
    password: 'Password123!',
    interviews: [
      { role: 'Backend Architect', difficulty: 'hard', mode: 'questions', overallScore: 94, summary: 'Deep expertise in database sharding and distributed consensus protocols.' },
      { role: 'System Design', difficulty: 'medium', mode: 'questions', overallScore: 92, summary: 'Well-structured microservices decomposition with clear fault tolerance.' },
      { role: 'SQL Database Engineer', difficulty: 'medium', mode: 'quiz', overallScore: 89, summary: 'High accuracy in query optimization and index design.' },
      { role: 'Full Stack Developer', difficulty: 'hard', mode: 'questions', overallScore: 90, summary: 'Solid understanding of REST API idempotency and GraphQL resolvers.' },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Frontend UI/UX Specialist & React Guru',
    password: 'Password123!',
    interviews: [
      { role: 'Frontend Developer', difficulty: 'hard', mode: 'questions', overallScore: 91, summary: 'Great understanding of web performance metrics and virtualized lists.' },
      { role: 'React Specialist', difficulty: 'medium', mode: 'questions', overallScore: 88, summary: 'Clean state management breakdown with custom hooks.' },
      { role: 'UI Engineer', difficulty: 'easy', mode: 'quiz', overallScore: 92, summary: 'Perfect grasp of CSS Grid, Flexbox layout math, and accessibility.' },
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'questions', overallScore: 84, summary: 'Good client-server integration awareness.' },
    ],
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'MERN Stack Developer & Cloud Enthusiast',
    password: 'Password123!',
    interviews: [
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'questions', overallScore: 84, summary: 'Clear communication of Node.js async operations and Express middleware.' },
      { role: 'Backend Developer', difficulty: 'medium', mode: 'quiz', overallScore: 82, summary: 'Good knowledge of MongoDB aggregation pipelines.' },
      { role: 'Frontend Developer', difficulty: 'easy', mode: 'questions', overallScore: 80, summary: 'Solid JavaScript closure and prototype chain understanding.' },
    ],
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    bio: 'DevOps & Kubernetes Cloud Specialist',
    password: 'Password123!',
    interviews: [
      { role: 'DevOps & Cloud', difficulty: 'medium', mode: 'questions', overallScore: 82, summary: 'Strong grasp of Docker containerization and CI/CD pipelines.' },
      { role: 'System Reliability', difficulty: 'medium', mode: 'quiz', overallScore: 78, summary: 'Good understanding of monitoring and alert thresholds.' },
      { role: 'Backend Developer', difficulty: 'easy', mode: 'questions', overallScore: 75, summary: 'Decent foundational REST API design skills.' },
    ],
  },
]


module.exports = { questions, SAMPLE_CANDIDATES };
