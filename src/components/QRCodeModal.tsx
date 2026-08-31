import React from 'react';
import { Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Label from './ui/Label';

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
    <Modal
      eyebrow="Da proiettare o stampare"
      title="QR code dell'evento"
      onClose={onClose}
      footer={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4" />
            Scarica
          </Button>
          <Button variant="ghost" onClick={handleCopyUrl} className="flex-1">
            <Copy className="h-4 w-4" />
            Copia link
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center">
        {/* Il QR resta su bianco con il suo quiet zone: su fondo scuro molte
            fotocamere non lo leggono. È l'unica isola chiara dell'interfaccia. */}
        <div className="bg-white p-4 rounded-lg">
          <img
            src={qrCode}
            alt={`QR code dell'evento ${eventCode}`}
            className="h-56 w-56 sm:h-64 sm:w-64 block"
          />
        </div>

        <Label as="div" className="mt-6">
          Codice evento
        </Label>
        <p className="num mt-1.5 text-2xl font-semibold tracking-[0.15em]">{eventCode}</p>

        <p className="mt-6 pt-5 border-t border-white/[0.08] w-full text-center text-[13px] text-bone-dim">
          Chi lo inquadra arriva direttamente alla coda della serata.
        </p>
        <p className="mt-2 text-[11px] text-bone-faint break-all text-center">{eventUrl}</p>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
