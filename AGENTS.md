# Autorell Agent Rules

This repository uses Next.js 16. This is not the Next.js you may remember from older training data. Before changing Next.js routes, metadata, route handlers, middleware/proxy, or App Router types, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Canonical Source

- After the 2026-07-22 consolidation, the canonical branch is intended to be `main`.
- Until that merge is complete, the verified consolidation branch is `codex/autorell-canonical-baseline-2026-07-22`.
- Never start from an arbitrary local HEAD. Check branch, commit, remote, and status first.
- Always create a feature branch from the latest canonical commit.
- Use a separate worktree for larger or risky work.

## Change Discipline

- Identify the exact route and component files before implementing.
- Do not make unrelated refactors.
- Backend, admin, Stripe, and migrations must not ride along with a pure UI task.
- Check the full diff before every commit.
- Keep commits small and scoped by system area.
- Save project status after major changes.

## Deployment Safety

- Production must never be deployed from a dirty worktree.
- A production commit must exist on GitHub before production deployment.
- Do not run `vercel --prod` without explicit approval and a clean safety check.
- Prefer Vercel Git integration after merge to the canonical branch.
- Verify production deployment metadata: branch, commit SHA, target, state, and `gitDirty`.
