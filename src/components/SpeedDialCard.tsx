import { useRef } from "react";
import type { SpeedDialItem } from "../context/SpeedDialContext";

interface Props {
  item: SpeedDialItem;
  onDelete?: () => void;
  dragging?: boolean;
  onEdit?: () => void;
}

export default function SpeedDialCard({ item, onDelete, dragging, onEdit }: Props) {
  const pressTimerRef = useRef<number | null>(null);
  const longPressedRef = useRef<boolean>(false);

  const openLink = () => {
    if (!item.url) return;
    try {
      const normalized = /^(https?:)/i.test(item.url) ? item.url : `https://${item.url}`;
      window.open(normalized, "_blank", "noopener,noreferrer");
    } catch {
      // swallow
    }
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!onEdit) return;
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const clearTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    longPressedRef.current = false;
    if (!onEdit) return;
    // Only consider touch/pen for long-press; right-click handled by contextmenu
    if (e.pointerType === 'mouse') return;
    clearTimer();
    pressTimerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onEdit();
    }, 600);
  };

  const onPointerUp = () => {
    clearTimer();
  };

  const onPointerCancel = () => {
    clearTimer();
  };

  return (
    <div
      onClick={(e) => {
        if (longPressedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        openLink();
      }}
      onContextMenu={handleContextMenu}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLink(); } }}
      className={`w-28 relative cursor-pointer select-none group outline-none focus:ring-2 focus:ring-blue-500 rounded ${dragging ? "scale-105 shadow-lg" : ""}`}
      aria-label={`Open ${item.title}`}
    >
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          aria-label="Delete"
        >
          ×
        </button>
      )}
      <div className="w-28 h-28 rounded-xl overflow-hidden shadow-md bg-gray-200">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="w-28 truncate text-center mt-2 text-sm text-gray-200 group-hover:underline">
        {item.title}
      </p>
    </div>
  );
}
