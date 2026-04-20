import { text, isCancel, select } from '@clack/prompts'

import { t } from '@/i18n'

export const checkCancel = (value: unknown): value is symbol => {
  if (isCancel(value)) {
    console.log('Operation cancelled')
    process.exit(0)
  }
  return false
}

export const getCommonCondfig = async () => {
  const githubName = await text({
    message: t('template_github_name'),
    placeholder: 'username/repo',
    validate: (value) => {
      if (!value) return undefined
      if (!/^[\w-]+\/[\w.-]+$/.test(value)) return t('template_github_name_invalid')
      return undefined
    },
  })
  if (checkCancel(githubName)) return

  let defaultName = githubName.split('/')[1]
  const name = await text({
    message: t('template_project_name'),
    defaultValue: defaultName,
    initialValue: defaultName,
    validate: (value) => {
      const val = value || defaultName
      if (!val) return t('template_project_name_required')
      if (!/^[\w-]+$/.test(val)) return t('template_project_name_invalid')
      return undefined
    },
  })
  if (checkCancel(name)) return

  const packageManageName = await select({
    message: t('template_package_manager'),
    options: [
      { value: 'pnpm', label: 'pnpm' },
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
    ],
  })
  if (checkCancel(packageManageName)) return

  return {
    githubName,
    name,
    packageManageName,
  }
}
