import { TITLE_SEPARATOR, TITLES } from '../config'

export function buildTitle(...parts) {
  return [TITLES.SITE]
    .concat(parts || [])
    .filter(item => !!item)
    .join(TITLE_SEPARATOR)
}
