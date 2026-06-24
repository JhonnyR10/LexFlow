// Electron IPC wraps service errors as:
// "Error invoking remote method '<channel>': ErrorClass: user-facing message"
// This helper extracts just the user-facing message.
export function ipcErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Errore sconosciuto'
  const match = err.message.match(/:\s*\w*Error:\s*(.+)$/s)
  return match ? match[1].trim() : err.message
}
