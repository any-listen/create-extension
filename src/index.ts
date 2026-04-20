#!/usr/bin/env node

import pc from 'picocolors'

import { initI18n, t } from './i18n'
import { prompts } from './prompts'

const main = async () => {
  await initI18n().catch((error) => {
    console.error('Failed to initialize i18n:', error)
    process.exit(1)
  })

  console.log(pc.green(t('welcome_message')))

  await prompts()

  console.log(pc.green(t('goodbye_message')))
}

void main()
