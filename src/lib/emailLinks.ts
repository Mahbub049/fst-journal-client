export const normalizeEmailAddress = (value?: string) =>
  String(value || "")
    .replace(/^mailto:/i, "")
    .split("?")[0]
    .trim();

export const buildGmailComposeUrl = (
  email?: string,
  subject = "",
  body = ""
) => {
  const to = normalizeEmailAddress(email);
  const params = new URLSearchParams({ view: "cm", fs: "1" });

  if (to) params.set("to", to);
  if (subject.trim()) params.set("su", subject.trim());
  if (body.trim()) params.set("body", body.trim());

  return `https://mail.google.com/mail/?${params.toString()}`;
};

export const resolveEmailActionUrl = (
  value?: string,
  subject = "",
  body = ""
) => {
  const link = String(value || "").trim();
  if (!link) return "";

  if (/^mailto:/i.test(link) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(link)) {
    return buildGmailComposeUrl(link, subject, body);
  }

  return link;
};
