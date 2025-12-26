"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
  size?: 'default' | 'post'; // 'default' = h-6 (fora do post), 'post' = h-7 (dentro do post)
}

export function TagFilter({ tags, selectedTag, tagCounts, size = 'default' }: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams();
    if (tag !== "Todos") {
      params.set("tag", tag);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const DesktopTagFilter = () => {
    const heightClass = size === 'post' ? 'h-7' : 'h-6';
    const badgeHeightClass = size === 'post' ? 'h-5' : 'h-4';
    
    return (
      <div className="hidden md:flex flex-wrap gap-1.5 justify-center mx-auto">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`${heightClass} flex items-center px-2.5 rounded-md cursor-pointer border text-xs transition-colors ${
              selectedTag === tag
                ? "border-border/60 bg-muted/50 text-foreground"
                : "border-border/40 bg-transparent text-muted-foreground hover:bg-muted/30 hover:border-border/50"
            }`}
          >
            <span>{tag}</span>
            {tagCounts?.[tag] && (
              <span
                className={`ml-1.5 text-[10px] border rounded ${badgeHeightClass} min-w-4 font-medium flex items-center justify-center ${
                  selectedTag === tag
                    ? "border-border/60 bg-background/50 text-foreground"
                    : "border-border/40 text-muted-foreground"
                }`}
              >
                {tagCounts[tag]}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const MobileTagFilter = () => (
    <Drawer>
      <DrawerTrigger className="md:hidden w-full flex items-center justify-between px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
        <span className="capitalize text-sm font-medium">{selectedTag}</span>
        <ChevronDown className="h-4 w-4" />
      </DrawerTrigger>

      <DrawerContent className="md:hidden">
        <DrawerHeader>
          <h3 className="font-semibold text-sm">Selecionar Categoria</h3>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors"
              >
                <span
                  className={`w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors ${
                    selectedTag === tag
                      ? "underline underline-offset-4 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {tag}
                </span>
                {tagCounts?.[tag] && (
                  <span className="flex-shrink-0 ml-2 border border-border rounded-md h-6 min-w-6 flex items-center justify-center">
                    {tagCounts[tag]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <DesktopTagFilter />
      <MobileTagFilter />
    </>
  );
}

