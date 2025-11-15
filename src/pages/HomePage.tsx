import { useState } from "react";
import { useSpeedDial } from "../context/SpeedDialContext";
import SpeedDialCard from "../components/SpeedDialCard";
import FolderCard from "../components/FolderCard";
import AddSiteModal from "../components/AddSiteModal";
import AddFolderModal from "../components/modals/AddFolderModal";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
  type CollisionDetection,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableRootItem } from "../components/SortableItem";
import CreateFolderDropZone, { CREATE_FOLDER_ZONE_ID } from "../components/CreateFolderDropZone";
import type { SpeedDialItem, Folder } from "../context/SpeedDialContext";

export default function HomePage() {
  const {
    state,
    setOrder,
    deleteItem,
    deleteFolder,
    addItem,
    addItemToFolder,
    removeItemFromFolder,
    reorderFolderItems,
    groupItemsIntoFolder,
  } = useSpeedDial();

  const { items, folders, order } = state;
  // Custom collision detection to map inner folder item collisions to folder root when dragging root item
  const collisionDetection: CollisionDetection = (args) => {
    const collisions = closestCenter(args);
    if (!collisions.length) return collisions;
    const activeIdStr = String(args.active.id);
    const activeInRoot = order.includes(activeIdStr) && !folders.some(f => f.items.some(it => it.id === activeIdStr));
    if (activeInRoot) {
      const first = collisions[0];
      const overIdStr = String(first.id);
      const containingFolder = folders.find(f => f.items.some(it => it.id === overIdStr));
      if (containingFolder) {
        return [{ ...first, id: containingFolder.id }];
      }
    }
    return collisions;
  };

  const [showAddSite, setShowAddSite] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSourceFolder, setActiveSourceFolder] = useState<string | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  if (!order || !items || !folders) {
    return <div className="text-white p-4">Loading...</div>;
  }

  const getItemType = (id: string) => {
    if (items.some((i) => i.id === id)) return "item";
    if (folders.some((f) => f.id === id)) return "folder";
    // inside folder?
    if (folders.some((f) => f.items.some((it) => it.id === id))) return "item";
    return "unknown";
  };

  const getData = (id: string) => {
    return (
      items.find((i) => i.id === id) ||
      folders.find((f) => f.id === id) ||
      folders.flatMap((f) => f.items).find((it) => it.id === id)
    );
  };

  // Sensors (pointer + touch long press + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(String(active.id));
    // detect source folder
    const sourceFolder = folders.find((f) => f.items.some((it) => it.id === active.id));
    setActiveSourceFolder(sourceFolder ? sourceFolder.id : null);
  };

  const handleDragOver = () => {
    // reserved for future cross-folder hover logic
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const activeType = getItemType(activeIdStr);
    const overType = getItemType(overIdStr);

    // Helper: if over is an item inside a folder, treat that folder as target for item moves
    const overContainingFolder = folders.find((f) => f.items.some((it) => it.id === overIdStr)) || null;

    // Auto-create folder when item dropped on another root item (both in root order and not already in a folder)
    if (
      activeType === "item" &&
      overType === "item" &&
      activeIdStr !== overIdStr &&
      order.includes(activeIdStr) &&
      order.includes(overIdStr) &&
      !folders.some(f => f.items.some(it => it.id === activeIdStr)) &&
      !folders.some(f => f.items.some(it => it.id === overIdStr))
    ) {
      groupItemsIntoFolder([activeIdStr, overIdStr]);
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }

    // Reordering root items/folders
    const activeInRoot = order.includes(activeIdStr);
    const overInRoot = order.includes(overIdStr);
    if (activeInRoot && overInRoot && activeIdStr !== overIdStr) {
      const oldIndex = order.indexOf(activeIdStr);
      const newIndex = order.indexOf(overIdStr);
      setOrder(arrayMove(order, oldIndex, newIndex));
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }

    // Moving item into folder
    if (activeType === "item" && activeIdStr !== overIdStr && (overType === "folder" || overContainingFolder)) {
      const targetFolderId = overType === "folder" ? overIdStr : overContainingFolder!.id;
      const item = items.find((i) => i.id === activeIdStr) ||
        folders.flatMap((f) => f.items).find((i) => i.id === activeIdStr);
      if (item) {
        if (activeSourceFolder) {
          removeItemFromFolder(activeSourceFolder, item.id);
        }
        if (order.includes(item.id)) {
          setOrder(order.filter((id) => id !== item.id));
        }
        addItemToFolder(targetFolderId, item);
      }
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }

    // Reorder within same folder
    if (activeSourceFolder) {
      const folder = folders.find((f) => f.id === activeSourceFolder);
      if (folder) {
        const ids = folder.items.map((it) => it.id);
        if (ids.includes(overIdStr) && activeIdStr !== overIdStr) {
          const oldIndex = ids.indexOf(activeIdStr);
          const newIndex = ids.indexOf(overIdStr);
          const newIds = arrayMove(ids, oldIndex, newIndex);
          reorderFolderItems(folder.id, newIds);
          setActiveId(null);
          setActiveSourceFolder(null);
          return;
        }
      }
    }

    // Dragging item out to root grid (over root item or folder)
    if (activeSourceFolder && overInRoot && activeType === "item") {
      const folderId = activeSourceFolder;
      const oldFolder = folders.find((f) => f.id === folderId);
      const draggedItem = oldFolder?.items.find((it) => it.id === activeIdStr);
      if (draggedItem) {
        removeItemFromFolder(folderId, draggedItem.id);
        // Insert at position of overIdStr
        const insertIndex = order.indexOf(overIdStr);
        const newOrder = [...order];
        newOrder.splice(insertIndex, 0, draggedItem.id);
        setOrder(newOrder);
      }
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }

    // Dropped item from folder to empty root area (not over root element id) -> append
    if (activeSourceFolder && activeType === "item" && !overInRoot && !order.includes(activeIdStr)) {
          // Drop on create-folder zone to create new folder with single item
          if (overIdStr === CREATE_FOLDER_ZONE_ID && activeType === "item") {
            // If item inside folder remove first
            if (activeSourceFolder) {
              removeItemFromFolder(activeSourceFolder, activeIdStr);
            } else if (order.includes(activeIdStr)) {
              // remove from order, will be grouped
              setOrder(order.filter(id => id !== activeIdStr));
            }
            groupItemsIntoFolder([activeIdStr]);
            setActiveId(null);
            setActiveSourceFolder(null);
            return;
          }
      const folderId = activeSourceFolder;
      const oldFolder = folders.find((f) => f.id === folderId);
      const draggedItem = oldFolder?.items.find((it) => it.id === activeIdStr);
      if (draggedItem) {
        removeItemFromFolder(folderId, draggedItem.id);
        setOrder([...order, draggedItem.id]);
      }
      setActiveId(null);
      setActiveSourceFolder(null);
      return;
    }

    setActiveId(null);
    setActiveSourceFolder(null);
  };

  const handleDelete = (id: string) => {
    const type = getItemType(id);

    if (type === "item") {
      deleteItem(id);
    } else if (type === "folder") {
      deleteFolder(id);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Speed Dial</h1>

          <div className="flex gap-4">
            <button
              onClick={() => setShowAddSite(true)}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Site
            </button>

            <button
              onClick={() => setShowAddFolder(true)}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
            >
              Add Folder
            </button>
          </div>
        </div>

        {/* GRID with dnd-kit */}
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {order.map((id) => {
                const type = getItemType(id);
                const data = getData(id);
                if (!data) return null;
                const isItem = type === "item";
                return (
                  <SortableRootItem key={id} id={id}>
                    {isItem ? (
                      <SpeedDialCard
                        item={data as SpeedDialItem}
                        onDelete={() => handleDelete(id)}
                        dragging={activeId === id}
                      />
                    ) : (
                      <FolderCard
                        folder={data as Folder}
                        onDelete={() => handleDelete(id)}
                        onItemDelete={(itemId) => handleDelete(itemId)}
                        disableInnerSorting={activeId !== null && order.includes(activeId) && !activeSourceFolder}
                        expanded={expandedFolderId === id}
                        onToggle={(fid) => setExpandedFolderId(expandedFolderId === fid ? null : fid)}
                        highlight={activeId !== null && activeId !== id && order.includes(activeId)}
                      />
                    )}
                  </SortableRootItem>
                );
              })}
              {/* Create Folder Drop Zone */}
              <CreateFolderDropZone active={activeId !== null} />
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId && (() => {
              const activeType = getItemType(activeId);
              const data = getData(activeId);
              if (!data) return null;
              if (activeType === "item") {
                return <SpeedDialCard item={data as SpeedDialItem} dragging />;
              }
              if (activeType === "folder") {
                return <FolderCard folder={data as Folder} />;
              }
              return null;
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
      {showAddFolder && (
        <AddFolderModal
          isOpen={showAddFolder}
          onClose={() => setShowAddFolder(false)}
        />
      )}
    </div>
  );
}
