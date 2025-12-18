import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Alien DJ Icon Component - bulbous head with big headphones
const AlienDJIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Headphones Band - thick and prominent */}
    <path
      d="M10 52C10 28 28 15 50 15C72 15 90 28 90 52"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    
    {/* Large Left Headphone Cup */}
    <circle cx="10" cy="55" r="12" fill="currentColor" opacity="0.95" />
    <circle cx="10" cy="55" r="8" fill="black" opacity="0.3" />
    <circle cx="10" cy="55" r="4" fill="currentColor" opacity="0.7" />
    
    {/* Large Right Headphone Cup */}
    <circle cx="90" cy="55" r="12" fill="currentColor" opacity="0.95" />
    <circle cx="90" cy="55" r="8" fill="black" opacity="0.3" />
    <circle cx="90" cy="55" r="4" fill="currentColor" opacity="0.7" />
    
    {/* Alien Head - Bulbous top, pointed bottom like 👽 */}
    <path
      d="M50 85C40 85 32 80 28 70C25 60 25 50 28 40C32 25 40 15 50 15C60 15 68 25 72 40C75 50 75 60 72 70C68 80 60 85 50 85Z"
      fill="currentColor"
      opacity="0.98"
    />
    
    {/* Massive Black Eyes - Classic 👽 style */}
    <ellipse cx="42" cy="50" rx="11" ry="16" fill="black" />
    <ellipse cx="58" cy="50" rx="11" ry="16" fill="black" />
    
    {/* Eye highlights */}
    <ellipse cx="44" cy="45" rx="4" ry="6" fill="white" opacity="0.9" />
    <ellipse cx="60" cy="45" rx="4" ry="6" fill="white" opacity="0.9" />
    <circle cx="45" cy="47" r="2" fill="white" />
    <circle cx="61" cy="47" r="2" fill="white" />
    
    {/* No nose - pure 👽 style */}
    
    {/* Sound waves from big headphones */}
    <path
      d="M20 50C22 47 24 50 22 53C20 50 20 50 20 50"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.7"
      strokeLinecap="round"
    />
    <path
      d="M16 55C18 52 20 55 18 58C16 55 16 55 16 55"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
      strokeLinecap="round"
    />
    <path
      d="M80 50C78 47 76 50 78 53C80 50 80 50 80 50"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.7"
      strokeLinecap="round"
    />
    <path
      d="M84 55C82 52 80 55 82 58C84 55 84 55 84 55"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
      strokeLinecap="round"
    />
  </svg>
);

const Home: React.FC = () => {
  const [eventCode, setEventCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      toast.error('Inserisci un codice evento');
      return;
    }
    navigate(`/event/${eventCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Green Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-400/30 animate-pulse-slow shadow-lg shadow-green-400/50"></div>
        <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-green-300/40 animate-bounce-gentle shadow-md shadow-green-300/50"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-green-500/35 animate-pulse shadow-sm shadow-green-500/50"></div>
        <div className="absolute bottom-60 right-1/4 w-24 h-24 rounded-full bg-green-400/25 animate-pulse-slow shadow-lg shadow-green-400/50"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        {/* Event Code Form - Moved to Top */}
        <div className="w-full max-w-md mx-auto mb-8 sm:mb-16">
          <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-green-400/30 shadow-2xl shadow-green-400/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-400 mb-4 sm:mb-6 text-center">Unisciti a un Evento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-green-200 text-sm font-medium mb-2 text-center">
                  Inserisci Codice Evento
                </label>
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-center text-lg sm:text-xl font-bold tracking-wider shadow-lg shadow-green-400/20"
                  maxLength={6}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-4 sm:py-4 sm:px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50"
              >
                Entra nell'Evento
              </button>
            </form>
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="relative">
              <AlienDJIcon 
                className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 text-green-400 animate-bounce-gentle drop-shadow-lg" 
                style={{filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'}} 
              />
              <Sparkles className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 text-green-300 absolute -top-2 -right-2 sm:-top-3 sm:-right-3 animate-pulse" style={{filter: 'drop-shadow(0 0 10px rgba(134, 239, 172, 0.8))'}} />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 text-balance px-2">
            Richiedi le Tue
            <span className="text-green-400 block" style={{textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}>Canzoni Preferite</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-green-100 mb-8 sm:mb-12 max-w-2xl mx-auto text-balance px-4">
            Connettiti con il tuo DJ e richiedi canzoni durante eventi live. 
            Sostienilo con donazioni e guarda le tue richieste prendere vita!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 px-4">
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-4 sm:p-6 md:p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300">
              <Search className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 text-green-400 mx-auto mb-4 sm:mb-5 md:mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-2 sm:mb-3 text-base sm:text-lg">Richieste Facili</h3>
              <p className="text-green-100 text-xs sm:text-sm">Cerca e richiedi qualsiasi canzone con pochi click</p>
            </div>
            
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-4 sm:p-6 md:p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300">
              <Heart className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 text-red-400 mx-auto mb-4 sm:mb-5 md:mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(248, 113, 113, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-2 sm:mb-3 text-base sm:text-lg">Sostieni i DJ</h3>
              <p className="text-green-100 text-xs sm:text-sm">Mostra apprezzamento con donazioni sicure</p>
            </div>
            
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-4 sm:p-6 md:p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <Music className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 text-green-400 mx-auto mb-4 sm:mb-5 md:mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-2 sm:mb-3 text-base sm:text-lg">Coda Live</h3>
              <p className="text-green-100 text-xs sm:text-sm">Guarda la coda e vedi quando suona la tua canzone</p>
            </div>
          </div>

          {/* DJ Login Link */}
          <div className="mt-8 sm:mt-12 pb-8">
            <button
              onClick={() => navigate('/dj/login')}
              className="text-green-300 hover:text-green-400 transition-colors duration-300 underline decoration-dotted underline-offset-4 font-medium text-sm sm:text-base"
              style={{textShadow: '0 0 10px rgba(134, 239, 172, 0.3)'}}
            >
              Sei un DJ? Accedi qui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;