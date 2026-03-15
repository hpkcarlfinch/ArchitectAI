import { useApp } from "../../hooks/useAppContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export const AuthControls = () => {
  const { user, authLoading, signIn, signOut } = useApp();

  if (authLoading) {
    return <LoadingSpinner label="Checking auth..." />;
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
