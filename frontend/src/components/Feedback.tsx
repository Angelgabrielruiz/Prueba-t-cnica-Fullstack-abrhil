export function LoadingState() {
  return (
    <div className="center-page">
      <div className="spinner" />
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="error-banner" style={{ margin: "24px 40px" }}>
      {message ?? "Ocurrió un error al cargar los datos. Intenta de nuevo."}
    </div>
  );
}
