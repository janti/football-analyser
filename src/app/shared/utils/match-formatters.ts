export function formatKickoffTime(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatMatchStatus(status: string, minute: number | null | undefined): string {
  if (minute !== null && minute !== undefined && status === '1H') {
    return `1st Half ${minute}'`;
  }
  if (minute !== null && minute !== undefined && status === '2H') {
    return `2nd Half ${minute}'`;
  }

  const map: Record<string, string> = {
    NS: 'Not started',
    FT: 'Full time',
    HT: 'Half time',
    ET: 'Extra time',
    PEN: 'Penalties',
    PST: 'Postponed',
    CANC: 'Cancelled'
  };
  return map[status] ?? status;
}

export function formatScore(home: number | null, away: number | null): string {
  return `${home ?? '-'} - ${away ?? '-'}`;
}
