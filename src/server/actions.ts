"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { files_table, folders_table } from "./db/schema";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MUTATIONS, QUERIES } from "./db/queries";

const utApi = new UTApi();

export async function deleteFiles(filesIds: number[]) {
  if (filesIds.length === 0) return { success: true };

  const session = await auth();
  if (!session.userId) return redirect("/sign-in");

  return await db.transaction(async (tx) => {
    const files = await tx
      .select()
      .from(files_table)
      .where(
        and(
          inArray(files_table.id, filesIds),
          eq(files_table.ownerId, session.userId),
        ),
      );

    if (files.length !== filesIds.length)
      throw new Error("One or more files not found");

    try {
      const utapiResult = await utApi.deleteFiles(
        files.map((file) => file.utKey),
      );
      console.log("utapiResult : ", utapiResult);

      const databaseResult = await tx
        .delete(files_table)
        .where(inArray(files_table.id, filesIds));
      console.log("databaseResult : ", databaseResult);

      const c = await cookies();
      c.set("force-refresh", JSON.stringify(Math.random()));

      return { success: true };
    } catch (error) {
      console.error("Error deleting files:", error);
      throw new Error("Failed to delete files");
    }
  });
}

export async function deleteFolders(foldersIds: number[]) {
  if (foldersIds.length === 0) return { success: true };

  const session = await auth();
  if (!session.userId) return redirect("/sign-in");

  return await db.transaction(async (tx) => {
    // get selected folders to delete
    const folders = await tx
      .select()
      .from(folders_table)
      .where(
        and(
          inArray(folders_table.id, foldersIds),
          eq(folders_table.ownerId, session.userId),
        ),
      );

    if (folders.length !== foldersIds.length)
      throw new Error("One or more folders not found");

    if (folders.some((folder) => folder.parent === null))
      throw new Error("Cannot delete root folder");

    try {
      // get all child folders recursively
      const allChildFoldersRecursive = [...folders];
      let childFoldersIds = foldersIds;
      do {
        const childFolders = await tx
          .select()
          .from(folders_table)
          .where(
            and(
              inArray(folders_table.parent, childFoldersIds),
              eq(folders_table.ownerId, session.userId),
            ),
          );

        allChildFoldersRecursive.push(...childFolders);
        childFoldersIds = childFolders.map((folder) => folder.id);
      } while (childFoldersIds.length > 0);

      const newFoldersIds = allChildFoldersRecursive.map((folder) => folder.id);

      const allChildFiles = await getChildFiles(
        tx,
        newFoldersIds,
        session.userId,
      );

      if (allChildFiles.length > 0) {
        const utapiResult = await utApi.deleteFiles(
          allChildFiles.map((file) => file.utKey),
        );
        console.log("utapiResult : ", utapiResult);

        await tx.delete(files_table).where(
          inArray(
            files_table.id,
            allChildFiles.map((file) => file.id),
          ),
        );
      }

      await tx
        .delete(folders_table)
        .where(inArray(folders_table.id, newFoldersIds));

      const c = await cookies();
      c.set("force-refresh", JSON.stringify(Math.random()));

      return { success: true };
    } catch (error) {
      console.error("Error deleting folders:", error);
      throw new Error("Failed to delete folders");
    }
  });
}

function getChildFiles(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  folderIds: number[],
  userId: string,
) {
  return tx
    .select()
    .from(files_table)
    .where(
      and(
        inArray(files_table.parent, folderIds),
        eq(files_table.ownerId, userId),
      ),
    );
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

export async function renameFolder(
  folder: typeof folders_table.$inferSelect,
  newName: string,
) {
  if (folder.name !== newName.trim()) {
    await MUTATIONS.renameFolder(folder, newName.trim());

    const c = await cookies();

    c.set("force-refresh", JSON.stringify(Math.random()));
  }

  return { success: true };
}

export async function renameFile(
  file: typeof files_table.$inferSelect,
  newName: string,
) {
  await MUTATIONS.renameFile(file, newName);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function getAllFoldersForCurrentUser() {
  const session = await auth();
  if (!session.userId) return redirect("/sign-in");

  const allFolders = await QUERIES.getAllFoldersForUser(session.userId);

  return allFolders;
}

export async function moveFoldersAndFiles(
  newParentId: number,
  foldersIds: number[] = [],
  filesIds: number[] = [],
) {
  const session = await auth();
  if (!session.userId) return redirect("/sign-in");

  const existingFoldersPromise = QUERIES.getFoldersByParent(newParentId);
  const existingFilesPromise = QUERIES.getFilesByParent(newParentId);
  const foldersPromise = QUERIES.getFoldersByIds(foldersIds);
  const filesPromise = QUERIES.getFilesByIds(filesIds);

  const [existingFolders, existingFiles, folders, files] = await Promise.all([
    existingFoldersPromise,
    existingFilesPromise,
    foldersPromise,
    filesPromise,
  ]);

  const existingFoldersNames = existingFolders.map((folder) => folder.name);
  const existingFilesNames = existingFiles.map((file) => file.name);

  const conflictFoldersIds = folders
    .filter((folder) => existingFoldersNames.includes(folder.name))
    .map((folder) => folder.id);
  const conflictFilesIds = files
    .filter((file) => existingFilesNames.includes(file.name))
    .map((file) => file.id);

  await MUTATIONS.moveFoldersAndFiles(
    newParentId,
    foldersIds.filter((id) => !conflictFoldersIds.includes(id)),
    filesIds.filter((id) => !conflictFilesIds.includes(id)),
  );

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  if (conflictFoldersIds.length * conflictFilesIds.length !== 0)
    throw new Error("Error moving some data because of name conflicts");

  return { success: true };
}
