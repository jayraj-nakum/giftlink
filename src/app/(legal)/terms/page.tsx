import { LegalPage } from "@/components/site/LegalPage";
import { pricing, site } from "@/config/site";

export const metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage title="Terms of service" updated="31 October 2026">
      <p>
        {site.name} sells digital gifts: personal web pages delivered as a link. By making or paying for a gift you agree
        to these terms.
      </p>
      <h2>The product</h2>
      <p>
        Each gift costs {pricing.displayPrice} (inclusive of applicable taxes), paid once. After payment you get a link that
        stays live for {pricing.lifetimeDays} days. Nothing physical is shipped.
      </p>
      <h2>Your content</h2>
      <p>
        You must have the right to use the photos and words you upload. Don&apos;t upload anything illegal, hateful, or
        sexual, or anything that targets or harasses someone. We may remove a gift that breaks these rules, without a refund.
      </p>
      <h2>Availability</h2>
      <p>
        We work hard to keep links working, but the service is provided as is. If a gift you paid for doesn&apos;t work
        because of a problem on our side, we&apos;ll fix it or refund you.
      </p>
      <h2>Contact</h2>
      <p>
        <a className="underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
    </LegalPage>
  );
}
