module.exports.stripped_strings = function (elems) {
  const strings = []
  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i]
    if (elem.type === 'text') {
      const texts = elem.data
        .split(/\r?\n/)
        .map(text => text.trim())
        .filter(text => text)
      strings.push(...texts)
    } else if (
      elem.children &&
      elem.type !== 'comment' &&
      elem.tagName !== 'script' &&
      elem.tagName !== 'style') {
      strings.push(...this.stripped_strings(elem.children))
    }
  }

  return strings
}
