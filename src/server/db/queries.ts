import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const QUERIES = {
  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(foldersSchema.id);
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(filesSchema.id);
  },

  getAllParentsForFolder: async function (folderId: number) {
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

  getRootFolerForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
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
      .select()
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

  renameFolder: async function (folderId: number, newName: string) {
    return await db
      .update(foldersSchema)
      .set({ name: newName })
      .where(eq(foldersSchema.id, folderId));
  },

  renameFile: async function (fileId: number, newName: string) {
    return await db
      .update(filesSchema)
      .set({ name: newName })
      .where(eq(filesSchema.id, fileId));
  },
};
