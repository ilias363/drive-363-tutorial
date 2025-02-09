"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { files_table } from "./db/schema";
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

  if (file.parent === null) {
    throw new Error("Cannot delete root folder");
  }

  if (file.ownerId !== session.userId) {
    throw new Error("Unauthorized");
  }

  const utapiResult = await utApi.deleteFiles([file.utKey]);

  console.log(utapiResult);

  const databaseResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log(databaseResult);

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
