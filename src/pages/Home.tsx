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
      toast.error('Please enter an event code');
      return;
    }
    navigate(`/event/${eventCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white animate-pulse-slow"></div>
          <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-white animate-bounce-gentle"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-white animate-pulse"></div>
          <div className="absolute bottom-60 right-1/4 w-24 h-24 rounded-full bg-white animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Music className="w-20 h-20 text-white animate-bounce-gentle" />
                <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-6 text-balance">
              Request Your
              <span className="text-yellow-300 block">Favorite Songs</span>
            </h1>
            
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto text-balance">
              Connect with your DJ and request songs during live events. 
              Support them with donations and see your requests come to life!
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <Search className="w-8 h-8 text-yellow-300 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Easy Requests</h3>
                <p className="text-purple-100 text-sm">Search and request any song with just a few clicks</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Support DJs</h3>
                <p className="text-purple-100 text-sm">Show appreciation with secure donations</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <Music className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Live Queue</h3>
                <p className="text-purple-100 text-sm">Watch the queue and see when your song plays</p>
              </div>
            </div>

            {/* Event Code Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Join an Event</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">
                    Enter Event Code
                  </label>
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent text-center text-lg font-bold tracking-wider"
                    maxLength={6}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Join Event
                </button>
              </form>
            </div>

            {/* DJ Login Link */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/dj/login')}
                className="text-purple-200 hover:text-white transition-colors duration-200 underline decoration-dotted underline-offset-4"
              >
                Are you a DJ? Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;