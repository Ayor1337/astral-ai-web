const IconCopy = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconMoreVertical = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const ORG_ID = "901d6647-c657-46ee-aeb0-1e5e79269313";

const SESSIONS = [
  {
    id: "1",
    device: "Chrome (Windows)",
    isCurrent: true,
    location: "Los Angeles, California, US",
    created: "Mar 27, 2026, 1:53 PM",
    updated: "Mar 28, 2026, 3:04 PM",
  },
  {
    id: "2",
    device: "Chrome (Windows)",
    isCurrent: false,
    location: "Los Angeles, California, US",
    created: "Mar 27, 2026, 1:53 PM",
    updated: "Mar 27, 2026, 1:53 PM",
  },
  {
    id: "3",
    device: "Chrome (Windows)",
    isCurrent: false,
    location: "Los Angeles, California, US",
    created: "Mar 27, 2026, 1:53 PM",
    updated: "Mar 27, 2026, 1:53 PM",
  },
] as const;

const TABLE_HEADERS = ["Device", "Location", "Created", "Updated"] as const;

export default function SettingsAccount() {
  const copyOrgId = () => {
    navigator.clipboard.writeText(ORG_ID).catch(() => {
      /* silent fail for static demo */
    });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Account */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Account
        </h2>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Log out of all devices */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-base)" }}>
              Log out of all devices
            </span>
            <button
              type="button"
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-opacity duration-100 hover:opacity-80"
              style={{
                background: "var(--text-primary)",
                color: "var(--base-bg)",
              }}
            >
              Log out
            </button>
          </div>

          {/* Delete your account */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-base)" }}>
              Delete your account
            </span>
            <button
              type="button"
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-100 hover:bg-(--sidebar-hover)"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-base)",
              }}
            >
              Delete account
            </button>
          </div>

          {/* Organization ID */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm" style={{ color: "var(--text-base)" }}>
              Organization ID
            </span>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {ORG_ID}
              </span>
              <button
                type="button"
                onClick={copyOrgId}
                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-100 hover:bg-(--sidebar-hover)"
                style={{ color: "var(--text-muted)" }}
                title="Copy organization ID"
              >
                <IconCopy />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active sessions */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Active sessions
        </h2>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Table header */}
          <div
            className="grid items-center gap-4 px-5 py-3"
            style={{
              gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 2rem",
              borderBottom: "1px solid var(--divider)",
            }}
          >
            {TABLE_HEADERS.map((h) => (
              <span
                key={h}
                className="text-xs font-medium"
                style={{ color: "var(--sidebar-section-text)" }}
              >
                {h}
              </span>
            ))}
            <span />
          </div>

          {/* Session rows */}
          {SESSIONS.map((session, idx) => (
            <div
              key={session.id}
              className="grid items-center gap-4 px-5 py-4"
              style={{
                gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 2rem",
                borderBottom:
                  idx < SESSIONS.length - 1
                    ? "1px solid var(--divider)"
                    : undefined,
              }}
            >
              {/* Device */}
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--text-base)" }}>
                  {session.device}
                </span>
                {session.isCurrent && (
                  <span
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      background: "var(--surface-active)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              {/* Location */}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {session.location}
              </span>

              {/* Created */}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {session.created}
              </span>

              {/* Updated */}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {session.updated}
              </span>

              {/* Actions */}
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-100 hover:bg-(--sidebar-hover)"
                style={{ color: "var(--text-muted)" }}
                title="More options"
              >
                <IconMoreVertical />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
