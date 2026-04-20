# Any Listen Extension Template Creator

English | [简体中文](docs/README.zh-CN.md)

Create Any Listen third-party extension project templates. Provides a universal template and an isolated-runtime template.

## Features

- Interactive template selection
- Downloads the latest template and scaffolds a project
- Generates a `.env` file (RSA keys included)
- Installs dependencies automatically

## Requirements

- Node.js >= 22
- A package manager: npm / yarn / pnpm

## Usage

Recommended with `npx` or `pnpm dlx`:

```bash
npm create @any-listen/extension
or
npx @any-listen/create-extension
```

```bash
pnpm dlx @any-listen/create-extension
```

## Interactive Flow

1. Select template type: universal / isolated-runtime
2. Enter GitHub user and repo (optional, format: `user/repo`)
3. Enter project name (required when GitHub is empty)
4. Select package manager

## Template Types

- Universal template: fits most extension projects
- Isolated-runtime template: for extensions that need a sub-isolated runtime environment

## Notes

- Templates are downloaded from the latest release of `any-listen/extension-template`
- Creation stops if a project folder with the same name already exists
- Dependency installation failures will stop the process

## Development

```bash
pnpm install
pnpm run build
```
