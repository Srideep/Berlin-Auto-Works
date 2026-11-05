import Link from "next/link";

export default function AdminForbidden() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-medium text-ink">You do not have access to that.</h1>
      <p className="max-w-xl text-base leading-7 text-muted">
        The workspace checks role and location before it shows a record. This
        screen is what a staff member sees when that check fails.
      </p>
      <Link href="/admin" className="inline-flex min-h-11 items-center font-semibold text-copper">
        Back to today
      </Link>
    </div>
  );
}
