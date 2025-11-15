import type { Folder } from "../context/SpeedDialContext";

export default function FolderCard({ folder }: { folder: Folder }) {
  return (
    <div className="cursor-pointer select-none hover:ring-4 hover:ring-blue-300 transition">
      <div className="w-28 h-28 rounded-xl bg-blue-200 shadow-md flex items-center justify-center">
        <span className="text-lg font-semibold">{folder.name}</span>
      </div>
    </div>
  );
}
