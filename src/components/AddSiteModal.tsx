import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (url: string, image: string, title: string) => void;
  onSave?: (url: string, image: string, title: string) => void;
  initial?: { url?: string; title?: string; image?: string };
  submitLabel?: string;
  titleLabel?: string;
}

function normalizeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const prefixed = /^(https?:)?\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(prefixed);
    return u.toString();
  } catch {
    return raw; // let validation handle later
  }
}

function faviconFor(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}

export default function AddSiteModal({ isOpen, onClose, onAdd, onSave, initial, submitLabel, titleLabel }: Props) {
  const [url, setUrl] = useState(initial?.url ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [autoIcon, setAutoIcon] = useState<string>(initial?.url ? faviconFor(initial.url) : "");
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!image && url) {
      setAutoIcon(faviconFor(url));
    }
  }, [url, image]);

  useEffect(() => {
    if (isOpen) {
      setUrl(initial?.url ?? "");
      setTitle(initial?.title ?? "");
      setImage(initial?.image ?? null);
      setAutoIcon(initial?.url ? faviconFor(initial.url) : "");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const submit = () => {
    setError("");
    const normalized = normalizeUrl(url.trim());
    if (!normalized) {
      setError("Valid URL required");
      return;
    }
    try {
      new URL(normalized);
    } catch {
      setError("Invalid URL format");
      return;
    }
    const finalImage = image || autoIcon || faviconFor(normalized) || "";
    const handler = onSave ?? onAdd;
    if (handler) {
      handler(normalized, finalImage, title.trim() || normalized);
    }
    onClose();
    setUrl(initial?.url ?? "");
    setTitle(initial?.title ?? "");
    setImage(initial?.image ?? null);
    setAutoIcon(initial?.url ? faviconFor(initial.url ?? "") : "");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onPaste={handlePaste}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">{titleLabel ?? (onSave ? "Edit Website" : "Add Website")}</h2>
        <label className="block text-xs font-medium mb-1">URL</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
        />
        <label className="block text-xs font-medium mb-1">Title (optional)</label>
        <input
          type="text"
          placeholder="Site title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700"
        />
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              {image || autoIcon ? (
                <img src={image || autoIcon} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-gray-500 text-center px-1">No image</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
              >Select Image</button>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="px-3 py-1 text-xs bg-gray-200 rounded"
                >Remove Image</button>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">Paste an image or we will try a favicon automatically.</p>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm">Cancel</button>
          <button
            type="button"
            onClick={submit}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!url.trim()}
          >{submitLabel ?? (onSave ? "Save" : "Add")}</button>
        </div>
      </div>
    </div>
  );
}
