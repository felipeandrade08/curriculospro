import type { Metadata } from "next";
import { DeliveryView, deliveryMetadata } from "../../entrega/delivery-view";

export const dynamic = "force-dynamic";

/** Link curto de entrega, feito para mandar no WhatsApp. */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  return deliveryMetadata((await params).token);
}

export default async function ShortDeliveryPage({ params }: { params: Promise<{ token: string }> }) {
  return <DeliveryView token={(await params).token} />;
}
