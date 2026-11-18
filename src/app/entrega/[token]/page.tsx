import type { Metadata } from "next";
import { DeliveryView, deliveryMetadata } from "../delivery-view";

export const dynamic = "force-dynamic";

/** Links de entrega no formato antigo (longo): continuam valendo. */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  return deliveryMetadata((await params).token);
}

export default async function DeliveryPage({ params }: { params: Promise<{ token: string }> }) {
  return <DeliveryView token={(await params).token} />;
}
