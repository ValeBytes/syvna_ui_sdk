"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { Avatar } from "./display";
import { AlertGlyph, CheckGlyph, CloseGlyph } from "./icons";

/** 1.2 MB, 340 KB, 12 B. */
export function fileSize(n: number): string {
  return n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Picks files from a list: the ones under maxSize, and a sentence for the ones over. */
function sift(picked: FileList | File[], multiple: boolean | undefined, maxSize: number | undefined) {
  let chosen = Array.from(picked);
  if (!multiple) chosen = chosen.slice(0, 1);
  const big = maxSize ? chosen.filter((f) => f.size > maxSize) : [];
  chosen = chosen.filter((f) => !big.includes(f));
  const error = big.length ? `${big.map((f) => f.name).join(", ")} ${big.length === 1 ? "is" : "are"} over ${fileSize(maxSize!)}.` : "";
  return { chosen, error };
}

const UploadArrow = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);

/** A document with its kind on it (PDF, CSV, JPG), coloured by kind. */
export function FileGlyph({ name, className }: { name: string; className?: string }) {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const kind = ["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)
    ? "text-info"
    : ["pdf"].includes(ext)
      ? "text-danger"
      : ["csv", "xls", "xlsx", "numbers"].includes(ext)
        ? "text-success"
        : ["zip", "rar", "7z", "gz"].includes(ext)
          ? "text-warning"
          : "text-ink-3";
  return (
    <span className={cn("relative inline-grid h-9 w-7 flex-none place-items-end", kind, className)} aria-hidden="true">
      <svg viewBox="0 0 28 36" className="absolute inset-0 size-full" fill="none">
        <path d="M2 4a3 3 0 0 1 3-3h13l8 8v22a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 1v6a2 2 0 0 0 2 2h6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="relative mb-1 w-full truncate rounded-[2px] bg-current px-0.5 text-center text-[7px] font-bold uppercase leading-[11px]">
        <span className="text-surface">{ext.slice(0, 4) || "file"}</span>
      </span>
    </span>
  );
}

// ---------- UploadItem ----------

export interface UploadItemProps {
  /** The file's name: "invoices-march.pdf". */
  name: string;
  /** Bytes, shown as "1.2 MB". */
  size?: number;
  /** 0 to 100 while it uploads; leave it off when there's no progress to show. */
  progress?: number;
  /** uploading: a bar. done: a tick. error: what went wrong, and Retry. */
  status?: "uploading" | "done" | "error";
  /** What went wrong, for status error: "The connection dropped." */
  error?: string;
  /** A picture's preview (an object URL), in place of the file icon. */
  preview?: string;
  /** Stops the upload: shown while uploading. */
  onCancel?: () => void;
  /** Tries again: shown when it failed. */
  onRetry?: () => void;
  /** Takes it off the list: shown once it's done or failed. */
  onRemove?: () => void;
  className?: string;
}

/** One file on its way up, or there: its icon, name and size, a progress bar, then done or failed. */
export function UploadItem({ name, size, progress, status = "done", error, preview, onCancel, onRetry, onRemove, className }: UploadItemProps) {
  const btn = cn("grid size-6 flex-none cursor-pointer place-items-center rounded-sm text-ink-3 hover:bg-surface-2 hover:text-ink", focusRing);
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border bg-surface px-3 py-2.5", status === "error" ? "border-danger/40" : "border-line", className)}>
      {preview ? <img src={preview} alt="" className="size-9 flex-none rounded-md object-cover ring-1 ring-line" /> : <FileGlyph name={name} />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-label font-medium text-ink">{name}</span>
          {status === "uploading" && progress !== undefined ? <span className="text-small tabular-nums text-ink-3">{Math.round(progress)}%</span> : null}
        </div>
        {status === "uploading" ? (
          <div className="h-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label={`Uploading ${name}`} aria-valuenow={progress === undefined ? undefined : Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <span
              className={cn("block h-full rounded-full bg-brand transition-[width] duration-300 ease-out", progress === undefined && "w-1/3 animate-[sy-indeterminate_1.2s_ease-in-out_infinite]")}
              style={progress === undefined ? undefined : { width: `${progress}%` }}
            />
          </div>
        ) : (
          <span className={cn("flex items-center gap-1 text-small", status === "error" ? "text-danger" : "text-ink-3")}>
            {status === "error" ? <AlertGlyph size={12} /> : <CheckGlyph size={12} className="text-success" />}
            {status === "error" ? (error ?? "Couldn't upload.") : size !== undefined ? `${fileSize(size)} · Uploaded` : "Uploaded"}
          </span>
        )}
      </div>
      {status === "error" && onRetry ? (
        <button type="button" onClick={onRetry} className={cn("cursor-pointer rounded-sm px-1.5 text-label font-medium text-ink hover:underline", focusRing)}>
          Retry
        </button>
      ) : null}
      {status === "uploading" && onCancel ? (
        <button type="button" aria-label={`Cancel ${name}`} onClick={onCancel} className={btn}>
          <CloseGlyph size={14} />
        </button>
      ) : null}
      {status !== "uploading" && onRemove ? (
        <button type="button" aria-label={`Remove ${name}`} onClick={onRemove} className={btn}>
          <CloseGlyph size={14} />
        </button>
      ) : null}
    </div>
  );
}

// ---------- FileUpload ----------

export interface FileUploadProps {
  /** The kinds of file taken, as the input's accept: "image/*", ".csv,.xlsx". */
  accept?: string;
  /** More than one at a time. */
  multiple?: boolean;
  /** The largest file taken, in bytes; bigger ones are refused with a message. */
  maxSize?: number;
  /** Called with the files chosen or dropped (the ones that passed). */
  onFiles?: (files: File[]) => void;
  /** The files to list under it, when you keep them yourself; for upload progress, render UploadItems instead. */
  files?: File[];
  /** Called when a listed file's remove button is pressed. */
  onRemove?: (file: File) => void;
  /**
   * dropzone: a large area to drop onto; the main way in (an import, product photos).
   * compact: a one-line bar, inside a form. button: just a button, for attaching to a message.
   */
  variant?: "dropzone" | "compact" | "button";
  /** What to drop: "Product photos". */
  label?: React.ReactNode;
  /** What's taken: "PNG or JPG, up to 5 MB". */
  hint?: React.ReactNode;
  /** Shown but can't take files. */
  disabled?: boolean;
  className?: string;
}

/** Drop files or pick them, in three sizes: a drop area, a one-line bar, or a button. Lists what was chosen. */
export function FileUpload({ accept, multiple, maxSize, onFiles, files, onRemove, variant = "dropzone", label, hint, disabled, className }: FileUploadProps) {
  const id = useId();
  const [over, setOver] = useState(false);
  const [own, setOwn] = useState<File[]>([]);
  const [error, setError] = useState("");
  const list = files ?? own;
  const take = (picked: FileList | null) => {
    if (!picked?.length) return;
    const { chosen, error } = sift(picked, multiple, maxSize);
    setError(error);
    if (!chosen.length) return;
    if (files === undefined) setOwn(multiple ? [...own, ...chosen] : chosen);
    onFiles?.(chosen);
  };
  const drop = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      if (!disabled) take(e.dataTransfer.files);
    },
  };
  const input = (
    <input
      id={id}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="sr-only"
      onChange={(e) => {
        take(e.target.files);
        e.target.value = "";
      }}
    />
  );
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {variant === "button" ? (
        <label
          htmlFor={id}
          {...drop}
          className={cn(
            "inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-label font-medium text-ink shadow-1 transition-colors hover:bg-surface-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
            over && "border-brand bg-brand-soft",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9" />
          </svg>
          {label ?? (multiple ? "Attach files" : "Attach a file")}
          {input}
        </label>
      ) : variant === "compact" ? (
        <label
          htmlFor={id}
          {...drop}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
            over ? "border-brand bg-brand-soft" : "border-line-strong hover:border-ink-4 hover:bg-surface-2",
            disabled && "cursor-not-allowed opacity-55",
          )}
        >
          <span className="grid size-8 flex-none place-items-center rounded-md bg-surface-2 text-ink-3">
            <UploadArrow size={16} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label font-medium text-ink">{label ?? "Drop a file or choose one"}</span>
            {hint ? <span className="truncate text-small text-ink-3">{hint}</span> : null}
          </span>
          <span className="flex-none rounded-md border border-line-strong bg-surface px-2.5 py-1 text-small font-medium text-ink shadow-1">Choose</span>
          {input}
        </label>
      ) : (
        <label
          htmlFor={id}
          {...drop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed px-6 py-7 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
            over ? "border-brand bg-brand-soft" : "border-line-strong hover:border-ink-4 hover:bg-surface-2",
            disabled && "cursor-not-allowed opacity-55",
          )}
        >
          <span className={cn("text-ink-3 transition-transform", over && "-translate-y-0.5 text-ink")}>
            <UploadArrow />
          </span>
          <span className="text-label font-medium text-ink">{label ?? "Drop files here"}</span>
          <span className="text-small text-ink-3">
            or <span className="font-medium text-ink underline underline-offset-2">choose {multiple ? "files" : "a file"}</span>
            {hint ? <> · {hint}</> : null}
          </span>
          {input}
        </label>
      )}
      {error ? (
        <p role="alert" className="m-0 text-small text-danger">
          {error}
        </p>
      ) : null}
      {list.length ? (
        <div className="flex flex-col gap-1.5">
          {list.map((f, i) => (
            <UploadItem
              key={`${f.name}-${i}`}
              name={f.name}
              size={f.size}
              onRemove={() => {
                if (files === undefined) setOwn(own.filter((x) => x !== f));
                onRemove?.(f);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------- ImageUpload ----------

export interface ImageUploadProps {
  /** Pictures already there (their URLs), when you keep them yourself. */
  images?: { id: string; src: string; alt?: string }[];
  /** Called with new pictures chosen or dropped. */
  onFiles?: (files: File[]) => void;
  /** Called with a picture's id when its remove button is pressed. */
  onRemove?: (id: string) => void;
  /** The most pictures it holds; the add tile goes once it's full. */
  max?: number;
  /** The largest picture taken, in bytes. */
  maxSize?: number;
  /** Tile shape: square for products, wide (16:9) for banners, tall (3:4) for people and posters. */
  ratio?: "square" | "wide" | "tall";
  /** Marks the first picture "Cover": the one shown in lists. */
  cover?: boolean;
  className?: string;
}

/** A grid of pictures with previews: a product's photos, a gallery. The first is the cover; an add tile takes more. */
export function ImageUpload({ images, onFiles, onRemove, max = 8, maxSize, ratio = "square", cover = true, className }: ImageUploadProps) {
  const id = useId();
  const [own, setOwn] = useState<{ id: string; src: string; alt?: string }[]>([]);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const shown = images ?? own;
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  const take = (picked: FileList | null) => {
    if (!picked?.length) return;
    const room = max - shown.length;
    const { chosen, error } = sift(Array.from(picked).filter((f) => f.type.startsWith("image/")).slice(0, room), true, maxSize);
    setError(error || (picked.length > room ? `Up to ${max} pictures.` : ""));
    if (!chosen.length) return;
    if (images === undefined) {
      const added = chosen.map((f) => {
        const src = URL.createObjectURL(f);
        urls.current.push(src);
        return { id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, src, alt: f.name };
      });
      setOwn([...own, ...added]);
    }
    onFiles?.(chosen);
  };
  const aspect = ratio === "wide" ? "aspect-video" : ratio === "tall" ? "aspect-[3/4]" : "aspect-square";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
        {shown.map((img, i) => (
          <div key={img.id} className={cn("group relative overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line animate-tab-in motion-reduce:animate-none", aspect)}>
            <img src={img.src} alt={img.alt ?? ""} className="size-full object-cover" />
            {cover && i === 0 ? <span className="absolute left-1.5 top-1.5 rounded-sm bg-ink/80 px-1.5 text-caption font-medium leading-[18px] text-ground">Cover</span> : null}
            <button
              type="button"
              aria-label={`Remove ${img.alt ?? "picture"}`}
              onClick={() => {
                if (images === undefined) setOwn(own.filter((x) => x.id !== img.id));
                onRemove?.(img.id);
              }}
              className={cn(
                "absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-ink/75 text-ground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                focusRing,
              )}
            >
              <CloseGlyph size={13} />
            </button>
          </div>
        ))}
        {shown.length < max ? (
          <label
            htmlFor={id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              take(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-ink-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
              aspect,
              over ? "border-brand bg-brand-soft text-ink" : "border-line-strong hover:border-ink-4 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-small font-medium">{shown.length ? "Add more" : "Add pictures"}</span>
            <input
              id={id}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                take(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>
      <p className={cn("m-0 text-small", error ? "text-danger" : "text-ink-3")} role={error ? "alert" : undefined}>
        {error || `${shown.length} of ${max}${maxSize ? ` · up to ${fileSize(maxSize)} each` : ""}`}
      </p>
    </div>
  );
}

// ---------- AvatarUpload ----------

export interface AvatarUploadProps {
  /** Whose picture: the initials shown without one, and the alt text. */
  name: string;
  /** The current picture's URL, when you keep it yourself. */
  src?: string | null;
  /** Called with the new picture chosen. */
  onFile?: (file: File) => void;
  /** Called when Remove is pressed; without it, there's no Remove. */
  onRemove?: () => void;
  /** The largest picture taken, in bytes. */
  maxSize?: number;
  /** A line beside the buttons: "Square, at least 200 px". */
  hint?: React.ReactNode;
  /** circle for people, rounded for businesses and logos. */
  shape?: "circle" | "rounded";
  className?: string;
}

/** A person's or business's picture: the picture (or initials), Change and Remove. */
export function AvatarUpload({ name, src, onFile, onRemove, maxSize, hint, shape = "circle", className }: AvatarUploadProps) {
  const id = useId();
  const [own, setOwn] = useState<string | null>(null);
  const [error, setError] = useState("");
  const picture = src !== undefined ? src : own;
  useEffect(() => () => {
    if (own) URL.revokeObjectURL(own);
  }, [own]);
  const round = shape === "circle" ? "rounded-full" : "rounded-xl";
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <label htmlFor={id} className={cn("group relative size-16 flex-none cursor-pointer overflow-hidden focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus", round)}>
        {picture ? <img src={picture} alt={name} className="size-full object-cover" /> : <Avatar name={name} size="xl" className={cn("size-16 text-title", round)} />}
        <span className="absolute inset-0 grid place-items-center bg-ink/55 text-ground opacity-0 transition-opacity group-hover:opacity-100">
          <UploadArrow size={18} />
        </span>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (maxSize && f.size > maxSize) {
              setError(`That picture is over ${fileSize(maxSize)}.`);
              return;
            }
            setError("");
            if (src === undefined) setOwn(URL.createObjectURL(f));
            onFile?.(f);
          }}
        />
      </label>
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <label
            htmlFor={id}
            className="inline-flex h-7 cursor-pointer items-center rounded-sm border border-line-strong bg-surface px-2.5 text-small font-medium text-ink shadow-1 hover:bg-surface-2"
          >
            {picture ? "Change" : "Upload a picture"}
          </label>
          {picture && (onRemove || src === undefined) ? (
            <button
              type="button"
              onClick={() => {
                if (src === undefined) setOwn(null);
                onRemove?.();
              }}
              className={cn("h-7 cursor-pointer rounded-sm px-2.5 text-small font-medium text-ink-3 hover:bg-surface-2 hover:text-ink", focusRing)}
            >
              Remove
            </button>
          ) : null}
        </div>
        <span className={cn("text-small", error ? "text-danger" : "text-ink-3")}>{error || hint}</span>
      </div>
    </div>
  );
}
