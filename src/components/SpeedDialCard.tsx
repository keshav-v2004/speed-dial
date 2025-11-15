import type { SpeedDialItem } from "../context/SpeedDialContext";

export default function SpeedDialCard({ item }: { item: SpeedDialItem }) {
  return (
    <div className="cursor-pointer select-none group">
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
