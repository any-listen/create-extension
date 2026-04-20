import { exec } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { TarOptionsWithAliasesAsyncNoFile } from 'tar'

import { t } from '@/i18n'
import { request } from '@/shared/request'

const unpack = async (file: string, dist: string, opts: TarOptionsWithAliasesAsyncNoFile = {}): Promise<void> => {
  const { x } = await import('tar')
  await x({
    file,
    C: dist,
    ...opts,
  })
}

export type TemplateType = 'common' | 'isolate'
const buildDownloadUrlTemplate = (type: TemplateType) => {
  return `https://github.com/any-listen/extension-template/releases/latest/download/${type}.tar.gz`
}
export const downloadTemplate = async (type: TemplateType) => {
  const tempDir = path.join(os.tmpdir(), 'any-listen-create-extension')
  await fs.mkdir(tempDir, { recursive: true })
  const fileDir = path.join(tempDir, `${type}-${Date.now()}.tar.gz`)
  const extractDir = path.join(tempDir, `${type}-${Date.now()}`)
  await fs.mkdir(extractDir, { recursive: true })
  const url = buildDownloadUrlTemplate(type)
  try {
    const response = await request<Uint8Array>(url, { needRaw: true })
    if (response.statusCode !== 200) {
      console.error(t('download_template_failed', { message: response.statusCode ?? 'Unknown Error' }))
      process.exit(1)
    }
    await fs.writeFile(fileDir, Buffer.from(response.raw))
    await unpack(fileDir, extractDir)
  } catch (error) {
    console.error(t('download_template_failed', { message: (error as Error).message }))
    process.exit(1)
  }
  void fs.unlink(fileDir)
  return extractDir
}

const getConfigPath = (templateDir: string) => path.join(templateDir, 'template.config.json')

export const getTemplateConfig = async (templateDir: string) => {
  return JSON.parse(await fs.readFile(getConfigPath(templateDir), 'utf-8')) as { fillFiles: string[] }
}

export const removeTemplateConfig = async (templateDir: string, packageManager: 'npm' | 'yarn' | 'pnpm') => {
  await fs.unlink(getConfigPath(templateDir))
  if (packageManager !== 'pnpm') {
    await fs.rm(path.join(templateDir, 'pnpm-lock.yaml'), { recursive: true, force: true })
  }
}

const formatProjectName = (name: string) => {
  const projectName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
  return projectName
}
const getAuthorName = async () => {
  return new Promise<string>((resolve) => {
    exec('git config user.name', (error, stdout) => {
      if (error) {
        resolve('')
        return
      }
      resolve(stdout.trim())
    })
  })
}
const fillNames = {
  '{githubName}': 'githubName',
  '{name}': 'name',
  '{projectName}': 'projectName',
  '{homepage}': 'homepage',
  '{author}': 'author',
} as const
const fillRxp = new RegExp(Object.keys(fillNames).join('|'), 'g')
export const fillFile = async (
  templateDir: string,
  fillFiles: string[],
  config: { githubName: string; name: string; packageManageName: string }
) => {
  const fullConfig = {
    ...config,
    projectName: formatProjectName(config.name),
    homepage: config.githubName ? `https://github.com/${config.githubName}#readme` : '',
    author: await getAuthorName(),
  }
  for (const fileName of fillFiles) {
    const filePath = path.join(templateDir, fileName)
    const contentLines = (await fs.readFile(filePath, 'utf-8')).split('\n')
    const newLines: string[] = []
    for (let line of contentLines) {
      const result = line.match(fillRxp)
      if (result) {
        for (const field of Array.from(result)) {
          let value = fullConfig[fillNames[field as keyof typeof fillNames]]
          if (value) {
            line = line.replace(field, value)
            newLines.push(line)
          }
        }
      } else newLines.push(line)
    }
    await fs.writeFile(filePath, newLines.join('\n'))
  }
}

export const checkDir = async (dir: string) => {
  if (
    await fs
      .stat(dir)
      .then((stat) => stat.isDirectory())
      .catch(() => false)
  ) {
    console.error(t('directory_exists', { dir }))
    process.exit(1)
  }
}

export const moveDir = async (from: string, to: string) => {
  try {
    await fs.rename(from, to)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'EXDEV') {
      await fs.cp(from, to, { recursive: true })
      await fs.rm(from, { recursive: true })
    } else {
      throw error
    }
  }
}

const generateRsaKey = async () => {
  return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki', // Note the type is pkcs1 not spki
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8', // Note again the type is set to pkcs1
          format: 'pem',
          // cipher: "aes-256-cbc", //Optional
          // passphrase: "", //Optional
        },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err)
          return
        }
        resolve({
          publicKey: publicKey.split('\n').slice(1, -2).join(''),
          privateKey: privateKey.split('\n').slice(1, -2).join(''),
        })
      }
    )
  })
}
export const createEnvFile = async (dir: string) => {
  const { publicKey, privateKey } = await generateRsaKey()
  const fileContent = `PRI_KEY=${privateKey}\nPUB_KEY=${publicKey}\n`
  await fs.writeFile(path.join(dir, '.env'), fileContent)
}

export const installDependencies = async (dir: string, packageManager: 'npm' | 'yarn' | 'pnpm') => {
  const { spawn } = await import('node:child_process')
  return new Promise<void>((resolve, reject) => {
    const installProcess = spawn(packageManager, ['install'], {
      cwd: dir,
      // stdio: 'inherit',
      shell: true,
    })

    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${packageManager} install process exited with code ${code}`))
      }
    })

    installProcess.on('error', (err) => {
      reject(err)
    })
  })
}
