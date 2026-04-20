import path from 'node:path'

import { spinner } from '@clack/prompts'

import { t } from '@/i18n'
import {
  checkDir,
  createEnvFile,
  downloadTemplate,
  fillFile,
  getTemplateConfig,
  installDependencies,
  moveDir,
  removeTemplateConfig,
} from '@/shared'

import { getCommonCondfig } from './shared'

export const common = async () => {
  const spin = spinner()
  spin.start(t('downloading_template'))
  const templateDir = await downloadTemplate('common')
  spin.stop(t('template_downloaded'))
  const templateConfig = await getTemplateConfig(templateDir)
  const { githubName, name, packageManageName } = (await getCommonCondfig())!
  spin.start(t('creating_project'))
  const finalPath = path.join(process.cwd(), name)
  await checkDir(finalPath)
  await fillFile(templateDir, templateConfig.fillFiles, { githubName, name, packageManageName })
  await removeTemplateConfig(templateDir, packageManageName)
  await moveDir(templateDir, finalPath)
  await createEnvFile(finalPath)
  spin.stop(t('project_created', { path: finalPath }))
  spin.start(t('installing_dependencies'))
  await installDependencies(finalPath, packageManageName)
  spin.stop(t('dependencies_installed'))
}
