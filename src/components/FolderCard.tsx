import type { Folder, SpeedDialItem } from "../context/SpeedDialContext";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableFolderItem } from "./SortableItem";
import SpeedDialCard from "./SpeedDialCard";

interface Props {
  folder: Folder;
  onDelete?: () => void;
  onItemDelete?: (itemId: string) => void;
  disableInnerSorting?: boolean;
  expanded?: boolean;
  onToggle?: (folderId: string) => void;
  highlight?: boolean;
}

export default function FolderCard({ folder, onDelete, onItemDelete, disableInnerSorting, expanded, onToggle, highlight }: Props) {
  return (
    <div
      className={`relative cursor-pointer select-none rounded-xl p-2 border transition-colors ${highlight ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200 bg-blue-50/40'} ${expanded ? 'shadow-md' : ''}`}
      onClick={() => onToggle?.(folder.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle?.(folder.id); } }}
      aria-expanded={expanded}
      aria-label={`Folder ${folder.name}`}
    >
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Delete folder"
        >
          ×
        </button>
      )}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-sm font-semibold truncate" title={folder.name}>{folder.name}</span>
        <span className="text-[10px] text-gray-500">{folder.items.length}</span>
      </div>
      {!expanded && (
        <div className="text-[10px] text-gray-400 italic px-1 py-4 text-center select-none">
          {folder.items.length ? 'Click to view items' : 'Empty folder'}
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-2 gap-1 mt-1">
          <SortableContext items={folder.items.map((it) => it.id)} strategy={rectSortingStrategy}>
            {folder.items.map((it: SpeedDialItem) => (
              <SortableFolderItem key={it.id} id={it.id} className="" disabled={disableInnerSorting}>
                <SpeedDialCard
                  item={it}
                  onDelete={onItemDelete ? () => onItemDelete(it.id) : undefined}
                />
              </SortableFolderItem>
            ))}
          </SortableContext>
          {folder.items.length === 0 && (
            <div className="text-xs text-gray-400 col-span-2 py-6 text-center">Drop items here</div>
          )}
        </div>
      )}
    </div>
  );
}
