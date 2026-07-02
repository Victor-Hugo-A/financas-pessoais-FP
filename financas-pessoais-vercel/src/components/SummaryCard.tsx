export function SummaryCard({
  title,
  value,
  caption,
  tone
}: {
  title: string;
  value: string;
  caption?: string;
  tone?: "positive" | "negative" | "warning";
}) {
  return (
    <article className="card">
      <p className="card-title">{title}</p>
      <p className={`card-value ${tone ?? ""}`}>{value}</p>
      {caption ? <p className="card-caption">{caption}</p> : null}
    </article>
  );
}
