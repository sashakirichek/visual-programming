import { useTransition } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QRCodeSVG } from "qrcode.react";

export default function QrCodeModal({ url, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>SCAN TO OPEN THIS FLOW</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-body qr-modal-body">
          <ErrorBoundary fallback={<p>Unable to generate QR code for that big of a structure</p>}>
            <div className="qr-code-wrapper">
              <QRCodeSVG value={url} size={512} />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
