import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Play, Pause, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { spotifyApi } from '../services/api';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover: string | null;
  albumCoverSmall: string | null;
  durationFormatted: string;
  previewUrl: string | null;
  spotifyUrl: string;
}

interface SpotifySearchProps {
  onSelect: (track: { songTitle: string; artistName: string; spotifyTrackId?: string; albumCover?: string }) => void;
  onClose: () => void;
}

const SpotifySearch: React.FC<SpotifySearchProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['spotify-search', debouncedQuery],
    queryFn: () => spotifyApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
  });

  const handlePlayPreview = (track: SpotifyTrack) => {
    if (!track.previewUrl) return;

    if (playingTrackId === track.id) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.previewUrl);
      audioRef.current.volume = 0.5;
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
    }
  };

  const handleSelect = (track: SpotifyTrack) => {
    // Stop any playing audio
    audioRef.current?.pause();
    setPlayingTrackId(null);

    onSelect({
      songTitle: track.name,
      artistName: track.artist,
      spotifyTrackId: track.id,
      albumCover: track.albumCover || undefined,
    });
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-green-900/40 backdrop-blur-lg rounded-2xl border border-green-400/30 shadow-2xl shadow-green-400/20 w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-green-400/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-400 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Cerca su Spotify
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-400/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-green-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca canzone o artista..."
              className="w-full pl-10 pr-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-xl text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-400">Errore nella ricerca. Riprova.</p>
            </div>
          )}

          {!isLoading && !error && debouncedQuery.length < 2 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
              <p className="text-green-200/60">Digita almeno 2 caratteri per cercare</p>
            </div>
          )}

          {!isLoading && !error && data?.tracks && data.tracks.length === 0 && debouncedQuery.length >= 2 && (
            <div className="text-center py-8">
              <p className="text-green-200/60">Nessun risultato per "{debouncedQuery}"</p>
            </div>
          )}

          {data?.tracks && data.tracks.length > 0 && (
            <div className="space-y-2">
              {data.tracks.map((track: SpotifyTrack) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 bg-black/40 border border-green-400/30 rounded-xl hover:border-green-400/60 hover:bg-green-400/5 transition-all cursor-pointer group"
                  onClick={() => handleSelect(track)}
                >
                  {/* Album Cover */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {track.albumCoverSmall ? (
                      <img
                        src={track.albumCoverSmall}
                        alt={track.album}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-green-900/50 flex items-center justify-center">
                        <Music className="w-6 h-6 text-green-400/50" />
                      </div>
                    )}

                    {/* Preview Play Button */}
                    {track.previewUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(track);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {playingTrackId === track.id ? (
                          <Pause className="w-5 h-5 text-green-400" />
                        ) : (
                          <Play className="w-5 h-5 text-green-400" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-400 truncate">{track.name}</h3>
                    <p className="text-sm text-green-200/70 truncate">{track.artist}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-green-200/50 flex-shrink-0">
                    {track.durationFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-green-400/30">
          <p className="text-xs text-green-200/50 text-center">
            Powered by Spotify
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotifySearch;
