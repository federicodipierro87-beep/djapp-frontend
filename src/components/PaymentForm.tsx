import React, { useState } from 'react';
import {
  useElements,
  useStripe,
  CardElement,
  ExpressCheckoutElement
} from '@stripe/react-stripe-js';
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import Button from './ui/Button';
import Label from './ui/Label';
import { formatMoney } from './ui/format';
import type { PaymentMethod } from '../types';

// `CardElement` è l'API legacy e non legge l'`appearance` degli Elements:
// i suoi colori vanno passati qui, altrimenti il testo digitato resta grigio
// scuro su fondo scuro e non si legge.
const CARD_ELEMENT_STYLE = {
  base: {
    fontSize: '16px',
    color: '#F5F4F0',
    iconColor: '#9C9A94',
    '::placeholder': {
      color: '#6A6862',
    },
  },
  invalid: {
    color: '#FF3B1F',
    iconColor: '#FF3B1F',
  },
};

// Which wallet each method maps to inside the Express Checkout Element, and what
// to call it when it turns out the browser cannot offer it.
const WALLETS = {
  APPLE_PAY: { key: 'applePay', name: 'Apple Pay' },
  GOOGLE_PAY: { key: 'googlePay', name: 'Google Pay' }
} as const;

interface PaymentFormProps {
  amount: number;
  paymentMethod: PaymentMethod;
  // Issued by the server for the request this payment belongs to. The form no
  // longer creates its own intent: an authorisation that is not tied to a
  // request is money nobody can collect.
  clientSecret: string;
  // Only needed to build the return address for a wallet that has to leave the
  // page for 3-D Secure.
  requestId: string;
  // Decided by the parent, because it is what the Elements group was built for.
  // False on a wallet method means the browser turned out not to support it.
  useWallet: boolean;
  onWalletUnavailable: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  paymentMethod,
  clientSecret,
  requestId,
  useWallet,
  onWalletUnavailable,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const wallet =
    paymentMethod === 'APPLE_PAY' || paymentMethod === 'GOOGLE_PAY'
      ? WALLETS[paymentMethod]
      : null;

  const authorize = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe non è stato caricato');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Campo carta non trovato');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      });

      if (error) {
        setPaymentError(error.message || 'Pagamento non riuscito');
      } else if (paymentIntent?.status === 'requires_capture') {
        // Authorised. The server verifies this with Stripe before the DJ sees
        // anything, so there is nothing to pass along here.
        onSuccess();
      } else {
        setPaymentError('Il pagamento non è stato autorizzato');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Pagamento non riuscito');
    } finally {
      setIsProcessing(false);
    }
  };

  // The wallet sheet has already collected the payment method by the time this
  // runs; confirming is all that is left.
  const confirmWallet = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) {
      setPaymentError('Stripe non è stato caricato');
      event.paymentFailed();
      return;
    }

    setPaymentError(null);

    // This group was built with the client secret, so which intent to confirm is
    // implied. `if_required` keeps the guest on this page when the wallet needs
    // no redirect, and still sends them to the return page if 3-D Secure does -
    // that page confirms by request id, whatever the provider was.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/return?requestId=${requestId}`
      },
      redirect: 'if_required'
    });

    if (error) {
      setPaymentError(error.message || 'Pagamento non riuscito');
      event.paymentFailed();
      return;
    }

    if (paymentIntent?.status === 'requires_capture') {
      onSuccess();
      return;
    }

    setPaymentError('Il pagamento non è stato autorizzato');
    event.paymentFailed();
  };

  const renderPaymentInterface = () => {
    if (useWallet && wallet) {
      return (
        <>
          <ExpressCheckoutElement
            options={{
              // Only the wallet the guest asked for. Left to itself the element
              // would offer whatever else the browser has, which is not what was
              // picked on the previous screen.
              wallets: {
                applePay: wallet.key === 'applePay' ? 'always' : 'never',
                googlePay: wallet.key === 'googlePay' ? 'always' : 'never'
              },
              buttonType: { applePay: 'tip', googlePay: 'donate' },
              buttonTheme: { applePay: 'white', googlePay: 'white' },
              buttonHeight: 48
            }}
            // `availablePaymentMethods` is undefined when nothing can be shown.
            // Noticing that is the whole point: the button this replaced
            // promised a wallet without ever asking whether it existed.
            onReady={({ availablePaymentMethods }) => {
              if (availablePaymentMethods?.[wallet.key]) setWalletReady(true);
              else onWalletUnavailable();
            }}
            onLoadError={onWalletUnavailable}
            onConfirm={confirmWallet}
          />

          {!walletReady && (
            <p className="text-[13px] text-bone-dim">Caricamento di {wallet.name}…</p>
          )}
        </>
      );
    }

    // PayPal and Satispay never reach this form: both send the guest away to
    // their own page and bring them back to /payment/return.
    if (paymentMethod !== 'CARD' && !wallet) return null;

    return (
      <div className="space-y-4">
        {wallet && (
          <div className="border-l-2 border-warn pl-4 py-1">
            <Label as="div">Non disponibile qui</Label>
            <p className="mt-1.5 text-[13px] text-bone-dim text-pretty">
              {wallet.name} non è attivo su questo browser. Puoi autorizzare con la
              carta: importo e condizioni sono gli stessi.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="card-element" className="field-label">
            Dati della carta
          </label>
          <div
            className="bg-ink-800 border border-white/[0.10] rounded-md px-3 py-3.5"
            role="group"
            aria-label="Informazioni pagamento carta"
          >
            <CardElement options={{ style: CARD_ELEMENT_STYLE, hidePostalCode: false }} />
          </div>
        </div>

        <Button
          block
          onClick={authorize}
          disabled={isProcessing || !stripe}
          aria-describedby="payment-info"
        >
          {isProcessing ? 'Elaborazione…' : `Autorizza ${formatMoney(amount, true)}`}
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <Label as="div">Da autorizzare</Label>
        <p className="num mt-2 text-4xl font-semibold leading-none">
          {formatMoney(amount, true)}
        </p>
        <p className="mt-2 text-[13px] text-bone-dim">
          Addebitati solo se il DJ accetta la richiesta.
        </p>
      </div>

      {paymentError && (
        <div className="mb-5 border-l-2 border-live pl-4 py-1" role="alert">
          <Label as="div" tone="live">
            Pagamento non riuscito
          </Label>
          <p className="mt-1.5 text-sm text-bone">{paymentError}</p>
        </div>
      )}

      {renderPaymentInterface()}

      <div id="payment-info" className="mt-6 border-l-2 border-white/15 pl-4 py-1">
        <Label as="div">Cosa succede adesso</Label>
        <ul className="mt-2 space-y-1.5 text-[13px] text-bone-dim text-pretty">
          <li>È un'autorizzazione: nessun addebito finché il DJ non accetta.</li>
          <li>
            Se non risponde, l'autorizzazione decade entro 12 ore — subito, se la serata
            finisce prima.
          </li>
          <li>Riceverai una conferma appena il DJ decide.</li>
        </ul>
      </div>

      <div className="mt-6">
        <Button block variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Annulla
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
