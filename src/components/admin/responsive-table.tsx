// Utility untuk membuat tabel responsive dengan scroll horizontal
export function ResponsiveTableWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}
