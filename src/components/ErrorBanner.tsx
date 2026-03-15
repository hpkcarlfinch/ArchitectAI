interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onDismiss ? (
        <button className="button subtle" onClick={onDismiss} type="button">
          Dismiss
        </button>
      ) : null}
    </div>
  );
};
