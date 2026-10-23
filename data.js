// Single source of truth for both terminal and simple modes.
window.PORTFOLIO = {
  name: "Yasir Jafri",
  handle: "yasir",
  role: "Senior Software Engineer · Backend & Distributed Systems",
  location: "Delhi, India",
  tagline: "I design, build, and operate high-traffic backend systems in Python and Go, on AWS.",
  about: [
    "Senior Software Engineer with 5+ years building mission-critical backend services. I've been the sole owner of greenfield platforms serving 1M+ users and 100K+ concurrent entities.",
    "Most of my work sits in event-driven microservices, real-time stream processing with Kafka, and payments workflows that need strict reliability guarantees. I also ship Flutter frontends when the job calls for it.",
    "I mentor engineers, drive system-design decisions, and write about backend reliability on my blog.",
  ],
  skills: {
    Languages: ["Python", "Go", "Scala", "Java", "JavaScript", "Dart", "SQL"],
    Backend: ["FastAPI", "Django", "Gin", "Akka", "Spark", "gRPC", "GraphQL", "asyncio"],
    Data: ["PostgreSQL", "Redis", "MongoDB", "ScyllaDB", "ClickHouse", "Kafka", "Kafka Streams"],
    Cloud: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    Observability: ["OpenTelemetry", "Honeycomb", "SigNoz"],
    AI: ["LLM integration", "RAG", "Agentic AI", "MCP"],
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Purple Sphere (IDCUBE)",
      period: "May 2026 – present",
      highlights: [
        "Architected a medallion data pipeline (Kafka, S3, Spark, Redshift) for a multi-tenant analytics platform at sub-100ms p90 query latency.",
        "Built a multi-tenant onboarding platform on AWS with RBAC, sustaining sub-200ms p90 API latency under load.",
        "Set up end-to-end CI/CD and review standards across 5 projects and a 4-engineer team.",
      ],
    },
    {
      role: "Senior Software Engineer",
      company: "Appreciate",
      period: "Jul 2024 – Apr 2026",
      highlights: [
        "Sole owner of a real-time stock alert system tracking 15–20K symbols for 1M users at sub-2s end-to-end latency (SQS, Lambda, SNS, Redis).",
        "Cut critical API latency from 2–3s to under 100ms with asyncio and OpenTelemetry tracing.",
        "Built an idempotent UPI fund-addition flow handling ~1,000 transactions/day with zero duplicate transfers.",
        "Mentored up to 8 engineers and brought AI-assisted development into the team, speeding iteration cycles by 50%.",
      ],
    },
    {
      role: "Software Development Engineer I",
      company: "Gtropy (MapMyIndia)",
      period: "Sep 2021 – Jul 2024",
      highlights: [
        "Ran a Kafka Streams telemetry pipeline for ~100K vehicles, compressing 20GB to 2GB per cycle.",
        "Built a real-time trip engine with Akka FSM, isolating each vehicle's trip in its own actor.",
        "Migrated Django APIs to FastAPI, cutting p50 latency from 500ms to 100ms.",
      ],
    },
    {
      role: "Research Engineer & Technical Faculty",
      company: "iBotlab",
      period: "Jan 2021 – Jun 2021",
      highlights: [
        "Built Python prototypes in data analytics, computer vision, and AR; led a curriculum revamp that lifted client acquisition by 30%.",
      ],
    },
  ],
  projects: [
    {
      name: "askyourdb",
      stack: "Python, LangChain, SQLAlchemy",
      summary: "Ask a SQL database questions in plain English with your own LLM key. Generated SQL is validated as read-only, reviewed by a second LLM pass, then run and summarized.",
      url: "https://github.com/Yasir323/askyourdb",
    },
    {
      name: "investment-signal",
      stack: "Python, pandas, Claude API",
      summary: "Advisory-only stock signal engine. Ingests daily bars, corporate actions, and news, picks monthly investments from a watchlist, and backtests ranking rules on point-in-time data. Never places orders.",
      url: "",
    },
  ],
  blog: {
    url: "https://yasir323.hashnode.dev",
    posts: [
      { title: "Choosing a Primary Key: A Tour of the IDs Real Systems Actually Use", date: "Sep 2026", url: "https://yasir323.hashnode.dev/choosing-a-primary-key-a-tour-of-the-ids-real-systems-actually-use" },
      { title: "Picking the Right UUID Version (So Your Database Doesn't Hate You)", date: "Sep 2026", url: "https://yasir323.hashnode.dev/picking-the-right-uuid-version-so-your-database-doesn-t-hate-you" },
      { title: "Tap, Tap, Charged Twice: The Idempotency-Key Pattern", date: "Jun 2026", url: "https://yasir323.hashnode.dev/idempotency-key-pattern-python" },
      { title: "The Transactional Outbox Pattern in Python: Solving the Dual-Write Problem", date: "Jun 2026", url: "https://yasir323.hashnode.dev/transactional-outbox-pattern-python" },
      { title: "The Heap That Wouldn't Sit Still", date: "Jun 2026", url: "https://yasir323.hashnode.dev/the-heap-that-wouldn-t-sit-still" },
    ],
  },
  education: [
    { degree: "M.Tech, Electrical Engineering", school: "Jamia Millia Islamia", period: "2018 – 2020", note: "GPA 9.43, Gold Medalist" },
    { degree: "B.Tech, Electrical Engineering", school: "Jamia Millia Islamia", period: "2013 – 2017", note: "GPA 8.61" },
  ],
  contact: {
    email: "yasir.jafri007@gmail.com",
    github: "https://github.com/Yasir323",
    linkedin: "https://linkedin.com/in/yasir-jafri-8a9a3b105",
  },
  resume: "resume.pdf",
};
