interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  submitting?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Eliminar",
  submitting,
  error,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title" style={{ marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: error ? 12 : 20 }}>
          {message}
        </div>
        {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: "var(--danger)", color: "#fff" }}
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
