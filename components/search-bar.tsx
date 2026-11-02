"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

type SearchBarProps = {
  placeholder?: string;
  defaultValue?: string;
  paramName?: string;
};

export function SearchBar({
  placeholder = "Buscar...",
  defaultValue = "",
  paramName = "q",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }
      params.set("page", "0");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setValue("");
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.delete(paramName);
      params.set("page", "0");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9 h-9"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "..." : "Buscar"}
      </Button>
    </form>
  );
}
