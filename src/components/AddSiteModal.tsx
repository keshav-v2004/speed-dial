import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, image: string, title: string) => void;
}

export default function AddSiteModal({ isOpen, onClose, onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add Website</h2>

        <input
          type="text"
          placeholder="Site Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input type="file" onChange={handleImageUpload} className="mb-3" />

        <button
          onClick={() => {
            if (url && image) {
              onAdd(url, image, title || url);
              onClose();
            }
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Add
        </button>

        <button onClick={onClose} className="w-full mt-2 text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
