import { useDroppable } from '@dnd-kit/core';

export const CREATE_FOLDER_ZONE_ID = 'CREATE_FOLDER_ZONE';

export default function CreateFolderDropZone({ active }: { active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: CREATE_FOLDER_ZONE_ID });
  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-xl flex items-center justify-center h-28 w-28 text-[10px] select-none transition-colors ${
        isOver || active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-400 text-gray-500'
      }`}
    >
      Drop to create folder
    </div>
  );
}
