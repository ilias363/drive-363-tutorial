import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  const rootFolder = await QUERIES.getRootFolerForUser(session.userId);

  if (!rootFolder) {
    return (
      <form
        action={async () => {
          "use server";

          const session = await auth();

          if (!session.userId) return redirect("/sign-in");

          const rootFolderId = await MUTATIONS.onboardUser(session.userId);

          return redirect(`/folder/${rootFolderId}`);
        }}
      >
        <Button type="submit">Create New Drive</Button>
      </form>
    );
  }

  return redirect(`/folder/${rootFolder.id}`);
}
