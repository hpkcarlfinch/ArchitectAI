import { useApp } from "../../hooks/useAppContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";

type AuthControlsProps = {
  variant?: "card" | "navbar";
};

export const AuthControls = ({ variant = "card" }: AuthControlsProps) => {
  const { user, authLoading, signIn, signOut } = useApp();

  if (authLoading) {
    return <LoadingSpinner label="Checking auth..." />;
  }

  if (variant === "navbar") {
    return user ? (
      <div className="auth-inline">
        <p className="muted small">Signed in as {user.displayName || user.email || user.uid}</p>
        <button className="button" onClick={signOut} type="button">
          Sign Out
        </button>
      </div>
    ) : (
      <div className="auth-inline">
        <button className="button" onClick={signIn} type="button">
          Sign In With Google
        </button>
      </div>
    );
  }

  return (
    <section className="card section-gap">
      <h2>Account</h2>
      {user ? (
        <>
          <p className="muted">Signed in as {user.displayName || user.email || user.uid}</p>
          <button className="button" onClick={signOut} type="button">
            Sign Out
          </button>
        </>
      ) : (
        <>
          <p className="muted">Sign in to save and sync projects. Demo mode works without sign-in.</p>
          <button className="button" onClick={signIn} type="button">
            Sign In With Google
          </button>
        </>
      )}
    </section>
  );
};
