# Deployment Runbook

1. Start from canonical branch.
2. Create a feature branch from the latest canonical commit.
3. Confirm `git status --short` is clean before work starts.
4. Implement only the requested scope.
5. Review the full diff.
6. Run `npm ci` in a clean checkout when dependencies may have changed.
7. Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.
8. Push the feature branch.
9. Create a Vercel preview from the pushed branch.
10. Verify desktop and mobile routes, browser console, network errors, and server logs.
11. Open PR to canonical branch and merge only after review.
12. Deploy production through Vercel Git integration from canonical branch.
13. After production, verify deployment metadata: commit SHA, branch/ref, target, state, and `gitDirty`.

Do not run `vercel --prod` unless the owner explicitly approves after `scripts/verify-production-deploy.ps1` passes.
