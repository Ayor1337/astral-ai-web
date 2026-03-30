import { useAuth } from "@/hooks/useAuth";

export default function SettingsAccount() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-10">
      {/* 账号信息 */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          账号信息
        </h2>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              用户名
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              {user?.username ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              昵称
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              {user?.nickname ?? "—"}
            </span>
          </div>
        </div>
      </section>

      {/* 退出登录 */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          账号
        </h2>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm" style={{ color: "var(--text-base)" }}>
              退出登录
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-opacity duration-100 hover:opacity-80"
              style={{
                background: "var(--text-primary)",
                color: "var(--base-bg)",
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
