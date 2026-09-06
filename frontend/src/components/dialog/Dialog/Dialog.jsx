import "./Dialog.css"

export default function Dialog({
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Speichern"
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">

        <div className="modal-header">
          <h3>{title}</h3>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {children}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="submit-btn"
            >
              {submitLabel}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}