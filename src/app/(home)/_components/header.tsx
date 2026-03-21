import { CommandSearch } from "@/components/command-search";
import { GitHubButton } from "@/components/github-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  return (
    <header className={cn("w-full p-4 container", className)}>
      <nav className="flex size-full items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2 h-4.5">
          <CommandSearch />
          <Separator orientation="vertical" className="hidden md:block" />
          <GitHubButton />
          <Separator orientation="vertical" className="hidden md:block" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
