# Runtime Modules

Each module owns domain logic and API orchestration for its bounded context.

- `catalog` - apps, versions, release listings
- `releases` - artifact metadata and changelog assembly
- `payments` - checkout and entitlement transitions
- `ai` - concierge retrieval and prompt safety
- `reviews` - comments/ratings and moderation hooks
- `creator-submissions` - intake pipeline and approvals
- `project-requests` - custom project demand pipeline
- `vault` - owner-only private data controls
- `admin` - operational workflows and dashboards
- `auth` - identity and role handling
