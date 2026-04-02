/**
 * RFC 4180–style CSV field escaping for tabular exports.
 */
export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvRow(cells: string[]): string {
  return `${cells.map(escapeCsvField).join(",")}\r\n`;
}
