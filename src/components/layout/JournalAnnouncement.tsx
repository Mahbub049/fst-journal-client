type JournalAnnouncementProps = {
  homepage?: unknown;
  items?: string[];
  announcements?: string[];
  className?: string;
};

const defaultAnnouncements = [
  "SUBMIT YOUR MANUSCRIPT TODAY",
  "WELCOME TO THE JOURNAL OF FST",
  "CALL FOR PAPERS",
  "EXPLORE CURRENT AND ARCHIVED ISSUES OF THE JOURNAL",
  "SUBMIT YOUR RESEARCH MANUSCRIPT THROUGH THE ONLINE SUBMISSION SYSTEM",
];

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const possibleText =
          record.text ?? record.title ?? record.label ?? record.message ?? record.name;
        return typeof possibleText === "string" ? possibleText : "";
      }
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
}

function getHomepageAnnouncements(homepage: unknown): string[] {
  if (!homepage || typeof homepage !== "object") return [];

  const record = homepage as Record<string, unknown>;

  const candidates = [
    record.announcements,
    record.announcementItems,
    record.marqueeItems,
    record.marqueeTexts,
    record.tickerItems,
    record.tickerTexts,
    record.newsTicker,
  ];

  for (const candidate of candidates) {
    const values = asStringArray(candidate);
    if (values.length > 0) return values;
  }

  const announcementBar = record.announcementBar;
  if (announcementBar && typeof announcementBar === "object") {
    const bar = announcementBar as Record<string, unknown>;
    const values = asStringArray(bar.items ?? bar.messages ?? bar.texts);
    if (values.length > 0) return values;
  }

  return [];
}

export default function JournalAnnouncement({
  homepage,
  items,
  announcements,
  className = "",
}: JournalAnnouncementProps) {
  const resolvedItems = [
    ...asStringArray(items),
    ...asStringArray(announcements),
    ...getHomepageAnnouncements(homepage),
  ];

  const messages = resolvedItems.length > 0 ? resolvedItems : defaultAnnouncements;

  // Repeat inside each group so one group is always wider than the screen.
  // Then render two identical groups; the CSS moves exactly one group width.
  const loopItems = [...messages, ...messages, ...messages];

  const renderGroup = (hidden = false) => (
    <div className="journal-announcement-group" aria-hidden={hidden || undefined}>
      {loopItems.map((message, index) => (
        <span className="journal-announcement-item" key={`${message}-${index}`}>
          <span className="journal-announcement-dot" />
          <span>{message}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className={`journal-announcement-shell ${className}`} aria-label="Journal announcements">
      <div className="journal-announcement-fade journal-announcement-fade-left" />
      <div className="journal-announcement-fade journal-announcement-fade-right" />

      <div className="journal-announcement-track">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </section>
  );
}
