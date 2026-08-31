import React, { useState } from 'react';
import { Music } from 'lucide-react';
import clsx from 'clsx';

interface AlbumArtProps {
  src?: string;
  alt?: string;
  /** Classi di dimensione, es. "h-16 w-16". */
  className?: string;
}

/**
 * Le copertine sono l'unica fonte di colore reale dell'interfaccia: grandi,
 * quadrate, mai ritagliate in cerchio.
 */
const AlbumArt: React.FC<AlbumArtProps> = ({ src, alt = '', className }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={clsx(
        'relative shrink-0 overflow-hidden rounded-sm bg-ink-800 border border-white/[0.08]',
        className
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-500">
          <Music className="h-1/3 w-1/3" />
        </div>
      )}
    </div>
  );
};

export default AlbumArt;
