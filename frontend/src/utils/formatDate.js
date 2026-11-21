/**
 * Formats an ISO or timestamp date string to a localized Indian date format (e.g., "15 Nov 2026").
 * Returns "Recently" if the date is null or invalid.
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default formatDate;
