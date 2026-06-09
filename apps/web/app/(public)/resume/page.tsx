import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@savige/ui";
import { ResumeContactForm } from "@/components/resume-contact-form";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional background, experience, and technical expertise.",
};

const resumeData = {
  summary:
    "Security-forward software engineer with 15+ years building scalable systems, release platforms, and operator-grade product experiences. Specialized in zero-trust architecture, distributed systems, and end-to-end encryption.",
  contact: {
    title: "Get in touch",
    description: "Interested in collaboration, consulting, or product partnerships? Send a message below.",
  },
  experience: [
    {
      period: "2024 – Present",
      role: "Founder & Principal Engineer",
      company: "SavigeSystemZ",
      highlights: [
        "Platform architecture for software showcase, release ops, and code distribution",
        "Zero-trust admin plane with RBAC and audit logging across all operations",
        "E2E encrypted vault system with key rotation and compliance tracking",
        "Stripe commerce integration with webhook security and purchase entitlements",
        "Container-first deployment with Postgres, Redis, and S3 integration",
      ],
    },
    {
      period: "2022 – 2024",
      role: "Senior Systems Engineer",
      company: "Distributed Systems Lab (Internal)",
      highlights: [
        "Designed and implemented self-hosted code repository backend with Git HTTP protocol",
        "Built release automation pipeline with artifact signing and secure distribution",
        "Created CLI tooling for local development environment management",
        "Evaluated and implemented security hardening across auth, storage, and API boundaries",
      ],
    },
    {
      period: "2020 – 2022",
      role: "Full-Stack Engineer",
      company: "Security-First Infrastructure",
      highlights: [
        "Led migration of legacy monolith to microservices with gRPC boundaries",
        "Implemented distributed tracing and observability across service mesh",
        "Built audit logging system capturing security events and compliance artifacts",
        "Designed WebAuthn/passkey integration for passwordless authentication",
      ],
    },
  ],
  skills: {
    languages: ["TypeScript", "Go", "Rust", "Python", "Bash"],
    frontend: ["React 19", "Next.js 16", "Tailwind CSS", "Playwright", "A11y"],
    backend: ["Node.js", "PostgreSQL", "Redis", "S3/Object Storage", "Docker"],
    infrastructure: [
      "Docker/Compose",
      "Kubernetes basics",
      "GitHub Actions",
      "Lambda/Serverless",
      "Linux (Ubuntu/Debian)",
    ],
    security: [
      "Zero-trust architecture",
      "HMAC/Crypto primitives",
      "RBAC/Auth systems",
      "E2E encryption",
      "Security audit & threat modeling",
    ],
    practices: [
      "TDD/Vitest",
      "E2E testing (Playwright)",
      "Code review discipline",
      "Release management",
      "Operator workflows",
    ],
  },
  projects: [
    {
      title: "SavigeSystemZ.com",
      description: "Flagship portfolio platform showcasing applications, code, and archive",
      tech: [
        "Next.js 16",
        "TypeScript",
        "Prisma ORM",
        "PostgreSQL",
        "Stripe API",
        "GitHub API",
        "Playwright E2E",
      ],
      link: "/",
    },
    {
      title: "Immortality (Local App Launcher)",
      description: "Environment-aware launcher for managing local development applications",
      tech: ["Rust", "GTK", "systemd", "Container integration"],
      link: "/applications/immortality",
    },
    {
      title: "Release Operations Tooling",
      description: "Signed release artifacts, asset management, and secure distribution",
      tech: ["Node.js", "S3", "HMAC signing", "CLI automation"],
      link: "/applications",
    },
  ],
  education: [
    {
      degree: "Self-directed study & continuous learning",
      area: "Distributed systems, security, and DevOps",
      highlights: [
        "Deep work in cryptography, system design, and production operations",
        "Active open-source contributions and community engagement",
        "Regular security audit and threat modeling participation",
      ],
    },
  ],
};

export default function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      {/* Header */}
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <SectionHeading
              eyebrow="Professional profile"
              title="Michael Spaulding"
              description={resumeData.summary}
            />
          </div>
          <Link
            href="/bio"
            className="action-secondary text-sm"
          >
            About the platform
          </Link>
        </div>
      </section>

      {/* Experience */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Experience
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            15+ years building security-forward systems and release platforms
          </p>
        </div>

        <div className="space-y-4">
          {resumeData.experience.map((job, idx) => (
            <article
              key={idx}
              className="surface-panel rounded-[1.5rem] border border-white/10 p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{job.role}</h3>
                  <p className="text-sm text-slate-400">{job.company}</p>
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {job.period}
                </p>
              </div>
              <ul className="mt-4 space-y-2">
                {job.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500/50" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Skills & Expertise
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(resumeData.skills).map(([category, items]) => (
            <article
              key={category}
              className="surface-panel rounded-[1.5rem] border border-white/10 p-4"
            >
              <h3 className="font-semibold text-white capitalize">
                {category.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="signal-chip rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Featured Projects
          </h2>
        </div>

        <div className="space-y-4">
          {resumeData.projects.map((project, idx) => (
            <article
              key={idx}
              className="surface-panel rounded-[1.5rem] border border-white/10 p-6"
            >
              <Link
                href={project.link}
                className="group inline-block"
              >
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-cyan-300">
                  {project.title}
                </h3>
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Continuous Learning
          </h2>
        </div>

        <article className="surface-panel rounded-[1.5rem] border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">
            {resumeData.education[0].degree}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{resumeData.education[0].area}</p>
          <ul className="mt-4 space-y-2">
            {resumeData.education[0].highlights.map((highlight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500/50" />
                {highlight}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Contact Section */}
      <section className="mt-8">
        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow={resumeData.contact.title}
            title="Let's work together"
            description={resumeData.contact.description}
          />
          <div className="mt-8">
            <ResumeContactForm />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mt-8 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-slate-400">
          Interested in seeing more? Browse the portfolio or check out the code repositories.
        </p>
        <div className="flex gap-4">
          <Link href="/applications" className="action-secondary text-sm">
            View Applications
          </Link>
          <Link href="/repos" className="action-secondary text-sm">
            Browse Code
          </Link>
        </div>
      </section>
    </main>
  );
}
