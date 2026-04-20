import { select } from '@clack/prompts'

import { t } from '@/i18n'

import { checkCancel } from './shared'

export const prompts = async () => {
  const action = await select({
    message: t('template_type_message'),
    options: [
      { value: 'common', label: t('template_common'), hint: t('template_common_hint') },
      { value: 'isolate', label: t('template_isolate'), hint: t('template_isolate_hint') },
    ],
  })
  if (checkCancel(action)) return

  switch (action) {
    case 'common':
      await import('./common').then(async (module) => module.common())
      break
    case 'isolate':
      await import('./isolate').then(async (module) => module.isolate())
      break
  }
}
