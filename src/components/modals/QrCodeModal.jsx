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
          <div className="qr-code-wrapper">
            <QRCodeSVG value={url} size={256} />
          </div>
        </div>
      </div>
    </div>
  );
}
