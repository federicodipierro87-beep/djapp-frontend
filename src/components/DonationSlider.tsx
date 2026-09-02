import React from 'react';
import Label from './ui/Label';
import { formatMoney } from './ui/format';

interface DonationSliderProps {
  amount: number;
  onChange: (amount: number) => void;
  min: number;
  max: number;
}

const DonationSlider: React.FC<DonationSliderProps> = ({ amount, onChange, min, max }) => {
  const percentage = ((amount - min) / (max - min)) * 100;

  // Il minimo è deciso dal DJ: le scorciatoie sotto di esso non hanno senso.
  const quickAmounts = Array.from(new Set([min, 10, 20, 50])).filter(
    (value) => value >= min && value <= max
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label as="div">Mancia</Label>
        <span className="num text-[11px] text-bone-faint">
          {min === 0 ? 'facoltativa' : `min ${formatMoney(min, true)}`}
        </span>
      </div>

      {/* L'importo è il numero più grande della schermata: è la decisione. */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="num text-4xl font-semibold leading-none">{formatMoney(amount, true)}</span>
        {/* A zero non c'è nessun minimo da annunciare: c'è che non si paga. */}
        {amount === 0 ? (
          <span className="label-mono">gratis</span>
        ) : (
          amount === min && <span className="label-mono">importo minimo</span>
        )}
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={min}
          max={max}
          value={amount}
          aria-label="Importo della mancia"
          onChange={(e) => onChange(Number(e.target.value))}
          className="donation-slider w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F5F4F0 0%, #F5F4F0 ${percentage}%, #2C2C33 ${percentage}%, #2C2C33 100%)`,
          }}
        />
        <div className="flex justify-between num text-[11px] text-bone-faint mt-2">
          <span>{formatMoney(min, true)}</span>
          <span>{formatMoney(max, true)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => onChange(quickAmount)}
            className={`num py-2 px-2 text-sm rounded-md border transition-colors min-h-[40px] ${
              amount === quickAmount
                ? 'bg-bone text-ink-950 border-bone font-semibold'
                : 'bg-transparent text-bone-dim border-white/15 hover:border-white/30 hover:text-bone'
            }`}
          >
            {formatMoney(quickAmount, true)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="custom-amount" className="field-label">
          Oppure un altro importo
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 num text-sm text-bone-faint">
            €
          </span>
          <input
            id="custom-amount"
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            value={amount}
            onChange={(e) => {
              const value = Math.max(min, Math.min(max, Number(e.target.value) || min));
              onChange(value);
            }}
            className="field pl-8 font-mono tabular-nums"
            placeholder={min.toString()}
          />
        </div>
      </div>

      <style>{`
        .donation-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #F5F4F0;
          border: 3px solid #08080A;
          cursor: pointer;
        }

        .donation-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #F5F4F0;
          border: 3px solid #08080A;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default DonationSlider;
