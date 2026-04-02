# SavigeSystemZ Non-Functional Requirements

## Performance
- Enforce Core Web Vitals budgets in CI for key routes
- Optimize images/video and avoid oversized client bundles
- Keep interaction latency snappy on mobile and desktop

## Accessibility
- Target WCAG 2.2 AA
- Keyboard navigable core flows
- Sufficient contrast and semantic structure

## Security
- OWASP ASVS-informed control baseline
- Rate limiting on auth, chat, submission, and comment endpoints
- Signed short-lived private file access
- Mandatory audit logging on sensitive actions

## Reliability
- Health endpoints and basic error budgets
- Build/deploy rollback runbook
- Alerting and incident triage playbook

## Maintainability
- Strict TypeScript and linting
- Milestone-based feature delivery with test gates
