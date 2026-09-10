"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";

/**
 * Search field for the `/recherche` page.
 *
 * Submitting updates `?q=` (so results stay linkable and shareable); clearing
 * the field removes the parameter entirely, which restores the complete
 * product list instead of leaving an empty result set on screen.
 */
export function SearchField({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("q") ?? "";
  const [value, setValue] = useState(fromUrl);
  // Keep the field in step with the URL (back/forward navigation, or the
  // suggestions overlay pushing a brand-new `q`) by adjusting the state while
  // rendering — cheaper and safer than an effect that re-renders a second time.
  const [syncedWith, setSyncedWith] = useState(fromUrl);
  if (syncedWith !== fromUrl) {
    setSyncedWith(fromUrl);
    setValue(fromUrl);
  }

  const submit = (next: string) => {
    const q = next.trim();
    router.push(q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
  };

  const clear = () => {
    setValue("");
    if (fromUrl) router.push("/recherche");
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(value); }}
      role="search"
      className="flex w-full items-center gap-2 border border-paper/25 bg-paper/5 px-4"
    >
      <SearchIcon size={18} className="shrink-0 text-champagne-3" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        type="search"
        name="q"
        placeholder="Rechercher un produit, une marque, un besoin…"
        aria-label="Rechercher un produit"
        autoComplete="off"
        className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-paper placeholder:text-paper/45 focus:outline-none"
      />
      {value.length > 0 && (
        <button type="button" onClick={clear} aria-label="Effacer la recherche" className="flex h-11 w-11 shrink-0 items-center justify-center text-paper/70 transition-colors hover:text-paper">
          <CloseIcon size={16} />
        </button>
      )}
      <button type="submit" className="btn-light min-h-11 shrink-0 px-5 text-[11px]">Rechercher</button>
    </form>
  );
}
