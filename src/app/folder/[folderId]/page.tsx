import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DriveContents from "~/components/drive-contents";
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const session = await auth();
  if (!session.userId) {
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center gap-2 text-2xl font-medium text-neutral-400">
        You must be logged in to access your drive
        <Link
          href="/sign-in"
          className="underline underline-offset-2 hover:text-neutral-500"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center text-2xl font-medium text-neutral-400">
        {`"${params.folderId}" is not a valid folder ID`}
        <Link
          href="/drive"
          className="underline underline-offset-2 hover:text-neutral-500"
        >
          Go back to your drive
        </Link>
      </div>
    );
  }

  const currentFolder = await QUERIES.getFolderById(parsedFolderId);
  if (currentFolder && currentFolder.ownerId !== session.userId) {
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center text-2xl font-medium text-neutral-400">
        {`You do not have access to folder with ID "${parsedFolderId}"`}
        <Link
          href="/drive"
          className="underline underline-offset-2 hover:text-neutral-500"
        >
          Go back to your drive
        </Link>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center text-2xl font-medium text-neutral-400">
        {`Folder with ID "${parsedFolderId}" does not exist`}
        <Link
          href="/drive"
          className="underline underline-offset-2 hover:text-neutral-500"
        >
          Go back to your drive
        </Link>
      </div>
    );
  }

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getRecursiveParentsForFolder(parsedFolderId),
  ]);

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={parsedFolderId}
    />
  );
}
