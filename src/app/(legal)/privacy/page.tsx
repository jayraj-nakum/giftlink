import { LegalPage } from "@/components/site/LegalPage";
import { pricing, site } from "@/config/site";

export const metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="31 October 2026">
      <p>
        {site.name} makes personal gift pages. To do that we store what you put in a gift: names, photos, messages and the
        date you choose. This page explains what we keep, why, and for how long.
      </p>
      <h2>What we collect</h2>
      <p>
        The content of your gift; basic payment records from our payment partner, Razorpay (we never see your card or UPI
        PIN); and simple counts of when a gift is opened, so you can see it was received.
      </p>
      <h2>Photos</h2>
      <p>
        Photos are resized when uploaded, and hidden data inside them (such as the GPS location your phone adds) is removed.
        They are reachable only through your private gift link.
      </p>
      <h2>How long we keep it</h2>
      <p>
        A gift and its photos are deleted automatically {pricing.lifetimeDays} days after payment. Unpaid drafts are
        deleted within 2 days. Payment records are kept as long as the law requires.
      </p>
      <h2>Who can see a gift</h2>
      <p>
        Anyone who has the link. Links are long random codes, are not listed anywhere, and search engines are asked not to
        index them. Share it only with the people you mean to.
      </p>
      <h2>Contact</h2>
      <p>
        Want a gift deleted early, or have a question? Email <a className="underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
