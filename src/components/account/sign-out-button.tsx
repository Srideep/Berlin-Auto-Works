import { signOutAction } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm font-semibold text-copper hover:text-copper-dark"
      >
        Sign out
      </button>
    </form>
  );
}
