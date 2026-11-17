// O que acontece depois que o Mercado Pago confirma (ou estorna) um pagamento.
// Nada aqui pode impedir a liberação do acesso: falhas só são registradas.
import { db } from "@/lib/server/db";
import { REFERRED_BONUS_DAYS, REFERRER_BONUS_DAYS } from "@/lib/billing";
import { purchaseEmail, referralRewardEmail, sendEmail, emailConfigured } from "@/lib/server/email";
import { revokeReferralReward, rewardReferral } from "@/lib/server/referrals";
import { sendMetaPurchase } from "@/lib/server/meta-capi";

export async function afterPaymentGranted(paymentId: string) {
  let reward: Awaited<ReturnType<typeof rewardReferral>> = null;
  try {
    reward = await rewardReferral(paymentId);
  } catch (error) {
    console.error("Recompensa de indicação falhou", paymentId, error);
  }
  try {
    await sendMetaPurchase(paymentId);
  } catch (error) {
    console.error("Conversão da Meta falhou", paymentId, error);
  }
  if (!emailConfigured()) return;
  try {
    const sql = db();
    // Marca antes de enviar: o recibo sai uma única vez mesmo com webhook e consulta ao mesmo tempo.
    const [row] = await sql`UPDATE payments p SET receipt_sent_at = now()
      FROM app_users u WHERE p.id = ${paymentId} AND u.id = p.user_id AND p.receipt_sent_at IS NULL
      RETURNING u.email, u.display_name, u.access_until, p.amount_cents, p.plan`;
    if (row?.email && row.access_until) {
      const mail = purchaseEmail({
        name: row.display_name ? String(row.display_name) : null,
        amountCents: Number(row.amount_cents),
        accessUntil: new Date(String(row.access_until)).toISOString(),
        paymentId,
        bonusDays: reward ? REFERRED_BONUS_DAYS : 0,
        plan: row.plan ? String(row.plan) : undefined,
      });
      await sendEmail({ to: String(row.email), ...mail, idempotencyKey: "receipt-" + paymentId });
    }
  } catch (error) {
    console.error("Recibo por e-mail falhou", paymentId, error);
  }
  if (reward?.referrerEmail) {
    try {
      const mail = referralRewardEmail({
        name: reward.referrerName,
        days: REFERRER_BONUS_DAYS,
        accessUntil: reward.referrerAccessUntil,
      });
      await sendEmail({ to: reward.referrerEmail, ...mail, idempotencyKey: "referral-" + paymentId });
    } catch (error) {
      console.error("Aviso de indicação falhou", paymentId, error);
    }
  }
}

export async function afterPaymentRevoked(paymentId: string) {
  try {
    await revokeReferralReward(paymentId);
  } catch (error) {
    console.error("Estorno da indicação falhou", paymentId, error);
  }
}
