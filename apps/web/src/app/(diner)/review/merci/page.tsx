/**
 * /review/merci — Review thank-you screen (Figma node 59:555).
 *
 * Pure client page: reads the bonus payload stashed by ReviewForm from
 * sessionStorage and renders the "Merci pour ton avis !" hero + CTAs.
 */

import { ThankYouClient } from "../../_components/ReviewThankYouClient";

export default function ReviewThankYouPage() {
  return <ThankYouClient />;
}
