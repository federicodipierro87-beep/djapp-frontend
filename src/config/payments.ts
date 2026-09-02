/**
 * The smallest tip a DJ is allowed to ask for, mirroring MIN_DONATION in the
 * backend's src/config/payments.ts. Stripe refuses a euro charge under 50 cents
 * and refuses it when the PaymentIntent is created, so anything lower is not a
 * cheaper request - it is one that cannot be filed at all.
 *
 * Only the DJ-facing forms need this. What the guests' slider starts from comes
 * from the server, already floored, so the two can never disagree.
 */
export const MIN_DONATION = 0.5;
