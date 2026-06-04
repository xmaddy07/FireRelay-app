const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Display + storage format: DD/MM/YYYY */
export const formatFilterDisplayDate = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export const parseFilterDisplayDate = (displayDate: string): Date | undefined => {
  const trimmed = displayDate.trim();
  if (!trimmed) {
    return undefined;
  }

  const dateOnlyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateOnlyMatch) {
    const [, d, m, y] = dateOnlyMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const dateTimeMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (dateTimeMatch) {
    const [, d, m, y] = dateTimeMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const textDateMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (textDateMatch) {
    const [, d, monthLabel, y] = textDateMatch;
    const month = MONTH_INDEX[monthLabel.toLowerCase()];
    if (month === undefined) {
      return undefined;
    }
    const date = new Date(Number(y), month, Number(d), 0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    0,
    0,
    0,
    0,
  );
};

/** API query value: YYYY-MM-DD (date only, no time). */
export const filterDisplayDateToApi = (displayDate: string): string | undefined => {
  const date = parseFilterDisplayDate(displayDate);
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
