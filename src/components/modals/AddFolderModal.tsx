import { useState } from "react";
import { useSpeedDial } from "../../context/SpeedDialContext";

export default function AddFolderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createFolder } = useSpeedDial();
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const saveFolder = () => {
    if (!name.trim()) return alert("Folder name required");

    createFolder({
      id: crypto.randomUUID(),
      name,
      items: []
    });

    onClose();
    setName("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add New Folder</h2>

        <input
          type="text"
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2">Cancel</button>
          <button
            onClick={saveFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
