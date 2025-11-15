import { useState, useRef } from "react";
import { useSpeedDial } from "../../context/SpeedDialContext";

export default function AddSiteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addItem } = useSpeedDial();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const item = e.clipboardData.items[0];
    if (item && item.type.startsWith("image")) {
      const file = item.getAsFile();
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveItem = () => {
    if (!url) return alert("URL is required");

    addItem({
      id: crypto.randomUUID(),
      url,
      title: title || url,
      image: image || "",
    });

    onClose();
    setUrl("");
    setTitle("");
    setImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl"
           onPaste={handlePaste}>
        <h2 className="text-xl font-bold mb-4">Add New Site</h2>

        <input
          type="url"
          placeholder="Website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
        />

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
        />

        <div className="border p-3 rounded bg-gray-100 dark:bg-gray-700 text-center mb-3">
          {image ? (
            <img src={image} className="w-24 h-24 mx-auto rounded" />
          ) : (
            <p className="text-sm">Upload or paste image here</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2">Cancel</button>
          <button onClick={saveItem} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
      </div>
    </div>
  );
}
