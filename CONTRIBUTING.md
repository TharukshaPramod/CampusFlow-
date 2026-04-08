# Contributing

Thanks for contributing to CampusFlow.

## Development Standards

1. Branch from `main` using a clear name:
- `feat/<short-feature-name>`
- `fix/<short-bug-name>`
- `chore/<short-task-name>`

2. Keep changes focused
- Prefer small PRs with one clear purpose.
- Avoid mixing refactors with feature logic unless required.

3. Keep build and tests green before pushing
```bash
# Backend
cd backend/campusflow
mvn verify

# Frontend
cd ../../frontend
npm run lint
npm run build
npm test
```

## Commit Convention

Use consistent commit prefixes:
- `feat:` new behavior
- `fix:` bug fix
- `refactor:` internal code change without behavior change
- `docs:` documentation only
- `test:` tests only
- `chore:` maintenance/config

Examples:
- `feat: add booking conflict validation`
- `fix: handle redis reconnect for notification stream`

## Pull Request Checklist

Before opening PR:
- [ ] Rebased with latest `main`
- [ ] Added/updated tests for changed behavior
- [ ] No secrets or `.env` files committed
- [ ] Backend verification passed (`mvn verify`)
- [ ] Frontend checks passed (`npm run lint`, `npm run build`, `npm test`)
- [ ] Updated docs for any setup or API behavior changes

PR description should include:
- What changed
- Why it changed
- How it was tested
- Screenshots for UI changes

## Local Environment Notes

- Copy `.env.example` to `.env` before first run.
- Use Docker for PostgreSQL and Redis if not installed locally:
```bash
docker compose up -d postgres redis
```

## Code Review Expectations

1. Prioritize correctness and security.
2. Call out breaking changes explicitly.
3. Suggest improvements with concrete examples where possible.

## Need Help?

If setup/build fails, share:
- Operating system
- Command run
- Full error output
- What you already tried

This helps reviewers support you faster.
