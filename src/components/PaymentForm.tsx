import React, { useState } from 'react';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { Smartphone } from 'lucide-react';
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

interface PaymentFormProps {
  amount: number;
  paymentMethod: PaymentMethod;
  // Issued by the server for the request this payment belongs to. The form no
  // longer creates its own intent: an authorisation that is not tied to a
  // request is money nobody can collect.
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  paymentMethod,
  clientSecret,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const authorize = async (billingName?: string) => {
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
        payment_method: {
          card: cardElement,
          ...(billingName ? { billing_details: { name: billingName } } : {})
        }
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

  const renderPaymentInterface = () => {
    switch (paymentMethod) {
      case 'CARD':
        return (
          <div className="space-y-4">
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
              onClick={() => authorize()}
              disabled={isProcessing || !stripe}
              aria-describedby="payment-info"
            >
              {isProcessing ? 'Elaborazione…' : `Autorizza ${formatMoney(amount, true)}`}
            </Button>
          </div>
        );

      case 'APPLE_PAY':
      case 'GOOGLE_PAY':
        return (
          <Button block onClick={() => authorize('Customer')} disabled={isProcessing || !stripe}>
            <Smartphone className="h-4 w-4" />
            {isProcessing
              ? 'Elaborazione…'
              : `Paga con ${paymentMethod === 'APPLE_PAY' ? 'Apple Pay' : 'Google Pay'}`}
          </Button>
        );

      // PayPal and Satispay never reach this form: both send the guest away to
      // their own page and bring them back to /payment/return.
      default:
        return null;
    }
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
