"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { files_table, folders_table } from "./db/schema";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MUTATIONS } from "./db/queries";

const utApi = new UTApi();
export async function deleteFile(fileId: number) {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    throw new Error("File not found");
  }

  if (file.ownerId !== session.userId) {
    throw new Error("Unauthorized");
  }

  const utapiResult = await utApi.deleteFiles([file.utKey]);

  console.log("utapiResult : ", utapiResult);

  const databaseResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log("databaseResult : ", databaseResult);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function deleteFolder(folderId: number) {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.parent === null) {
    throw new Error("Cannot delete root folder");
  }

  if (folder.ownerId !== session.userId) {
    throw new Error("Unauthorized");
  }

  const childrenFiles = await db
    .select()
    .from(files_table)
    .where(eq(files_table.parent, folderId));

  if (childrenFiles.length > 0) {
    const utapiResult = await utApi.deleteFiles(
      childrenFiles.map((file) => file.utKey),
    );
    console.log("utapiResult : ", utapiResult);

    const databaseResult = await db.delete(files_table).where(
      inArray(
        files_table.id,
        childrenFiles.map((file) => file.id),
      ),
    );
    console.log("databaseResult : ", databaseResult);
  }

  const childrenFolders = await db
    .select()
    .from(folders_table)
    .where(eq(folders_table.parent, folderId));
  await Promise.all(
    childrenFolders.map(async (folder) => await deleteFolder(folder.id)),
  );

  const databaseResult = await db
    .delete(folders_table)
    .where(eq(folders_table.id, folderId));
  console.log("databaseResult : ", databaseResult);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function redirectToDrive() {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  return redirect("/drive");
}

export async function createNewDrive() {
  const session = await auth();

  if (!session.userId) return redirect("/sign-in");

  const rootFolderId = await MUTATIONS.onboardUser(session.userId);

  return redirect(`/folder/${rootFolderId}`);
}

export async function createFolder(input: {
  formData: FormData;
  parent: number;
  userId: string;
}) {
  await MUTATIONS.createFolder({
    folder: {
      name: input.formData.get("folderName") as string,
      parent: input.parent,
    },
    userId: input.userId,
  });

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
