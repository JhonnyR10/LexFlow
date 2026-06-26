// Timestamp compatto AAAAMMGG-HHMMSS in ora locale, per i nomi di archivio e
// delle cartelle di sicurezza (S11.3). Fonte unica per export e restore.
export function backupTimestamp(d: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  )
}
