import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { MUTATIONS, QUERIES } from "~/server/db/queries";
import { folders_table } from "~/server/db/schema";

export default function SandboxPage() {
  return (
    <form
      className="flex h-[100vh] w-[100vw] items-center justify-center"
      action={async () => {
        "use server";
        const session = await auth();
        if (!session.userId) throw new Error("Unauthorized");

        const rootFolder = await QUERIES.getRootFolerForUser(session.userId);
        if (!rootFolder) throw new Error("Root folder not found");

        const folder1 = await MUTATIONS.createFolder({
          folder: {
            name: "Parent Folder 1",
            parent: rootFolder.id,
          },
          userId: session.userId,
        });

        const folder2 = await MUTATIONS.createFolder({
          folder: {
            name: "Parent Folder 2",
            parent: rootFolder.id,
          },
          userId: session.userId,
        });

        // Create nested folders under Parent Folder 1
        const nestedFolder1 = await MUTATIONS.createFolder({
          folder: {
            name: "Nested Folder 1",
            parent: folder1[0].insertId,
          },
          userId: session.userId,
        });

        await MUTATIONS.createFolder({
          folder: {
            name: "Deeply Nested Folder",
            parent: nestedFolder1[0].insertId,
          },
          userId: session.userId,
        });

        // Create nested folder under Parent Folder 2
        await MUTATIONS.createFolder({
          folder: {
            name: "Nested Folder 2",
            parent: folder2[0].insertId,
          },
          userId: session.userId,
        });
      }}
    >
      <button type="submit" className="rounded-md bg-green-500 px-4 py-2">
        Submit
      </button>
    </form>
  );
}
