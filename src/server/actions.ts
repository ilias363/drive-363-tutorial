"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { files_table } from "./db/schema";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utApi = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    throw new Error("File not found");
  }

  const utapiResult = await utApi.deleteFiles([
    file.url.replace("https://utfs.io/f/", ""),
  ]);

  console.log(utapiResult);

  const databaseResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log(databaseResult);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
