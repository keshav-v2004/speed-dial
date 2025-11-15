import type { SpeedDialItem } from "../context/SpeedDialContext";

interface Props {
  item: SpeedDialItem;
  onDelete?: () => void;
  dragging?: boolean;
}

export default function SpeedDialCard({ item, onDelete, dragging }: Props) {
  const openLink = () => {
    if (!item.url) return;
    try {
      const normalized = /^(https?:)/i.test(item.url) ? item.url : `https://${item.url}`;
      window.open(normalized, "_blank", "noopener,noreferrer");
    } catch {
      // swallow
    }
  };
  return (
    <div
      onClick={openLink}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLink(); } }}
      className={`relative cursor-pointer select-none group outline-none focus:ring-2 focus:ring-blue-500 rounded ${dragging ? "scale-105 shadow-lg" : ""}`}
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
      <p className="text-center mt-2 text-sm text-gray-700 group-hover:underline">
        {item.title}
      </p>
    </div>
  );
}
