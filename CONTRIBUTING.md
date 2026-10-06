# Contributing to Fitness Buddy Pro

Thank you for your interest in contributing to Fitness Buddy Pro! We are committed to maintaining a high-performance, well-architected codebase.

---

## Code Quality Standards

1. **Clean Architecture**: Place domain logic inside `server/src/services`, not controllers or routes.
2. **Testing Discipline**: Any new endpoint or utility calculation must include automated unit or integration tests in `server/tests`.
3. **Frontend Component Architecture**: Build reusable UI primitives inside `client/src/components/ui`. Avoid inlining redundant styling classes across pages.
4. **Zero Lint Errors**: Run `npm run lint` before opening pull requests.

---

## Development Workflow

1. Fork and clone the repository.
2. Create your feature branch: `git checkout -b feature/awesome-feature`
3. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. Run tests:
   ```bash
   cd server && npm test
   cd ../client && npm run lint
   ```
5. Commit using Conventional Commits: `feat: add progressive overload charts`
6. Open a Pull Request with a clear summary of changes and test results.
