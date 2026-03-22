# Contributing to Medusa Elasticsearch Plugin

Thank you for considering contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+
- A running Elasticsearch instance (local or cloud)
- A Medusa v2 application for testing

### Setup

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-username>/medusa-plugin-elasticsearch.git
cd medusa-plugin-elasticsearch
```

2. Install dependencies:

```bash
npm install
```

3. Build the plugin:

```bash
npm run build
```

### Local Development

To test the plugin locally with a Medusa application, use the Medusa plugin development tools:

```bash
# Publish to local Yalc registry (one-time)
npx medusa plugin:publish

# Watch mode: auto-rebuild and republish on changes
npx medusa plugin:develop
```

In your Medusa application:

```bash
# Install the local plugin
npx medusa plugin:add medusa-plugin-elasticsearch
```

## Making Changes

### Branch Naming

- `feature/<description>` -- for new features
- `fix/<description>` -- for bug fixes
- `docs/<description>` -- for documentation changes

### Code Style

- Use TypeScript for all source files
- Follow the existing code patterns in the project
- Keep functions focused and concise
- Add types for all function parameters and return values

### Project Structure

```
src/
  modules/elasticsearch/   # Core module (service, types, loader)
  subscribers/             # Event handlers
  workflows/               # Transactional workflows
  api/                     # API routes and middleware
  jobs/                    # Scheduled tasks
  utils/                   # Shared utilities
  types/                   # Public type exports
```

### Key Patterns

- **Module service** (`src/modules/elasticsearch/service.ts`): All Elasticsearch client operations go here
- **Workflows** (`src/workflows/`): Multi-step operations with compensation/rollback
- **Subscribers** (`src/subscribers/`): Event-driven handlers that trigger workflows
- **API routes** (`src/api/`): HTTP endpoints with Zod validation

## Submitting Changes

1. Create a new branch from `main`
2. Make your changes
3. Ensure the plugin builds without errors: `npm run build`
4. Write a clear commit message describing the change
5. Open a pull request against `main`

### Pull Request Guidelines

- Keep PRs focused on a single change
- Describe what the PR does and why
- Reference any related issues
- Include testing steps if applicable

## Reporting Issues

When reporting bugs, please include:

- Your Medusa version
- Your Elasticsearch version
- Steps to reproduce the issue
- Expected vs actual behavior
- Any relevant error messages or logs

## Feature Requests

Feature requests are welcome! Open an issue describing:

- The use case for the feature
- How you envision it working
- Any alternatives you've considered

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
