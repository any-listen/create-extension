import fs from 'node:fs/promises'
import path from 'node:path'

import type enUs from '../i18n/en-us.json'
import { DEFAULT_LANG } from './constants'

type Locale =
  | 'ar-sa'
  | 'cs-cz'
  | 'da-dk'
  | 'de-de'
  | 'el-gr'
  | 'en-au'
  | 'en-gb'
  | 'en-ie'
  | 'en-us'
  | 'en-za'
  | 'es-es'
  | 'es-mx'
  | 'fi-fi'
  | 'fr-ca'
  | 'fr-fr'
  | 'he-il'
  | 'hi-in'
  | 'hu-hu'
  | 'id-id'
  | 'it-it'
  | 'ja-jp'
  | 'ko-kr'
  | 'nl-be'
  | 'nl-nl'
  | 'no-no'
  | 'pl-pl'
  | 'pt-br'
  | 'pt-pt'
  | 'ro-ro'
  | 'ru-ru'
  | 'sk-sk'
  | 'sv-se'
  | 'th-th'
  | 'tr-tr'
  | 'zh-cn'
  | 'zh-hk'
  | 'zh-tw'

type Message = typeof enUs
type TranslateValues = Record<string, string | number | boolean>

const fillMessage = (message: string, vals: TranslateValues): string => {
  for (const [key, val] of Object.entries(vals)) {
    message = message.replaceAll(`{${key}}`, String(val))
  }
  return message
}

export const i18n = {
  locale: DEFAULT_LANG as Locale,
  fallbackMessage: {} as unknown as Message,
  message: {} as unknown as Message,
  async setLanguage(locale: Locale) {
    try {
      const messages = JSON.parse(await fs.readFile(path.join('../i18n', `${locale}.json`), 'utf-8')) as Message
      this.message = messages
    } catch {}
  },
  getMessage(key: keyof Message, val?: TranslateValues): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    let targetMessage = this.message[key] ?? this.fallbackMessage[key] ?? key
    return val ? fillMessage(targetMessage, val) : targetMessage
  },
  t(key: keyof Message, val?: TranslateValues): string {
    return this.getMessage(key, val)
  },
}

export const setLanguage = async (lang: Locale) => {
  await i18n.setLanguage(lang)
}

export const initI18n = async () => {
  const enUs = await fs.readFile(path.join(import.meta.dirname, '../../i18n', `${DEFAULT_LANG}.json`), 'utf-8')
  i18n.fallbackMessage = JSON.parse(enUs) as Message
  i18n.message = i18n.fallbackMessage

  await i18n.setLanguage(Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase() as Locale)
}

export const t = (key: keyof typeof i18n.message, values?: TranslateValues): string => {
  return i18n.t(key, values)
}
