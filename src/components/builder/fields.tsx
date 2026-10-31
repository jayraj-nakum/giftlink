"use client";

import { useRef, useState } from "react";
import { stockPhoto, type Field, type Photo } from "@/templates/types";
import { uploadPhoto } from "./upload";

export type Updater = unknown | ((prev: unknown) => unknown);

const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-coral focus:ring-4 focus:ring-coral/15";

function Label({ field, extra }: { field: Field; extra?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <label htmlFor={`f-${field.key}`} className="text-sm font-semibold text-ink">
        {field.label}
      </label>
      {extra}
    </div>
  );
}

function Help({ field, error }: { field: Field; error?: string }) {
  if (error) return <p className="mt-2 text-sm font-medium text-coral-deep">{error}</p>;
  if (field.hint) return <p className="mt-2 text-sm text-ink-soft">{field.hint}</p>;
  return null;
}

type Names = { to: string; from: string };

/** A suggestion with the names they typed swapped in. */
function fillNames(text: string, names: Names, maxLength: number) {
  return text
    .replaceAll("{to}", names.to || "you")
    .replaceAll("{from}", names.from || "me")
    .slice(0, maxLength);
}

/** Short ideas as tap-to-use chips (names, wishes, notes). */
function IdeaChips({ ideas, onPick }: { ideas: string[]; onPick: (idea: string) => void }) {
  if (ideas.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">✨ Need ideas? Tap one</p>
      <div className="flex flex-wrap gap-2">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onPick(idea)}
            className="rounded-full border border-coral/25 bg-coral/5 px-3.5 py-2 text-left text-sm text-ink transition hover:border-coral hover:bg-coral/10"
          >
            <span className="mr-1 text-coral">+</span>
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Longer ideas (letters, messages), folded away until asked for. */
function IdeaCards({ ideas, onPick }: { ideas: string[]; onPick: (idea: string) => void }) {
  const [open, setOpen] = useState(false);
  if (ideas.length === 0) return null;
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-coral/25 bg-coral/5 px-4 py-2 text-sm font-semibold text-coral-deep transition hover:border-coral"
      >
        ✨ Stuck? See {ideas.length} ideas to start from
      </button>
    );
  }
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        ✨ Tap one to use it, then make it yours
      </p>
      <div className="grid gap-2">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onPick(idea)}
            className="group rounded-2xl border border-line bg-white px-4 py-3 text-left text-sm leading-relaxed text-ink-soft transition hover:border-coral hover:text-ink"
          >
            <span className="line-clamp-3 whitespace-pre-line">{idea}</span>
            <span className="mt-1.5 block text-xs font-semibold text-coral">Use this →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function dateBounds(range: "upcoming" | "past") {
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = new Date();
  if (range === "past") return { min: "1940-01-01", max: fmt(today) };
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 89);
  return { min: fmt(today), max: fmt(max) };
}

export function FieldView({
  field,
  value,
  error,
  onChange,
  onUploading,
  names = { to: "", from: "" },
  stockPhotos,
}: {
  field: Field;
  value: unknown;
  error?: string;
  onChange: (next: Updater) => void;
  onUploading: (delta: number) => void;
  /** The names typed so far, swapped into suggestions */
  names?: Names;
  /** Shown on photo fields: what the gift uses if they add none */
  stockPhotos?: Photo[];
}) {
  const ideas = "suggestions" in field ? (field.suggestions ?? []) : [];
  switch (field.type) {
    case "text":
      return (
        <div>
          <Label field={field} />
          <input
            id={`f-${field.key}`}
            className={inputClass}
            value={(value as string) ?? ""}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
          />
          <Help field={field} error={error} />
          <IdeaChips
            ideas={ideas.map((i) => fillNames(i, names, field.maxLength)).filter((i) => i !== value)}
            onPick={(idea) => onChange(idea)}
          />
        </div>
      );
    case "textarea": {
      const text = (value as string) ?? "";
      return (
        <div>
          <Label
            field={field}
            extra={
              <span className="text-xs text-ink-soft">
                {text.length}/{field.maxLength}
              </span>
            }
          />
          <textarea
            id={`f-${field.key}`}
            className={`${inputClass} resize-y leading-relaxed`}
            rows={field.rows ?? 6}
            value={text}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          <Help field={field} error={error} />
          <IdeaCards
            ideas={ideas.map((i) => fillNames(i, names, field.maxLength))}
            // Never overwrite what they've written: add the idea below it.
            onPick={(idea) => onChange(text.trim() ? `${text.trimEnd()}\n\n${idea}`.slice(0, field.maxLength) : idea)}
          />
        </div>
      );
    }
    case "number":
      return (
        <div>
          <Label field={field} />
          <input
            id={`f-${field.key}`}
            className={inputClass}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Math.trunc(Number(e.target.value)))}
          />
          <Help field={field} error={error} />
        </div>
      );
    case "date":
      return <DateField field={field} value={value as string | undefined} error={error} onChange={onChange} />;
    case "choice":
      return (
        <div>
          <Label field={field} />
          <div role="radiogroup" aria-label={field.label} className="grid gap-2.5">
            {field.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(opt.value)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                    selected ? "border-coral bg-coral/5 ring-4 ring-coral/15" : "border-line bg-white hover:border-ink/30"
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <Help field={field} error={error} />
        </div>
      );
    case "list":
      return (
        <ListField
          field={field}
          value={(value as string[]) ?? []}
          error={error}
          onChange={onChange}
          ideas={ideas.map((i) => fillNames(i, names, field.maxLength))}
        />
      );
    case "photos":
      return (
        <PhotosField
          field={field}
          value={(value as Photo[]) ?? []}
          error={error}
          onChange={onChange}
          onUploading={onUploading}
          stockPhotos={stockPhotos}
        />
      );
  }
}

function DateField({
  field,
  value,
  error,
  onChange,
}: {
  field: Extract<Field, { type: "date" }>;
  value?: string;
  error?: string;
  onChange: (v: Updater) => void;
}) {
  const [bounds] = useState(() => dateBounds(field.range ?? "upcoming"));
  return (
    <div>
      <Label field={field} />
      <div className="flex gap-2">
        <input
          id={`f-${field.key}`}
          type="date"
          className={inputClass}
          min={bounds.min}
          max={bounds.max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
        {value && (
          <button type="button" onClick={() => onChange(undefined)} className="shrink-0 rounded-2xl border border-line px-4 text-sm">
            Clear
          </button>
        )}
      </div>
      <Help field={field} error={error} />
    </div>
  );
}

function ListField({
  field,
  value,
  error,
  onChange,
  ideas,
}: {
  field: Extract<Field, { type: "list" }>;
  value: string[];
  error?: string;
  onChange: (v: Updater) => void;
  ideas: string[];
}) {
  const [draft, setDraft] = useState("");
  const full = value.length >= field.maxItems;
  const add = () => {
    const v = draft.trim();
    if (!v || full) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <Label
        field={field}
        extra={
          <span className="text-xs text-ink-soft">
            {value.length}/{field.maxItems}
          </span>
        }
      />
      <ul className="mb-3 grid gap-2">
        {value.map((item, i) => (
          <li key={`${i}-${item}`} className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
            <span aria-hidden>🎈</span>
            <span className="flex-1 break-words">{item}</span>
            <button
              type="button"
              aria-label={`Remove "${item}"`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-ink-soft hover:text-coral-deep"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {!full && (
        <div className="flex gap-2">
          <input
            id={`f-${field.key}`}
            className={inputClass}
            value={draft}
            maxLength={field.maxLength}
            placeholder={field.itemPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="shrink-0 rounded-2xl bg-ink px-5 font-semibold text-white disabled:opacity-30"
          >
            Add
          </button>
        </div>
      )}
      <Help field={field} error={error} />
      {!full && (
        <IdeaChips
          ideas={ideas.filter((i) => !value.includes(i))}
          onPick={(idea) => onChange((prev: unknown) => [...((prev as string[]) ?? []), idea].slice(0, field.maxItems))}
        />
      )}
    </div>
  );
}

function PhotosField({
  field,
  value,
  error,
  onChange,
  onUploading,
  stockPhotos,
}: {
  field: Extract<Field, { type: "photos" }>;
  value: Photo[];
  error?: string;
  onChange: (v: Updater) => void;
  onUploading: (delta: number) => void;
  stockPhotos?: Photo[];
}) {
  const fallback = (stockPhotos ?? []).slice(0, field.maxPhotos);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ id: string; preview: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const slots = field.maxPhotos - value.length - pending.length;
  const update = (fn: (prev: Photo[]) => Photo[]) => onChange((prev: unknown) => fn((prev as Photo[]) ?? []));

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    const chosen = Array.from(files).slice(0, Math.max(0, slots));
    if (files.length > chosen.length) setUploadError(`Only ${field.maxPhotos} photos fit, so we added the first ${chosen.length}.`);
    const items = chosen.map((file, i) => ({ id: `${Date.now()}-${i}`, preview: URL.createObjectURL(file), file }));
    setPending((p) => [...p, ...items.map(({ id, preview }) => ({ id, preview }))]);
    onUploading(items.length);
    await Promise.all(
      items.map(async (item) => {
        try {
          const uploaded = await uploadPhoto(item.file);
          update((prev) => [...prev, { key: uploaded.key, url: uploaded.url, caption: "" }]);
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setPending((p) => p.filter((x) => x.id !== item.id));
          URL.revokeObjectURL(item.preview);
          onUploading(-1);
        }
      }),
    );
  };

  return (
    <div>
      <Label
        field={field}
        extra={
          <span className="text-xs text-ink-soft">
            {value.length}/{field.maxPhotos}
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((photo, i) => (
          <div key={photo.key} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element -- user upload, already resized */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => update((prev) => prev.filter((p) => p.key !== photo.key))}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-sm text-white"
              >
                ✕
              </button>
              {i > 0 && (
                <button
                  type="button"
                  aria-label="Move earlier"
                  onClick={() =>
                    update((prev) => {
                      const next = [...prev];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      return next;
                    })
                  }
                  className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-sm text-white"
                >
                  ←
                </button>
              )}
            </div>
            <input
              aria-label={`Caption for photo ${i + 1}`}
              className="w-full border-t border-line px-3 py-2.5 text-sm outline-none focus:bg-coral/5"
              placeholder="Caption (optional)"
              maxLength={field.captionMaxLength}
              value={photo.caption ?? ""}
              onChange={(e) =>
                update((prev) => prev.map((p) => (p.key === photo.key ? { ...p, caption: e.target.value } : p)))
              }
            />
          </div>
        ))}
        {pending.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
            <img src={p.preview} alt="" className="h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/60 border-t-coral" />
            </div>
          </div>
        ))}
        {slots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 bg-white/60 text-ink-soft transition hover:border-coral hover:text-coral"
          >
            <span className="text-3xl">＋</span>
            <span className="text-sm font-medium">Add photos</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {uploadError && <p className="mt-2 text-sm font-medium text-coral-deep">{uploadError}</p>}
      <Help field={field} error={error} />
      {value.length === 0 && pending.length === 0 && fallback.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-cream p-4">
          <p className="text-sm font-semibold text-ink">No photos to hand? That&apos;s okay.</p>
          <p className="mt-0.5 text-sm text-ink-soft">If you skip this step, the gift uses these instead:</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {fallback.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element -- small static thumbnails
              <img key={p.key} src={`/${p.key}`} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange(fallback.map((p) => stockPhoto(p.key, p.caption)))}
            className="mt-3 text-sm font-semibold text-coral-deep underline underline-offset-4"
          >
            Use these and edit the captions
          </button>
        </div>
      )}
    </div>
  );
}
