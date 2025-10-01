export function extractContactInfo(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(
    /(\+?\d{1,3}[\s-]?)?(\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4})/
  );
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name: string | null = null;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const parts = lines[i].split(/\s+/);
    if (
      parts.length >= 2 &&
      parts.length <= 4 &&
      /^[A-Za-z\s.'-]+$/.test(lines[i])
    ) {
      name = lines[i];
      break;
    }
  }

  return {
    name,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
  };
}
