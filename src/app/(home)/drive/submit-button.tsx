"use client";

import { useFormStatus } from "react-dom";
import { Button } from "~/components/ui/button";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
      disabled={pending}
    >
      {pending ? "Initializing..." : "Initialize New Drive"}
    </Button>
  );
}
