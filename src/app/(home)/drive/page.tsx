import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createNewDrive } from "~/server/actions";
import { QUERIES } from "~/server/db/queries";
import SubmitButton from "./submit-button";

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  const rootFolder = await QUERIES.getRootFolerForUser(session.userId);

  if (!rootFolder) {
    return (
      <form action={createNewDrive}>
        <SubmitButton />
      </form>
    );
  }

  return redirect(`/folder/${rootFolder.id}`);
}
