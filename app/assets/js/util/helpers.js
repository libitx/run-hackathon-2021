export function fileIconClass(cty) {
  switch(true) {
    case cty === 'text/csv':
      return 'fa-file-csv'
    case cty === 'application/pdf':
      return 'fa-file-pdf'
    case cty === 'application/zip':
      return 'fa-file-archive'
    case /^audio\//.test(cty):
      return 'fa-file-audio'
    case /^image\//.test(cty):
      return 'fa-file-image'
    case /^text\//.test(cty):
      return 'fa-file-alt'
    case /^video\//.test(cty):
      return 'fa-file-video'
    default:
      return 'fa-file'
  }
}