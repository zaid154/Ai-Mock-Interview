// Some AI responses contain a literal "\\n" instead of an actual line break.
// Normalize both forms so code and multi-line answers remain readable.
export function formatGeneratedText(value) {
  return String(value ?? '')
    .replaceAll('\\r\\n', '\n')
    .replaceAll('\\n', '\n')
    .replaceAll('\\t', '\t')
}
