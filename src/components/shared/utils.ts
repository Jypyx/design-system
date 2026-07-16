/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
export const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

/* case- and diacritics-insensitive ("epee" matches "Épée") */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
