export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted">Last updated: {updated}</p>
      </header>
      <div className="space-y-5 text-[15px] leading-relaxed [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-text [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
