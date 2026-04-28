import { StatusBanner } from "./status-banner";

type StatusStackProps = {
  hint?: string | null;
  error?: string | null;
  success?: string | null;
};

export function StatusStack({ hint, error, success }: StatusStackProps) {
  if (!hint && !error && !success) {
    return null;
  }

  return (
    <>
      {hint ? <StatusBanner type="info" message={hint} /> : null}
      {error ? <StatusBanner message={error} /> : null}
      {success ? <StatusBanner type="success" message={success} /> : null}
    </>
  );
}
