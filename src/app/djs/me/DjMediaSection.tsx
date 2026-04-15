"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
};

const MAX_FILES = 10;
const MAX_SIZE_MB = 50;

export default function DjMediaSection({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File, type: "image" | "video") => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    if (items.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} media items allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/dj-media", { method: "POST", body: fd });
      const j = (await res.json()) as { url?: string; id?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Upload failed");
      if (j.url && j.id) {
        setItems((prev) => [...prev, { id: j.id!, type, url: j.url! }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void upload(file, type);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this media?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/dj-media/${id}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Delete failed");
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Showcase Media</h2>
        <div className="flex items-center gap-2">
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "image")}
          />
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "video")}
          />
          <button
            type="button"
            disabled={uploading || items.length >= MAX_FILES}
            onClick={() => imageRef.current?.click()}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-40"
          >
            + Photo
          </button>
          <button
            type="button"
            disabled={uploading || items.length >= MAX_FILES}
            onClick={() => videoRef.current?.click()}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-40"
          >
            + Video
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {uploading && (
        <p className="mb-3 text-sm text-muted">Uploading…</p>
      )}

      {items.length === 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-surface text-sm text-muted/40"
            >
              {i === 1 ? "Add photos or videos" : ""}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-video rounded-lg border border-border overflow-hidden bg-surface">
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  controls={false}
                  muted
                  playsInline
                  onMouseEnter={(e) => void (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget as HTMLVideoElement;
                    v.pause();
                    v.currentTime = 0;
                  }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-lg border border-danger/60 bg-danger/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger/40 disabled:opacity-50"
                >
                  {deletingId === item.id ? "Removing…" : "Remove"}
                </button>
              </div>
              {item.type === "video" && (
                <div className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  ▶ Video
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-muted">
        {items.length}/{MAX_FILES} items · Max {MAX_SIZE_MB}MB each · Hover to preview videos
      </p>
    </section>
  );
}
