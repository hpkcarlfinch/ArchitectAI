export const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
};
