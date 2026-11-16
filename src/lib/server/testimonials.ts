import { db } from "@/lib/server/db";

export type Testimonial = {
  id: string;
  rating: number;
  message: string;
  authorName: string;
  authorRole: string | null;
  reply: string | null;
  publishedAt: string;
};

export type TestimonialStats = { total: number; average: number };

/** Depoimentos aprovados no painel. Sem banco configurado, devolve lista vazia. */
export async function getTestimonials(
  limit = 60,
): Promise<{ items: Testimonial[]; stats: TestimonialStats }> {
  try {
    const sql = db();
    const rows = await sql`SELECT id::text, rating, message, author_name, author_role, admin_reply,
        COALESCE(published_at, created_at)::text AS published_at
      FROM user_feedback
      WHERE status = 'published' AND allow_public AND author_name IS NOT NULL
      ORDER BY rating DESC, COALESCE(published_at, created_at) DESC
      LIMIT ${limit}`;
    const [agg] = await sql`SELECT count(*)::int AS total, COALESCE(avg(rating), 0)::float AS average
      FROM user_feedback WHERE status = 'published' AND allow_public AND author_name IS NOT NULL`;
    return {
      items: rows.map((r) => ({
        id: String(r.id),
        rating: Number(r.rating),
        message: String(r.message),
        authorName: String(r.author_name),
        authorRole: r.author_role ? String(r.author_role) : null,
        reply: r.admin_reply ? String(r.admin_reply) : null,
        publishedAt: String(r.published_at),
      })),
      stats: { total: Number(agg?.total || 0), average: Number(agg?.average || 0) },
    };
  } catch {
    return { items: [], stats: { total: 0, average: 0 } };
  }
}
