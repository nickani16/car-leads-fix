# Recovery Report 2026-07-22

## Inventory Summary

Primary repository:

- Path: `C:\Users\Nikol\car-leads-fix`
- Original branch: `codex/autorell-mobile-foundation`
- Original HEAD: `d0dfb7136a98194921dd2f64d0382d5b7f651f69`
- Dirty state before recovery: 27 tracked changes and 44 untracked entries.

Important dirty worktrees:

- `C:\Users\Nikol\car-leads-fix`: probable dirty production source.
- `C:\Users\Nikol\.codex\visualizations\2026\07\13\019f59e2-5334-7f91-92c8-c751e1f9b907\correct-design-snapshot`: dirty design snapshot.
- `C:\Users\Nikol\.codex\visualizations\2026\07\13\019f5b38-3ba1-7ee3-91f4-646351c630aa\autorell-release`: dirty admin/business work.
- `C:\Users\Nikol\AppData\Local\Temp\autorell-deploy-43fe0ca`: dirty temp deploy worktree with mass deletions; not a baseline candidate.
- `C:\Users\Nikol\car-leads-fix\.worktrees\sell-pages-faq-copy-20260722`: dirty sell-page FAQ feature work, held for after baseline.

Stashes:

- `stash@{0}`: `qa-before-production-release`
- `stash@{1}`: backup before reset main to `9121f92`
- `stash@{2}`: WIP on main from early logo work

## Dirty Production Source

Vercel metadata confirms `dpl_448BDVg8gxZJGTvThieHysuVe4Xs` was built from `d0dfb713` with `gitDirty: 1`. Live pages include sell-car assets and route output that exist in the dirty main worktree but not in `d0dfb713` alone.

## Classification

Category A, verified current code:

- Dirty main worktree changes for public sell pages, sell assets, listing schema, listing creation/edit support, marketplace search v2, category-specific filters, billing catalog, localization, and proxy route support.
- Regression test and migration for structured listing offer/search data.

Category B, approved or plausible but not included in baseline:

- `codex/business-subscriptions-release` and admin/business work requiring separate review.
- Existing feature branch `codex/sell-pages-faq-copy-2026-07-22`, to be redone from canonical baseline.

Category C, old or rollbacked:

- Reverted multi-market filter branches and historical rollback branches.

Category D, experiment or unrelated:

- `.vercel-staging` copy.
- QA screenshots.
- `mobile/` Expo-style tree.
- `C:\Users\Nikol\AppData\Local\Temp\autorell-deploy-43fe0ca` mass-deletion worktree.

Category E, uncertain:

- Older stashes and detached visualisation deploy snapshots. They are preserved but not merged.

## Preservation

Recovery artifacts were written to `C:\Users\Nikol\autorell-recovery`, including patches, stats, file lists, untracked file lists, and copied untracked files.

Backup branches created:

- `backup/dirty-production-source-2026-07-22`
- `backup/correct-design-snapshot-2026-07-22`
- `backup/admin-control-center-2026-07-22`
- `backup/temp-autorell-deploy-43fe0ca-2026-07-22`
- `backup/sell-pages-faq-copy-2026-07-22`

## Canonical Baseline

- Branch: `codex/autorell-canonical-baseline-2026-07-22`
- Baseline recovery commit: `178d2ecc2b85fb6e47e6e9f5e7d469903f2fda13`
- Verification commits: `8cc0eb916e2fe53bf04a9bf3f8128d3f4ed5056f`, `b2a70b4c`, `f40622a1`
- Latest verified commit: `f40622a1`

## Verification

Clean worktree: `C:\Users\Nikol\autorell-canonical-verify`

- `npm ci`: passed; npm audit reports 8 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run test`: passed, 121/121.
- `npm run lint`: passed with 6 warnings.
- `npm run build`: passed when Supabase URL, anon key, and admin/service-role env vars were supplied.
