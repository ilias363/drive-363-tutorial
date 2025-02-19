import { ChevronRight } from "lucide-react";

export default function FolderLoading() {
  return (
    <div className="flex min-h-screen flex-row items-start justify-center gap-6 pl-2 pt-6 text-gray-100">
      <nav className="flex h-[94vh] w-[13vw] flex-col items-center justify-between rounded-lg bg-neutral-900 px-4 py-2 shadow-xl">
        <div className="mt-2 flex flex-col items-start gap-3">
          <div className="h-10 w-[10vw] animate-pulse rounded bg-gray-700" />
          <div className="h-10 w-[10vw] animate-pulse rounded bg-gray-700" />
        </div>
        <div className="my-4">
          <div className="h-10 w-[10vw] animate-pulse rounded bg-gray-700" />
        </div>
      </nav>

      <div className="mx-auto flex-1 pr-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center py-2 pl-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
            <div className="flex items-center space-x-1">
              <ChevronRight size={16} className="text-gray-500" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
            </div>
          </div>
          <div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
          </div>
        </div>
        <div className="h-[88vh] rounded-lg bg-neutral-900/50 shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="w-[5%] py-4">
                  <div className="m-auto h-4 w-4 animate-pulse rounded bg-gray-700" />
                </th>
                <th className="px-2 py-4 text-left text-gray-400">Name</th>
                <th className="w-3/12 px-2 py-4 text-center text-gray-400">
                  Created
                </th>
                <th className="w-2/12 px-2 py-4 text-center text-gray-400">
                  Size
                </th>
                <th className="w-2/12 px-2 py-4 text-center text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-4">
                    <div className="m-auto h-4 w-4 animate-pulse rounded bg-gray-700" />
                  </td>
                  <td className="px-2 py-6">
                    <div className="flex items-center">
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-2 py-6">
                    <div className="flex justify-center">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-2 py-6">
                    <div className="flex justify-center">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                  <td className="px-2 py-6">
                    <div className="flex justify-center">
                      <div className="h-1 w-4 animate-pulse rounded bg-gray-700" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
