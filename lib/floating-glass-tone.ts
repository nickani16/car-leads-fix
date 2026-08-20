const sampleColumns = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92]
const sampleRows = [0.2, 0.5, 0.8]

const darkEnterThreshold = 0.68
const darkExitThreshold = 0.48

function parseBackgroundColor(value: string) {
  const color = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!color) return null

  return {
    red: Number(color[1]),
    green: Number(color[2]),
    blue: Number(color[3]),
    alpha: color[4] === undefined ? 1 : Number(color[4]),
  }
}

function pointIsDark(root: HTMLElement, x: number, y: number) {
  const elements = document.elementsFromPoint(x, y)

  for (const element of elements) {
    if (root.contains(element)) continue
    if (element.closest('[data-autorell-mobile-nav-tone], [data-autorell-floating-shortcuts-tone]')) continue

    if (element.closest('[data-autorell-media-surface]')) return true

    const background = parseBackgroundColor(window.getComputedStyle(element).backgroundColor)
    if (!background || background.alpha < 0.55) continue

    const luminance = (
      background.red * 0.2126 +
      background.green * 0.7152 +
      background.blue * 0.0722
    ) / 255

    return luminance < 0.28
  }

  return false
}

export function floatingGlassDarkCoverage(root: HTMLElement | null) {
  if (!root || typeof document === 'undefined') return 0

  const rect = root.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return 0

  let darkPoints = 0
  let measuredPoints = 0

  for (const row of sampleRows) {
    const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height * row))
    for (const column of sampleColumns) {
      const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width * column))
      measuredPoints += 1
      if (pointIsDark(root, x, y)) darkPoints += 1
    }
  }

  return measuredPoints ? darkPoints / measuredPoints : 0
}

export function shouldUseDarkFloatingGlass(root: HTMLElement | null, currentlyDark: boolean) {
  const darkCoverage = floatingGlassDarkCoverage(root)
  return currentlyDark
    ? darkCoverage >= darkExitThreshold
    : darkCoverage >= darkEnterThreshold
}
