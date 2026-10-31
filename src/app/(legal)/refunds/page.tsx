import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata = { title: "Refund policy" };

export default function Refunds() {
  return (
    <LegalPage title="Cancellation & refund policy" updated="31 October 2026">
      <p>
        Every gift has a free, full preview before payment, and the link is created the moment you pay. Because of that,
        completed purchases are generally not refundable.
      </p>
      <h2>When we do refund</h2>
      <ul className="list-disc pl-5">
        <li>You were charged twice for the same gift: we refund the extra payment.</li>
        <li>Money left your account but no link was created, and we can&apos;t deliver it.</li>
        <li>The gift doesn&apos;t work because of a fault on our side that we can&apos;t fix.</li>
      </ul>
      <h2>How</h2>
      <p>
        Email <a className="underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> within 7 days with your
        payment reference. Approved refunds go back to the original payment method within 5–7 working days.
      </p>
    </LegalPage>
  );
}
