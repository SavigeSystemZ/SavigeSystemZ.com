# Code Patterns — SavigeSystemZ.com

Canonical patterns for common tasks. AI agents should follow these exactly to maintain codebase consistency.

## New API route (admin, protected)

```typescript
// app/api/admin/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const ExampleSchema = z.object({
  name: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck;

  const body = await request.json();
  const parsed = ExampleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  // ... business logic with db ...

  await writeAuditLog({ action: "example.created", userId: auth.userId!, detail: parsed.data.name });

  return NextResponse.json({ success: true });
}
```

## New API route (public)

```typescript
// app/api/public-example/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // ... read from db ...
  return NextResponse.json({ data: [] });
}
```

## New public page with Prisma data

```typescript
// app/(public)/example/page.tsx
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExamplePage() {
  const items = await db.example.findMany({ where: { status: "PUBLIC" } });
  return (
    <main>
      {/* ... render items with Tailwind ... */}
    </main>
  );
}
```

## New admin page

```typescript
// app/(admin)/admin/example/page.tsx
export const dynamic = "force-dynamic";

export default async function AdminExamplePage() {
  // Admin pages are HTML-gated by proxy.ts
  // Data fetching happens client-side via admin API routes
  return (
    <main>
      {/* ... admin UI with components/admin/ patterns ... */}
    </main>
  );
}
```

## Rate-limited endpoint

```typescript
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = await rateLimitByIp(ip, { window: 60_000, max: 10 });
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... handler logic ...
}
```

## Prisma schema addition

```prisma
model NewEntity {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("DRAFT")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then: `DATABASE_URL="file:./dev.db" pnpm exec prisma migrate dev --name add-new-entity`

## Test pattern (Vitest unit)

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from "vitest";

describe("exampleFunction", () => {
  it("should handle the happy path", () => {
    // ... test logic ...
    expect(result).toBe(expected);
  });

  it("should reject invalid input", () => {
    // ... negative test ...
    expect(() => fn(bad)).toThrow();
  });
});
```
