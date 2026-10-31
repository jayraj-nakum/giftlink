import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <LegalPage title="Contact us" updated="31 October 2026">
      <p>Questions about a gift, a payment, or a link that didn&apos;t arrive? We usually reply within a few hours.</p>
      <ul className="grid gap-2">
        <li>
          📧 Email: <a className="underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
        </li>
        <li>
          💬 WhatsApp:{" "}
          <a className="underline" href={`https://wa.me/${site.supportWhatsApp}`} target="_blank" rel="noopener noreferrer">
            +{site.supportWhatsApp}
          </a>
        </li>
        {site.instagram && <li>📸 Instagram: @{site.instagram}</li>}
      </ul>
      <p className="text-sm text-ink-soft">[Add your registered business name and address here. Razorpay needs it.]</p>
    </LegalPage>
  );
}
