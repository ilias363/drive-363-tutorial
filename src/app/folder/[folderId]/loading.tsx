import { ChevronRight } from "lucide-react";

export default function FolderLoading() {
  return (
    <div className="min-h-screen p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
            <ChevronRight size={16} className="mx-2 text-gray-500" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
          </div>
          <div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
          </div>
        </div>
        <div className="rounded-lg bg-neutral-900/50 shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="w-5/12 px-6 py-4 text-left text-gray-400">
                  Name
                </th>
                <th className="w-3/12 px-6 py-4 text-center text-gray-400">
                  Created
                </th>
                <th className="w-2/12 px-6 py-4 text-center text-gray-400">
                  Size
                </th>
                <th className="w-2/12 px-6 py-4 text-center text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-700" />
                      <div className="ml-3 h-4 w-32 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex w-full items-center justify-center">
          <div className="my-2 h-10 w-32 animate-pulse rounded bg-gray-700 p-2" />
        </div>
      </div>
    </div>
  );
}
