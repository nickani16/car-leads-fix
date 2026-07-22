# Branch Policy

- `main` is the long-term canonical branch after consolidation.
- Temporary Codex work should use `codex/<scope>-YYYY-MM-DD`.
- Recovery branches should use `backup/<scope>-YYYY-MM-DD`.
- Do not use old Codex branches as long-lived bases.
- Do not merge broad historical branches into canonical baseline.
- Prefer file-by-file recovery or scoped cherry-picks when a commit is known clean.
- Use separate worktrees for major work.
- Keep commits small and scoped to one system area.
- Never force-push canonical branches without explicit owner approval.
- Archive old branches only after their contents are inventoried and classified.
