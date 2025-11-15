import { useState } from "react";
import { useSpeedDial } from "../context/SpeedDialContext";
import SpeedDialCard from "../components/SpeedDialCard";
import FolderCard from "../components/FolderCard";
import AddSiteModal from "../components/AddSiteModal";
import GoogleSearchBar from "../components/GoogleSearchBar";

export default function HomePage() {
  const { items, folders, addItem } = useSpeedDial();
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-6 py-10">
      <GoogleSearchBar />

      {/* Add Site Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md"
        >
          + Add Site
        </button>
      </div>

      {/* Grid Layout */}
      <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 justify-center">
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} />
        ))}

        {items.map(item => (
          <SpeedDialCard key={item.id} item={item} />
        ))}
      </div>

      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(url, image, title) =>
          addItem({ id: crypto.randomUUID(), url, image, title })
        }
      />
    </div>
  );
}
