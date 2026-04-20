import { execSync } from 'node:child_process'
import { builtinModules } from 'node:module'
import path from 'node:path'

import type { UserConfig } from 'vite'

import { dependencies } from './package.json' with { type: 'json' }

const rootPath = path.join(import.meta.dirname, './')
const projectPath = path.join(rootPath, 'src')

const gitInfo = {
  commit_id: '',
  commit_date: '',
}
try {
  if (!execSync('git status --porcelain').toString().trim()) {
    gitInfo.commit_id = execSync('git log -1 --pretty=format:"%H"').toString().trim()
    gitInfo.commit_date = execSync('git log -1 --pretty=format:"%ad" --date=iso-strict').toString().trim()
  } else if (process.env.IS_CI) {
    console.error('Working directory is not clean')
    process.exit(1)
  }
} catch (err) {
  if (process.env.IS_CI) {
    const commitId = process.env.GIT_COMMIT_ID
    const commitDate = process.env.GIT_COMMIT_DATE
    if (!commitId || !commitDate) {
      throw new Error('GIT_COMMIT_ID and GIT_COMMIT_DATE environment variables are required in CI', { cause: err })
    }
    gitInfo.commit_id = commitId
    gitInfo.commit_date = commitDate
  }
}
export const config: UserConfig = {
  base: './',
  mode: process.env.NODE_ENV,
  publicDir: false,
  resolve: {
    alias: {
      '@': projectPath,
    },
    conditions: ['module', 'node', 'default', 'development|production'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    target: 'node16',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    outDir: path.join(rootPath, 'dist'),
    lib: {
      entry: path.join(projectPath, 'index.ts'),
      formats: ['es'],
      fileName: 'bin',
    },
    rolldownOptions: {
      external: [...builtinModules.flatMap((m) => [m, `node:${m}`]), ...Object.keys(dependencies)],
    },
  },
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV!}"`,
    __GIT_COMMIT__: `"${gitInfo.commit_id}"`,
    __GIT_COMMIT_DATE__: `"${gitInfo.commit_date}"`,
  },
}

export default config
