import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export const QUERIES = {
  getFoldersByParent: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(foldersSchema.id);
  },

  getFilesByParent: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(filesSchema.id);
  },

  getRecursiveParentsForFolder: async function (folderId: number) {
    const parents = [];

    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Parent folder not found");
      }
      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents;
  },

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getFileById: async function (fileId: number) {
    const file = await db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.id, fileId));
    return file[0];
  },

  getFoldersByIds: async function (foldersIds: number[]) {
    const folders = await db
      .select()
      .from(foldersSchema)
      .where(inArray(foldersSchema.id, foldersIds));
    return folders;
  },

  getFilesByIds: async function (filesIds: number[]) {
    const files = await db
      .select()
      .from(filesSchema)
      .where(inArray(filesSchema.id, filesIds));
    return files;
  },

  getRootFolerForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },

  getAllFoldersForUser: async function (userId: string) {
    return await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.ownerId, userId));
  },
};

export const MUTATIONS = {
  createFolder: async function (input: {
    folder: {
      name: string;
      parent: number;
    };
    userId: string;
  }) {
    const names = input.folder.name
      .split("/")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    if (names.length === 0) throw new Error("Invalid folder name");

    const existingFolders = await db
      .select({ name: foldersSchema.name })
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.name, names[0]!),
          eq(foldersSchema.parent, input.folder.parent),
        ),
      );

    if (existingFolders.length > 0)
      throw new Error(`Folder name "${names[0]}" already exists`);

    const createdFoldersIds: number[] = [];
    for (const name of names) {
      const folder = await db.insert(foldersSchema).values({
        name: name,
        parent: input.folder.parent,
        ownerId: input.userId,
      });
      input.folder.parent = folder[0].insertId;
      createdFoldersIds.push(folder[0].insertId);
    }

    return createdFoldersIds;
  },

  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      utKey: string;
      parent: number;
    };
    userId: string;
  }) {
    const existingFiles = await db
      .select({ name: filesSchema.name })
      .from(filesSchema)
      .where(and(eq(filesSchema.parent, input.file.parent)));

    let newName = input.file.name;
    let i = 1;
    const extension = newName.split(".").pop();
    const baseName = extension
      ? newName.slice(0, -(extension.length + 1))
      : newName;

    while (existingFiles.some((file) => file.name === newName)) {
      newName = `${baseName} (${i})${extension ? "." + extension : ""}`;
      i++;
    }

    input.file.name = newName;

    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    });
  },

  onboardUser: async function (userId: string) {
    const existingRootFolder = await QUERIES.getRootFolerForUser(userId);

    if (existingRootFolder) {
      return existingRootFolder.id;
    }

    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        name: "Root",
        parent: null,
        ownerId: userId,
      })
      .$returningId();

    const rootFolderId = rootFolder[0]!.id;

    await db.insert(foldersSchema).values([
      {
        name: "Trash",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Images",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
      },
    ]);

    return rootFolderId;
  },

  renameFolder: async function (
    folder: typeof foldersSchema.$inferSelect,
    newName: string,
  ) {
    const existingFolders = await db
      .select({ name: foldersSchema.name })
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.name, newName),
          eq(foldersSchema.parent, folder.parent!),
        ),
      );

    if (existingFolders.length > 0)
      throw new Error(`Folder name "${newName}" already exists`);

    return await db
      .update(foldersSchema)
      .set({ name: newName })
      .where(eq(foldersSchema.id, folder.id));
  },

  renameFile: async function (
    file: typeof filesSchema.$inferSelect,
    newName: string,
  ) {
    const existingFiles = await db
      .select({ name: filesSchema.name })
      .from(filesSchema)
      .where(and(eq(filesSchema.parent, file.parent)));

    if (existingFiles.length > 0)
      throw new Error(`File name "${newName}" already exists`);

    return await db
      .update(filesSchema)
      .set({ name: newName })
      .where(eq(filesSchema.id, file.id));
  },

  moveFoldersAndFiles: async function (
    newParentId: number,
    foldersIds: number[],
    filesIds: number[],
  ) {
    const promises = [];
    if (foldersIds.length > 0)
      promises.push(
        db
          .update(foldersSchema)
          .set({ parent: newParentId })
          .where(inArray(foldersSchema.id, foldersIds)),
      );
    if (filesIds.length > 0)
      promises.push(
        db
          .update(filesSchema)
          .set({ parent: newParentId })
          .where(inArray(filesSchema.id, filesIds)),
      );
    return await Promise.all(promises);
  },
};
