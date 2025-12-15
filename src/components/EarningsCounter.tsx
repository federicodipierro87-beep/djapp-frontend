import React from 'react';
import { Euro, TrendingUp, Calendar, Clock } from 'lucide-react';

interface EarningsCounterProps {
  totalEarnings: number;
  className?: string;
}

const EarningsCounter: React.FC<EarningsCounterProps> = ({ 
  totalEarnings,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2">
            <Euro className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">
              Total Earnings
            </h3>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-green-800">
              €{totalEarnings.toFixed(2)}
            </span>
            <span className="ml-2 text-sm text-green-600">
              this event
            </span>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>From accepted song requests</span>
          </div>
        </div>

        <div className="text-right">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {totalEarnings > 0 && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-green-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Event started</span>
            </div>
            <div className="flex items-center text-green-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsCounter;