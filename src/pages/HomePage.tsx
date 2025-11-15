import { useState, useEffect } from "react";
import { useSpeedDial } from "../context/SpeedDialContext";
import SpeedDialCard from "../components/SpeedDialCard";
import AddSiteModal from "../components/AddSiteModal";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableRootItem } from "../components/SortableItem";
import type { SpeedDialItem } from "../context/SpeedDialContext";

export default function HomePage() {
  const { state, setOrder, deleteItem, addItem, updateItem } = useSpeedDial();

  const { items, order } = state;
  // Using default closestCenter; no folder-target mapping

  const [showAddSite, setShowAddSite] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Folder state removed
  
  const [editTarget, setEditTarget] = useState<SpeedDialItem | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!order || !items) {
    return <div className="text-white p-4">Loading...</div>;
  }

  const getData = (id: string) => items.find(i => i.id === id);

  // Sensors (pointer + touch long press + keyboard)
  const sensors = useSensors(
    // Use PointerSensor for both mouse and touch; distance threshold allows quick drag while
    // long-press without movement can be used for edit on mobile
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(String(active.id));
    // no folder detection
  };

  const handleDragOver = () => {
    // no-op; we no longer handle grouping or add-to-folder
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      
      return;
    }
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    // Reordering root items
    const activeInRoot = order.includes(activeIdStr);
    const overInRoot = order.includes(overIdStr);
    if (activeInRoot && overInRoot && activeIdStr !== overIdStr) {
      const oldIndex = order.indexOf(activeIdStr);
      const newIndex = order.indexOf(overIdStr);
      setOrder(arrayMove(order, oldIndex, newIndex));
      setActiveId(null);
      
      return;
    }

    setActiveId(null);
    
  };

  const handleDelete = (id: string) => deleteItem(id);

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-wide">
              {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h1>
            <span className="text-lg text-gray-300 font-mono">
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* GRID with dnd-kit */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {order.map(id => {
                const data = getData(id);
                if (!data) return null;
                return (
                  <SortableRootItem key={id} id={id} freezeTransform={false}>
                    <SpeedDialCard
                      item={data as SpeedDialItem}
                      onDelete={() => handleDelete(id)}
                      dragging={activeId === id}
                      onEdit={() => setEditTarget(data as SpeedDialItem)}
                    />
                  </SortableRootItem>
                );
              })}
              {/* Add Site Tile (fixed at end, not sortable) */}
              <button
                type="button"
                onClick={() => setShowAddSite(true)}
                className="h-28 w-28 rounded-xl border-2 border-dashed border-gray-400 text-gray-600 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition select-none"
                aria-label="Add site"
              >
                + Add Site
              </button>
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId && (() => {
              const data = getData(activeId);
              if (!data) return null;
              return <SpeedDialCard item={data as SpeedDialItem} dragging />;
            })()}
          </DragOverlay>
        </DndContext>
      </div>

      {/* MODALS */}
      {showAddSite && (
        <AddSiteModal
          isOpen={showAddSite}
          onClose={() => setShowAddSite(false)}
          onAdd={(url, image, title) =>
            addItem({ id: crypto.randomUUID(), url, image, title: title || url })
          }
        />
      )}
      {editTarget && (
        <AddSiteModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(url, image, title) => {
            updateItem(editTarget.id, { url, image, title });
          }}
          initial={{ url: editTarget.url, title: editTarget.title, image: editTarget.image }}
          submitLabel="Save"
          titleLabel="Edit Website"
        />
      )}
    </div>
  );
}
