"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { inputClass } from "../ui";

type Props = {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  describedBy?: string;
};

/** List of short strings: Enter or comma adds, × removes; suggestions as quick-add chips. */
export function TagsInput({ id, value, onChange, suggestions = [], describedBy }: Props) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const items = value ?? [];

  const add = (raw: string) => {
    const text = raw.trim();
    if (text && !items.includes(text)) onChange([...items, text]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || (e.key === "," && !e.shiftKey)) {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && items.length) {
      onChange(items.slice(0, -1));
    }
  };

  const remaining = suggestions.filter((s) => !items.includes(s));

  return (
    <div className="flex flex-col gap-2">
      {items.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Valeurs saisies">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-full border border-sage-300 bg-paper py-1 pr-1 pl-3 text-small"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="grid size-7 place-items-center rounded-full hover:bg-mist-200"
                aria-label={`Retirer ${item}`}
              >
                <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder="Saisir puis Entrée"
        aria-describedby={describedBy}
        list={remaining.length ? listId : undefined}
        className={inputClass}
      />
      {remaining.length ? (
        <>
          <datalist id={listId}>
            {remaining.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-1.5">
            {remaining.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className={cn(
                  "min-h-8 rounded-full border border-dashed border-sage-300 px-3 text-[0.85rem] text-pine-700 hover:border-pine-600 hover:text-ink",
                )}
              >
                + {s}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
