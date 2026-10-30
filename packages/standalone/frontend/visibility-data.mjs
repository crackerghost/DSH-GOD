export function visibilityCopy(locale) {
  return String(locale).toLowerCase().startsWith('en') ? {
    hideFree: 'Hide anonymous and Kilo free models',
    hideEac: 'Hide EAC models',
    hide: 'Hide model',
    show: 'Show model',
    hidden: 'Hidden by preference',
    groupHidden: 'Turn off group hiding first',
    saved: 'Model visibility saved',
  } : {
    hideFree: 'Hide Anonymous with Kilo Free Models',
    hideEac: 'Hide EAC model',
    hide: 'Hidden model',
    show: 'display model',
    hidden: 'Hidden by preference',
    groupHidden: 'Please turn off the entire group hiding first',
    saved: 'Model display settings saved',
  }
}
