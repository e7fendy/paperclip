import { useCallback, useEffect, useState } from "react";
import { ExternalLink, MoreHorizontal, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOptionalToastActions } from "../context/ToastContext";
import { CHROMELESS_DISPLAY_MODES, isChromelessDisplayMode } from "../lib/pwa-display-mode";
import { copyTextToClipboard } from "../lib/clipboard";

export function StandaloneBrowserControls({ mobile }: { mobile: boolean }) {
  const [chromeless, setChromeless] = useState(() =>
    typeof window !== "undefined" && mobile ? isChromelessDisplayMode() : false,
  );
  const toastActions = useOptionalToastActions();

  useEffect(() => {
    if (!mobile || typeof window === "undefined") {
      setChromeless(false);
      return;
    }

    const update = () => setChromeless(isChromelessDisplayMode());

    update();
    if (typeof window.matchMedia !== "function") return;

    const mediaQueries = CHROMELESS_DISPLAY_MODES.map((mode) => window.matchMedia(`(display-mode: ${mode})`));
    if (mediaQueries.every((media) => typeof media.addEventListener === "function")) {
      mediaQueries.forEach((media) => media.addEventListener("change", update));
      return () => mediaQueries.forEach((media) => media.removeEventListener("change", update));
    }

    mediaQueries.forEach((media) => media.addListener(update));
    return () => mediaQueries.forEach((media) => media.removeListener(update));
  }, [mobile]);

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  const share = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title || "Paperclip", url });
        return;
      }
      await copyTextToClipboard(url);
      toastActions?.pushToast({ title: "Link copied", tone: "success" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toastActions?.pushToast({ title: "Share failed", body: "Try opening the page in your browser.", tone: "error" });
    }
  }, [toastActions]);

  const openInBrowser = useCallback(() => {
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  }, []);

  if (!mobile || !chromeless) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Browser actions"
          title="Browser actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Refresh</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void share()}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={openInBrowser}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Open in Browser</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
