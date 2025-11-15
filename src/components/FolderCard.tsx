import React from "react";
import type { Folder } from "../context/SpeedDialContext";

export default function FolderCard({ folder }: { folder: Folder }) {
  return (
    <div className="cursor-pointer select-none">
      <div className="w-28 h-28 rounded-xl bg-blue-200 shadow-md flex items-center justify-center">
        <span className="text-lg font-semibold">{folder.name}</span>
      </div>
    </div>
  );
}
