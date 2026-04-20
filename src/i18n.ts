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

const getI18nFile = async (locale: Locale) => {
  return JSON.parse(await fs.readFile(path.join(import.meta.dirname, '../i18n', `${locale}.json`), 'utf-8')) as Message
}

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
      const messages = await getI18nFile(locale)
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
  i18n.fallbackMessage = await getI18nFile(DEFAULT_LANG)
  i18n.message = i18n.fallbackMessage

  await i18n.setLanguage(Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase() as Locale)
}

export const t = (key: keyof typeof i18n.message, values?: TranslateValues): string => {
  return i18n.t(key, values)
}
