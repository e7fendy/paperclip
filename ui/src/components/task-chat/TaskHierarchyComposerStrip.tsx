import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IssueLink } from "@/components/IssueLink";
import { StatusIcon } from "@/components/StatusIcon";
import { cn } from "@/lib/utils";
import { createIssueDetailPath } from "@/lib/issue-detail-navigation";

export interface TaskHierarchyStripItem {
  id: string;
  identifier?: string | null;
  title: string;
  status?: string | null;
}

/**
 * Compact one-line parent/subtask strip rendered above the task chat composer,
 * with a toggle to expand and click through all subtasks.
 */
export function TaskHierarchyComposerStrip({
  parentIssue,
  childIssues,
  linkState,
}: {
  parentIssue?: TaskHierarchyStripItem | null;
  childIssues: TaskHierarchyStripItem[];
  linkState?: unknown;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!parentIssue && childIssues.length === 0) return null;

  const doneCount = childIssues.filter(
    (child) => child.status === "done" || child.status === "cancelled",
  ).length;
  const previewChild =
    childIssues.find(
      (child) => child.status !== "done" && child.status !== "cancelled",
    ) ?? childIssues[0];

  const primaryTask = parentIssue ?? previewChild;

  return (
    <div
      data-testid="task-hierarchy-composer-strip"
      className="rounded-lg border border-border/80 bg-card/95 px-2.5 py-1.5 text-xs shadow-xs"
    >
      <div className="flex min-w-0 items-center gap-2">
        {primaryTask ? (
          <IssueLink
            to={createIssueDetailPath(primaryTask.identifier ?? primaryTask.id)}
            state={linkState}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="shrink-0 font-medium text-muted-foreground">
              {parentIssue ? "Parent" : `Subtasks ${doneCount}/${childIssues.length}`}
            </span>
            {primaryTask.status ? (
              <StatusIcon status={primaryTask.status} className="shrink-0" />
            ) : null}
            {primaryTask.identifier ? (
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {primaryTask.identifier}
              </span>
            ) : null}
            <span className="min-w-0 truncate text-foreground">
              {primaryTask.title}
            </span>
          </IssueLink>
        ) : null}
        {childIssues.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide subtasks" : "Show all subtasks"}
            className="ml-auto flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span>
              {parentIssue
                ? `${childIssues.length} subtask${childIssues.length === 1 ? "" : "s"}`
                : expanded
                  ? "Collapse"
                  : "All"}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        ) : null}
      </div>

      {expanded && childIssues.length > 0 ? (
        <div className="mt-1.5 max-h-44 space-y-0.5 overflow-y-auto border-t border-border/60 pt-1.5">
          {childIssues.map((child) => (
            <IssueLink
              key={child.id}
              to={createIssueDetailPath(child.identifier ?? child.id)}
              state={linkState}
              className="flex min-w-0 items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-colors hover:bg-accent/60"
            >
              {child.status ? (
                <StatusIcon status={child.status} className="shrink-0" />
              ) : null}
              {child.identifier ? (
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {child.identifier}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate text-foreground">
                {child.title}
              </span>
            </IssueLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
