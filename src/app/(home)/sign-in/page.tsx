import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <SignInButton forceRedirectUrl={"/drive"}>
      <button className="text-md rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white transition-colors hover:bg-neutral-700">
        Sign in to Drive363
      </button>
    </SignInButton>
  );
}
