export function Spinner({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border-solid animate-spin ${subtle ? "border-[1.5px] border-[color-mix(in_srgb,var(--text-muted)_25%,transparent)] border-t-(--text-muted)" : "border-[1.5px] border-(--text-subtle) border-t-(--accent)"}`}
      style={{ width: subtle ? 14 : 12, height: subtle ? 14 : 12 }}
    />
  );
}
