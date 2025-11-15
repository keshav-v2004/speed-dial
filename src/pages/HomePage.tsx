import { useState } from "react";
import GoogleSearchBar from "../components/GoogleSearchBar";
import AddSiteModal from "../components/AddSiteModal";
import SpeedDialCard from "../components/SpeedDialCard";
import FolderCard from "../components/FolderCard";
import DraggableItem from "../components/DraggableItem";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useSpeedDial } from "../context/SpeedDialContext";

export default function HomePage() {
  const {
    items,
    folders,
    addItem,
    addFolder,
    order,
    setOrder,
  } = useSpeedDial();

  const [isModalOpen, setModalOpen] = useState(false);

  // Enable mouse + mobile drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // --- DRAG END LOGIC ---
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    // Reorder logic
    if (active.id !== over.id) {
      const oldIndex = order.indexOf(active.id);
      const newIndex = order.indexOf(over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setOrder(arrayMove(order, oldIndex, newIndex));
      }
    }

    // Move into folder logic
    const folder = folders.find((f) => f.id === over.id);
    const item = items.find((i) => i.id === active.id);

    if (folder && item) {
      // Remove item from main area
      setOrder(order.filter((x) => x !== item.id));

      // Move inside folder
      folder.items.push(item);

      return;
    }
  };

  return (
    <div className="px-6 py-10">

      {/* SEARCH BAR */}
      <GoogleSearchBar />

      {/* ADD SITE BUTTON */}
      <div className="text-center mt-8">
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700"
        >
          + Add Site
        </button>
      </div>

      {/* DRAG + DROP REGION */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order}>
          <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 justify-center">

            {order.map((id) => {
              const item = items.find((x) => x.id === id);
              const folder = folders.find((x) => x.id === id);

              if (item)
                return (
                  <DraggableItem key={id} id={id}>
                    <SpeedDialCard item={item} />
                  </DraggableItem>
                );

              if (folder)
                return (
                  <DraggableItem key={id} id={id}>
                    <FolderCard folder={folder} />
                  </DraggableItem>
                );

              return null;
            })}

          </div>
        </SortableContext>
      </DndContext>

      {/* ADD SITE MODAL */}
      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(url, image, title) =>
          addItem({
            id: crypto.randomUUID(),
            url,
            image,
            title: title || url,
          })
        }
      />
    </div>
  );
}
