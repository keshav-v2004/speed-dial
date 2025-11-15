import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpeedDial } from "../context/SpeedDialContext";

const ViewPage: React.FC = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

const {
  state: { folders },
  deleteFolder,
  removeItemFromFolder,   
} = useSpeedDial();

  const folder = folders.find((f) => f.id === folderId);

  if (!folder) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-2xl font-semibold">Folder Not Found</h1>
        <button
          className="mt-4 bg-blue-500 px-4 py-2 rounded-xl"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleDeleteFolder = () => {
    deleteFolder(folder.id);
    navigate("/");
  };

  const handleRemoveTab = (tabId: string) => {
    removeItemFromFolder(folder.id, tabId);
  };

  return (
    <div className="p-6 text-white min-h-screen bg-[#0e0e0e]">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{folder.name}</h1>

        <div className="flex gap-3">
          <button
            className="bg-gray-700 px-4 py-2 rounded-xl"
            onClick={() => navigate("/")}
          >
            Back
          </button>

          <button
            className="bg-red-600 px-4 py-2 rounded-xl"
            onClick={handleDeleteFolder}
          >
            Delete Folder
          </button>
        </div>
      </div>

      {/* List Items */}
      <div className="mt-8 space-y-4">
        {folder.items.length === 0 ? (
          <p className="text-gray-400 text-lg">This folder is empty.</p>
        ) : (
          folder.items.map((item) => (
            <div
              key={item.id}
              className="bg-[#1c1c1c] p-4 rounded-2xl flex justify-between items-center shadow-lg border border-gray-700"
            >
              <div>
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-gray-400 text-sm">{item.url}</p>
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-blue-600 px-3 py-1 rounded-xl"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  Open
                </button>

                <button
                  className="bg-red-600 px-3 py-1 rounded-xl"
                  onClick={() => handleRemoveTab(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewPage;
