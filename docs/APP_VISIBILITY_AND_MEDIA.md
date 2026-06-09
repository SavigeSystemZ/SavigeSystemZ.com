# Hiding Apps & Collecting Screenshots

This directory contains helper scripts for managing app visibility and media assets in the SavigeSystemZ platform.

## Hiding the Friction App

The Friction app has been removed from the public showcase. To complete the removal:

### 1. Hide from Database

```bash
# Set Friction visibility to DRAFT (hidden from public catalog)
./scripts/hide-friction.sh
```

Or manually via SQL:

```sql
UPDATE "Application" 
SET visibility = 'DRAFT', updatedAt = NOW()
WHERE slug = 'friction';
```

**Result:**
- ❌ Won't appear on `/applications` (public catalog)
- ❌ Won't appear on home page featured apps
- ❌ Won't appear in `/repos` (if code repo was public)
- ✅ Still editable via `/admin/applications/friction`

### 2. Make GitHub Repo Private

1. Navigate to: https://github.com/SavigeSystemZ/Friction/settings
2. Go to **Settings → General → Danger Zone**
3. Click **Change visibility**
4. Select **Private**
5. Confirm

**Result:**
- GitHub repo only accessible to team members
- Won't sync to catalog via `code:sync-org` command
- Public `/repos/friction` page will 404

---

## Collecting Screenshots from Local Repos

58 screenshots from 22 local app repositories have been collected and placed in `apps/web/public/showcase/app-media/`.

### Structure

```
apps/web/public/showcase/app-media/
├── app-scope/
│   ├── 01-dashboard.png
│   ├── 02-scans.png
│   └── 03-settings.png
├── budget-beacon/
│   ├── 01-dashboard.png
│   ├── 02-mission-control.png
│   └── 03-ledger.png
├── ... (20 more app directories)
```

### Which Apps Are Included

| App | Screenshots | Status |
|-----|-------------|--------|
| AppScope | 3 | ✅ Collected |
| BlueWraith | 1 | ✅ Collected |
| BudgetBeacon | 3 | ✅ Collected |
| CleanoutConnect | 3 | ✅ Collected |
| CodeSeal | 2 | ✅ Collected |
| CouplesWealth | 3 | ✅ Collected |
| DeepWeave | 2 | ✅ Collected |
| FlipHole | 1 | ✅ Collected |
| ForgeCouncil | 2 | ✅ Collected |
| GhostGrid | 3 | ✅ Collected |
| HQIQ | 3 | ✅ Collected |
| Immortality | 3 | ✅ Collected |
| LuxeLogic | 3 | ✅ Collected |
| ModPilot | 3 | ✅ Collected |
| Orignym | 3 | ✅ Collected |
| PromptMage | 3 | ✅ Collected |
| SiliconLedger | 3 | ✅ Collected |
| Sipher | 3 | ✅ Collected |
| SteadyStack | 3 | ✅ Collected |
| TraceForge | 3 | ✅ Collected |
| Vetraxis | 3 | ✅ Collected |
| WisdomWarp | 2 | ✅ Collected |

### Apps NOT Included

Apps without local screenshot directories:
- CandleCompass (no screenshots dir)
- EtherWeave (design screenshots but not user-facing)
- IdeaForge (no screenshots dir)
- LedgerLoop (no screenshots dir)
- PharmPhreak (no screenshots dir)
- Friction (HIDDEN from showcase)
- And 10+ internal/test apps

---

## Using the Screenshots

### Option 1: Upload via Admin UI

1. Log in as owner: `/owner/login`
2. Navigate: `/admin/applications`
3. Click on an app (e.g., "AppScope")
4. Scroll to **Media** section
5. Click **Add Media**
6. Select images from `apps/web/public/showcase/app-media/{slug}/`
7. Set as featured (optional)

### Option 2: Commit to Repo

Screenshots are ready to commit:

```bash
git add apps/web/public/showcase/app-media/
git commit -m "media: add 58 screenshots from 22 local app repos"
git push
```

### Option 3: Live App UI Capture

For the most current screenshots, run:

```bash
# Requires the apps to be running locally
pnpm code:capture-ui-screenshots --apps-only
```

This will:
- Start each app (Immortality, Vetraxis, etc.)
- Take fresh screenshots
- Save to `apps/web/public/showcase/manual/`

---

## Friction Removal Checklist

- [x] Hide from public catalog (set to DRAFT)
- [ ] Make GitHub repo private (manual step)
- [ ] Update `/admin/applications/friction` (optional: soft delete or archive)
- [ ] Verify not appearing on home page
- [ ] Verify not appearing in `/applications`
- [ ] Verify not appearing in `/repos`

---

## Related Commands

```bash
# Verify Friction is hidden
pnpm --filter web test -- --grep "friction"

# List all application visibility states
npm run db:query -- "SELECT slug, visibility FROM Application ORDER BY slug"

# Inspect media assets
ls -lh apps/web/public/showcase/app-media/

# Check app count by visibility
npm run db:query -- "SELECT visibility, COUNT(*) FROM Application GROUP BY visibility"
```

---

## See Also

- `apps/web/app/(public)/applications/page.tsx` — Public catalog (filters by `visibility = 'PUBLIC'`)
- `apps/web/app/(public)/page.tsx` — Home page (shows featured apps)
- `apps/web/lib/catalog-resolver.ts` — Catalog query logic
- `docs/CATALOG_OPERATIONS.md` — Media operations guide
