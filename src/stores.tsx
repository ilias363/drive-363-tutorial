import { create } from "zustand";

interface SelectionState {
  selectedFolders: number[];
  selectedFiles: number[];
  toggleFolder: (folderId: number) => void;
  toggleFile: (fileId: number) => void;
  toggleAll: (folderIds: number[], fileIds: number[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedFolders: [],
  selectedFiles: [],
  toggleFolder: (folderId) =>
    set((state) => ({
      selectedFolders: state.selectedFolders.includes(folderId)
        ? state.selectedFolders.filter((id) => id !== folderId)
        : [...state.selectedFolders, folderId],
    })),
  toggleFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(fileId)
        ? state.selectedFiles.filter((id) => id !== fileId)
        : [...state.selectedFiles, fileId],
    })),
  toggleAll: (folderIds, fileIds) =>
    set((state) => {
      const isAllSelected =
        state.selectedFolders.length + state.selectedFiles.length ===
        folderIds.length + fileIds.length;
      return {
        selectedFolders: isAllSelected ? [] : folderIds,
        selectedFiles: isAllSelected ? [] : fileIds,
      };
    }),
  clearSelection: () => set({ selectedFolders: [], selectedFiles: [] }),
}));
