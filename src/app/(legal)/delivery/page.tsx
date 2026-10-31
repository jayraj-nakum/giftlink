import { LegalPage } from "@/components/site/LegalPage";
import { pricing } from "@/config/site";

export const metadata = { title: "Delivery policy" };

export default function Delivery() {
  return (
    <LegalPage title="Shipping & delivery policy" updated="31 October 2026">
      <p>
        Everything we sell is digital. Nothing is shipped. Your gift is delivered as a link on screen immediately after
        payment, usually within a few seconds.
      </p>
      <p>
        You share that link yourself, on WhatsApp or anywhere you like. It stays live for {pricing.lifetimeDays} days from
        payment.
      </p>
    </LegalPage>
  );
}
