import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

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

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8">
        {/* Event Code Form - Moved to Top */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 shadow-2xl shadow-green-400/20">
            <h2 className="text-3xl font-bold text-green-400 mb-6 text-center">Unisciti a un Evento</h2>
            
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
                  className="w-full px-4 py-4 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-center text-xl font-bold tracking-wider shadow-lg shadow-green-400/20"
                  maxLength={6}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-4 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50"
              >
                Entra nell'Evento
              </button>
            </form>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Music className="w-24 h-24 text-green-400 animate-bounce-gentle drop-shadow-lg" style={{filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'}} />
              <Sparkles className="w-10 h-10 text-green-300 absolute -top-3 -right-3 animate-pulse" style={{filter: 'drop-shadow(0 0 10px rgba(134, 239, 172, 0.8))'}} />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 text-balance">
            Richiedi le Tue
            <span className="text-green-400 block" style={{textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}>Canzoni Preferite</span>
          </h1>
          
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto text-balance">
            Connettiti con il tuo DJ e richiedi canzoni durante eventi live. 
            Sostienilo con donazioni e guarda le tue richieste prendere vita!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300">
              <Search className="w-10 h-10 text-green-400 mx-auto mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-3 text-lg">Richieste Facili</h3>
              <p className="text-green-100 text-sm">Cerca e richiedi qualsiasi canzone con pochi click</p>
            </div>
            
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300">
              <Heart className="w-10 h-10 text-red-400 mx-auto mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(248, 113, 113, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-3 text-lg">Sostieni i DJ</h3>
              <p className="text-green-100 text-sm">Mostra apprezzamento con donazioni sicure</p>
            </div>
            
            <div className="bg-green-900/20 backdrop-blur-lg rounded-lg p-8 border border-green-400/30 shadow-lg shadow-green-400/10 hover:shadow-green-400/20 transition-all duration-300">
              <Music className="w-10 h-10 text-green-400 mx-auto mb-6" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
              <h3 className="font-bold text-green-400 mb-3 text-lg">Coda Live</h3>
              <p className="text-green-100 text-sm">Guarda la coda e vedi quando suona la tua canzone</p>
            </div>
          </div>

          {/* DJ Login Link */}
          <div className="mt-12">
            <button
              onClick={() => navigate('/dj/login')}
              className="text-green-300 hover:text-green-400 transition-colors duration-300 underline decoration-dotted underline-offset-4 font-medium"
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