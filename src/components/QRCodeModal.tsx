import React from 'react';
import { X, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  eventCode: string;
  eventUrl: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  eventCode,
  eventUrl
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-evento-${eventCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code scaricato!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('URL evento copiato negli appunti!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            QR Code Evento
          </h2>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-1">Codice Evento:</p>
            <p className="text-xl font-bold text-primary-600 font-mono">{eventCode}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 inline-block">
            <img 
              src={qrCode} 
              alt={`QR Code per evento ${eventCode}`}
              className="w-64 h-64 mx-auto"
            />
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Scansiona questo QR code per accedere direttamente all'evento
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Scarica QR
            </button>
            
            <button
              onClick={handleCopyUrl}
              className="btn-secondary flex items-center justify-center flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copia URL
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 break-all">
              {eventUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;