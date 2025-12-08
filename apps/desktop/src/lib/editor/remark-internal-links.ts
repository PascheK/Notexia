import { visit } from "unist-util-visit";

type RemarkNode = {
  type: string;
  value?: string;
  url?: string;
  data?: Record<string, unknown>;
  children?: RemarkNode[];
};

type RemarkParent = RemarkNode & { children: RemarkNode[] };

export const remarkInternalLinks = () => {
  return (tree: any) => {
    visit(tree as RemarkNode, "text", (node: any, index: number | null, parent: RemarkParent | null) => {
      if (!parent || typeof index !== "number") return;
      if (typeof node.value !== "string") return;
      const value = node.value;
      if (!value.includes("[[")) return;

      const parts = value.split(/\[\[([^\]]+)\]\]/g);
      if (parts.length < 2) return;

      const nextChildren: RemarkNode[] = parts.flatMap((part: string, idx: number): RemarkNode[] => {
        if (idx % 2 === 0) {
          return part ? [{ type: "text", value: part } satisfies RemarkNode] : [];
        }
        const target = part.trim();
        return [
          {
            type: "link",
            url: `internal:${encodeURIComponent(target)}`,
            data: { internal: true, noteTitle: target },
            children: [{ type: "text", value: target }]
          } satisfies RemarkNode
        ];
      });

      (parent.children as RemarkNode[]).splice(index, 1, ...nextChildren);
      return index + nextChildren.length;
    });
  };
};
