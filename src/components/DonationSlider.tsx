import React from 'react';
import { Heart, Euro } from 'lucide-react';

interface DonationSliderProps {
  amount: number;
  onChange: (amount: number) => void;
  min: number;
  max: number;
}

const DonationSlider: React.FC<DonationSliderProps> = ({ 
  amount, 
  onChange, 
  min, 
  max 
}) => {
  const percentage = ((amount - min) / (max - min)) * 100;

  const quickAmounts = [min, 10, 20, 50];

  return (
    <div>
      <label className="form-label flex items-center">
        <Heart className="w-4 h-4 mr-2 text-red-500" />
        Donation Amount
      </label>
      
      {/* Current Amount Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl px-6 py-4">
          <div className="flex items-center justify-center">
            <Euro className="w-6 h-6 text-primary-600 mr-1" />
            <span className="text-3xl font-bold text-primary-800">{amount}</span>
          </div>
          <p className="text-center text-primary-600 text-sm mt-1">
            {amount === min ? 'Minimum amount' : 'Thank you for your support!'}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <input
          type="range"
          min={min}
          max={max}
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>€{min}</span>
          <span>€{max}</span>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => onChange(quickAmount)}
            className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
              amount === quickAmount
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            €{quickAmount}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="mt-4">
        <label className="block text-sm text-gray-600 mb-2">Or enter custom amount:</label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            min={min}
            max={max}
            value={amount}
            onChange={(e) => {
              const value = Math.max(min, Math.min(max, Number(e.target.value) || min));
              onChange(value);
            }}
            className="form-input pl-10"
            placeholder={min.toString()}
          />
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          box-shadow: 0 0 2px 0 #555;
          transition: background .15s ease-in-out;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #9333ea;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 2px 0 #555;
        }
      `}</style>
    </div>
  );
};

export default DonationSlider;