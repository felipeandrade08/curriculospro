import type { Testimonial } from "@/lib/server/testimonials";

export function Stars({ value, label }: { value: number; label?: string }) {
  const full = Math.round(value);
  return (
    <span
      className="tm-stars"
      role="img"
      aria-label={label || value.toLocaleString("pt-BR") + " de 5 estrelas"}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= full ? "on" : ""}>
          ★
        </i>
      ))}
    </span>
  );
}

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="tm-card">
      <Stars value={item.rating} />
      <blockquote>{item.message}</blockquote>
      <figcaption>
        <b>{item.authorName}</b>
        {item.authorRole && <span>{item.authorRole}</span>}
        <time dateTime={item.publishedAt}>{monthYear(item.publishedAt)}</time>
      </figcaption>
      {item.reply && (
        <div className="tm-reply">
          <b>Resposta do CurriculosPRO</b>
          <p>{item.reply}</p>
        </div>
      )}
    </figure>
  );
}
