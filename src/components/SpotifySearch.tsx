import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { spotifyApi } from '../services/api';
import Modal from './ui/Modal';
import AlbumArt from './ui/AlbumArt';
import EmptyState from './ui/EmptyState';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover: string | null;
  albumCoverSmall: string | null;
  durationFormatted: string;
  spotifyUrl: string;
}

interface SpotifySearchProps {
  onSelect: (track: { songTitle: string; artistName: string; spotifyTrackId?: string; albumCover?: string }) => void;
  onClose: () => void;
}

const SpotifySearch: React.FC<SpotifySearchProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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

  const handleSelect = (track: SpotifyTrack) => {
    onSelect({
      songTitle: track.name,
      artistName: track.artist,
      spotifyTrackId: track.id,
      albumCover: track.albumCover || undefined,
    });
  };

  return (
    <Modal
      title="Cerca il pezzo"
      eyebrow="Catalogo Spotify"
      size="md"
      onClose={onClose}
      footer={<p className="label-mono text-center">Powered by Spotify</p>}
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-faint pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titolo o artista"
          className="field pl-9"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className="h-12 w-12 rounded-sm bg-ink-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded-sm bg-ink-800 animate-pulse" />
                <div className="h-3 w-1/3 rounded-sm bg-ink-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <EmptyState
          eyebrow="Errore"
          title="La ricerca non ha risposto"
          description="Riprova tra un momento, oppure inserisci titolo e artista a mano."
        />
      )}

      {!isLoading && !error && debouncedQuery.length < 2 && (
        <EmptyState title="Scrivi almeno due caratteri" description="Cerca per titolo o artista." />
      )}

      {!isLoading && !error && data?.tracks?.length === 0 && debouncedQuery.length >= 2 && (
        <EmptyState
          title={`Nessun risultato per "${debouncedQuery}"`}
          description="Prova con il nome dell'artista, o scrivilo a mano nel modulo."
        />
      )}

      {data?.tracks && data.tracks.length > 0 && (
        <ul className="border-t border-white/[0.08]">
          {data.tracks.map((track: SpotifyTrack) => (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 py-2.5 text-left border-b border-white/[0.08]
                           hover:bg-white/[0.04] transition-colors px-2 -mx-2"
              >
                <AlbumArt
                  src={track.albumCoverSmall ?? undefined}
                  alt={track.album}
                  className="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-bone truncate">{track.name}</p>
                  <p className="text-[13px] text-bone-dim truncate">{track.artist}</p>
                </div>
                <span className="num text-[11px] text-bone-faint shrink-0">
                  {track.durationFormatted}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default SpotifySearch;
