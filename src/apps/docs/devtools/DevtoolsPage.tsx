import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Handle,
  Position,
  getBezierPath,
  useStore,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  type NodeMouseHandler,
} from "reactflow";
import { Package } from "lucide-react";
import "reactflow/dist/base.css";

// ============================================================================
// Exact FunctionIcon from apps/docs/app/[lang]/devtools/function-icon.tsx
// ============================================================================
export function FunctionIcon() {
  return (
    <svg
      height="14"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="14"
      style={{ color: "currentcolor" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 2H9.75H14.25H15V3.5H14.25H9.75H9V2ZM9 12.5H9.75H14.25H15V14H14.25H9.75H9V12.5ZM9.75 7.25H9V8.75H9.75H14.25H15V7.25H14.25H9.75ZM1 12.5H1.75H2.25H3V14H2.25H1.75H1V12.5ZM1.75 2H1V3.5H1.75H2.25H3V2H2.25H1.75ZM1 7.25H1.75H2.25H3V8.75H2.25H1.75H1V7.25ZM5.75 12.5H5V14H5.75H6.25H7V12.5H6.25H5.75ZM5 2H5.75H6.25H7V3.5H6.25H5.75H5V2ZM5.75 7.25H5V8.75H5.75H6.25H7V7.25H6.25H5.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ============================================================================
// Exact TurboNode from apps/docs/app/[lang]/devtools/turbo-node.tsx
// ============================================================================
export interface TurboNodeData {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
}

function TurboNodeComponent({ data }: NodeProps<TurboNodeData>) {
  return (
    <div className="wrapper gradient">
      <div className="inner">
        <div className="body">
          {data.icon && <div className="icon">{data.icon}</div>}
          <div>
            <div className="title">{data.title}</div>
            {data.subtitle && <div className="subtitle">{data.subtitle}</div>}
          </div>
        </div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </div>
  );
}

export const TurboNode = memo(TurboNodeComponent);

// ============================================================================
// Exact floating-edge-utils.ts & TurboEdge from apps/docs/app/[lang]/devtools/
// ============================================================================
export interface InternalNodeType {
  id: string;
  width?: number;
  height?: number;
  positionAbsolute?: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
}

function getNodeCenter(node: InternalNodeType) {
  const width = node.width ?? 0;
  const height = node.height ?? 0;
  const pos = node.positionAbsolute ?? node.position;
  return { x: pos.x + width / 2, y: pos.y + height / 2 };
}

function getNodeIntersection(
  intersectionNode: InternalNodeType,
  targetNode: InternalNodeType
) {
  const width = intersectionNode.width ?? 1;
  const height = intersectionNode.height ?? 1;
  const nodeCenter = getNodeCenter(intersectionNode);
  const targetCenter = getNodeCenter(targetNode);

  const w = width / 2;
  const h = height / 2;
  const dx = targetCenter.x - nodeCenter.x;
  const dy = targetCenter.y - nodeCenter.y;

  if (dx === 0 && dy === 0) {
    return { x: nodeCenter.x, y: nodeCenter.y };
  }
  if (dx === 0) {
    return {
      x: nodeCenter.x,
      y: dy > 0 ? nodeCenter.y + h : nodeCenter.y - h,
    };
  }

  const slope = Math.abs(dy / dx);
  const nodeSlope = h / w;

  let x: number;
  let y: number;

  if (slope <= nodeSlope) {
    x = dx > 0 ? nodeCenter.x + w : nodeCenter.x - w;
    y = nodeCenter.y + (dy * w) / Math.abs(dx);
  } else {
    x = nodeCenter.x + (dx * h) / Math.abs(dy);
    y = dy > 0 ? nodeCenter.y + h : nodeCenter.y - h;
  }

  return { x, y };
}

function getEdgePosition(
  node: InternalNodeType,
  intersectionPoint: { x: number; y: number }
): Position {
  const width = node.width ?? 0;
  const height = node.height ?? 0;
  const pos = node.positionAbsolute ?? node.position;
  const nx = pos.x;
  const ny = pos.y;
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= Math.round(nx + 1)) return Position.Left;
  if (px >= Math.round(nx + width - 1)) return Position.Right;
  if (py <= Math.round(ny + 1)) return Position.Top;
  if (py >= Math.round(ny + height - 1)) return Position.Bottom;
  return Position.Top;
}

export function getEdgeParams(
  source: InternalNodeType,
  target: InternalNodeType
) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);
  const sourcePos = getEdgePosition(source, sourceIntersection);
  const targetPos = getEdgePosition(target, targetIntersection);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos,
    targetPos,
  };
}

function resolveMarker(marker: string | undefined): string | undefined {
  if (typeof marker === "string" && marker && !marker.startsWith("url(")) {
    return `url(#${marker})`;
  }
  return marker;
}

const ARROW_OFFSET = 10;

export function TurboEdge({
  id,
  source,
  target,
  style = {},
  markerStart,
  markerEnd,
}: EdgeProps) {
  const sourceNode = useStore((store) => store.nodeInternals.get(source));
  const targetNode = useStore((store) => store.nodeInternals.get(target));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const {
    sx: initialSx,
    sy: initialSy,
    tx,
    ty,
    sourcePos,
    targetPos,
  } = getEdgeParams(
    sourceNode as unknown as InternalNodeType,
    targetNode as unknown as InternalNodeType
  );

  let sx = initialSx;
  let sy = initialSy;

  const hasArrowMarker =
    typeof markerStart === "string" && markerStart.includes("edge-arrow");
  if (hasArrowMarker) {
    const dx = tx - sx;
    const dy = ty - sy;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      sx += (dx / length) * ARROW_OFFSET;
      sy += (dy / length) * ARROW_OFFSET;
    }
  }

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      style={style as CSSProperties}
      className="react-flow__edge-path"
      d={edgePath}
      markerStart={resolveMarker(markerStart)}
      markerEnd={resolveMarker(markerEnd)}
    />
  );
}

// ============================================================================
// Exact calculateDepths from apps/docs/components/diagram/layout.ts
// ============================================================================
export function calculateDepths(
  nodeIds: Set<string>,
  edges: Edge[]
): Map<string, number> {
  const depths = new Map<string, number>();
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, Edge[]>();

  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    const targets = outgoing.get(edge.source);
    if (targets) {
      targets.push(edge);
    } else {
      outgoing.set(edge.source, [edge]);
    }
  }

  const roots: string[] = [];
  for (const id of nodeIds) {
    if (!incoming.has(id)) {
      roots.push(id);
      depths.set(id, 0);
    }
  }

  const queue = roots;
  let cursor = 0;
  while (cursor < queue.length) {
    const current = queue[cursor];
    cursor += 1;
    const currentDepth = depths.get(current) ?? 0;

    for (const { target } of outgoing.get(current) ?? []) {
      const existing = depths.get(target);
      if (existing === undefined || existing < currentDepth + 1) {
        depths.set(target, currentDepth + 1);
        queue.push(target);
      }
    }
  }

  for (const id of nodeIds) {
    if (!depths.has(id)) {
      depths.set(id, 0);
    }
  }

  return depths;
}

// ============================================================================
// Exact Types & Layout from apps/docs/app/[lang]/devtools/devtools-client.tsx
// ============================================================================
interface PackageNode {
  id: string;
  name: string;
  path: string;
  scripts: Array<string>;
  isRoot: boolean;
}

interface TaskNode {
  id: string;
  package: string;
  task: string;
  script: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphState {
  packageGraph: {
    nodes: Array<PackageNode>;
    edges: Array<GraphEdge>;
  };
  taskGraph: {
    nodes: Array<TaskNode>;
    edges: Array<GraphEdge>;
  };
  repoRoot: string;
  turboVersion: string;
}

type GraphView = "packages" | "tasks";
type SelectionMode = "none" | "direct" | "blocks" | "dependsOn";
type ActiveSelectionMode = Exclude<SelectionMode, "none">;

const nodeTypes = { turbo: TurboNode };
const edgeTypes = { turbo: TurboEdge };
const defaultEdgeOptions = { type: "turbo" };

const NODE_HEIGHT = 70;
const MIN_NODE_WIDTH = 150;
const MAX_NODE_WIDTH = 250;

// Built-in GraphState representing z-ey3eiei/Turborepo v2.11.10 so Devtools renders immediately!
const TURBOREPO_DEFAULT_GRAPH_STATE: GraphState = {
  repoRoot: "/turborepo",
  turboVersion: "2.11.10",
  packageGraph: {
    nodes: [
      { id: "docs", name: "docs", path: "apps/docs", scripts: ["build", "dev", "lint", "check-links"], isRoot: false },
      { id: "examples-agent", name: "examples-agent", path: "apps/factory", scripts: ["build", "dev", "test", "factory"], isRoot: false },
      { id: "create-turbo", name: "create-turbo", path: "packages/create-turbo", scripts: ["build", "test"], isRoot: false },
      { id: "@turbo/codemod", name: "@turbo/codemod", path: "packages/turbo-codemod", scripts: ["build", "test"], isRoot: false },
      { id: "@turbo/gen", name: "@turbo/gen", path: "packages/turbo-gen", scripts: ["build", "test"], isRoot: false },
      { id: "turbo-ignore", name: "turbo-ignore", path: "packages/turbo-ignore", scripts: ["build", "test"], isRoot: false },
      { id: "@turbo/workspaces", name: "@turbo/workspaces", path: "packages/turbo-workspaces", scripts: ["build", "test"], isRoot: false },
      { id: "@turbo/utils", name: "@turbo/utils", path: "packages/turbo-utils", scripts: ["build", "test"], isRoot: false },
      { id: "@turbo/types", name: "@turbo/types", path: "packages/turbo-types", scripts: ["build", "check-types"], isRoot: false },
      { id: "eslint-plugin-turbo", name: "eslint-plugin-turbo", path: "packages/eslint-plugin-turbo", scripts: ["build", "test"], isRoot: false },
      { id: "eslint-config-turbo", name: "eslint-config-turbo", path: "packages/eslint-config-turbo", scripts: ["build"], isRoot: false },
      { id: "@turbo/tsconfig", name: "@turbo/tsconfig", path: "packages/tsconfig", scripts: [], isRoot: false },
      { id: "turborepo-crates", name: "turborepo-crates", path: "crates/turborepo", scripts: ["build", "test", "lint"], isRoot: false },
    ],
    edges: [
      { source: "docs", target: "@turbo/types" },
      { source: "docs", target: "@turbo/utils" },
      { source: "examples-agent", target: "create-turbo" },
      { source: "examples-agent", target: "@turbo/workspaces" },
      { source: "examples-agent", target: "@turbo/types" },
      { source: "create-turbo", target: "@turbo/codemod" },
      { source: "create-turbo", target: "@turbo/workspaces" },
      { source: "create-turbo", target: "@turbo/utils" },
      { source: "@turbo/codemod", target: "@turbo/workspaces" },
      { source: "@turbo/codemod", target: "@turbo/utils" },
      { source: "@turbo/codemod", target: "@turbo/types" },
      { source: "@turbo/gen", target: "@turbo/workspaces" },
      { source: "@turbo/gen", target: "@turbo/utils" },
      { source: "turbo-ignore", target: "@turbo/workspaces" },
      { source: "turbo-ignore", target: "@turbo/utils" },
      { source: "@turbo/workspaces", target: "@turbo/utils" },
      { source: "@turbo/workspaces", target: "@turbo/types" },
      { source: "@turbo/utils", target: "@turbo/types" },
      { source: "@turbo/utils", target: "@turbo/tsconfig" },
      { source: "eslint-config-turbo", target: "eslint-plugin-turbo" },
      { source: "eslint-plugin-turbo", target: "@turbo/utils" },
      { source: "@turbo/types", target: "@turbo/tsconfig" },
      { source: "turborepo-crates", target: "@turbo/types" },
    ],
  },
  taskGraph: {
    nodes: [
      { id: "docs#build", package: "docs", task: "build", script: "next build" },
      { id: "examples-agent#build", package: "examples-agent", task: "build", script: "eve build && next build" },
      { id: "create-turbo#build", package: "create-turbo", task: "build", script: "tsdown src/index.ts" },
      { id: "@turbo/codemod#build", package: "@turbo/codemod", task: "build", script: "tsdown src/cli.ts" },
      { id: "@turbo/gen#build", package: "@turbo/gen", task: "build", script: "tsdown src/cli.ts" },
      { id: "turbo-ignore#build", package: "turbo-ignore", task: "build", script: "tsdown src/index.ts" },
      { id: "@turbo/workspaces#build", package: "@turbo/workspaces", task: "build", script: "tsdown src/index.ts" },
      { id: "@turbo/utils#build", package: "@turbo/utils", task: "build", script: "tsdown src/index.ts" },
      { id: "@turbo/types#build", package: "@turbo/types", task: "build", script: "tsc && node scripts/generate-schema.mjs" },
      { id: "eslint-plugin-turbo#build", package: "eslint-plugin-turbo", task: "build", script: "tsdown lib/index.ts" },
      { id: "turborepo-crates#build", package: "turborepo-crates", task: "build", script: "cargo build --package turbo" },
    ],
    edges: [
      { source: "docs#build", target: "@turbo/types#build" },
      { source: "docs#build", target: "@turbo/utils#build" },
      { source: "examples-agent#build", target: "create-turbo#build" },
      { source: "examples-agent#build", target: "@turbo/workspaces#build" },
      { source: "create-turbo#build", target: "@turbo/codemod#build" },
      { source: "create-turbo#build", target: "@turbo/workspaces#build" },
      { source: "@turbo/codemod#build", target: "@turbo/workspaces#build" },
      { source: "@turbo/gen#build", target: "@turbo/workspaces#build" },
      { source: "turbo-ignore#build", target: "@turbo/workspaces#build" },
      { source: "@turbo/workspaces#build", target: "@turbo/utils#build" },
      { source: "@turbo/utils#build", target: "@turbo/types#build" },
      { source: "eslint-plugin-turbo#build", target: "@turbo/utils#build" },
      { source: "turborepo-crates#build", target: "@turbo/types#build" },
    ],
  },
};

function calculateNodeWidth(data: TurboNodeData): number {
  const charWidth = 8;
  const padding = 50;
  const titleWidth = data.title.length * charWidth + padding;
  return Math.min(MAX_NODE_WIDTH, Math.max(MIN_NODE_WIDTH, titleWidth));
}

function calculateRowWidth(
  nodesInRow: Array<{ node: Node<TurboNodeData>; width: number }>,
  horizontalSpacing: number
): number {
  return nodesInRow.reduce(
    (sum, n) => sum + n.width + horizontalSpacing,
    -horizontalSpacing
  );
}

function splitIntoSubRows(
  nodesAtDepth: Array<{ node: Node<TurboNodeData>; width: number }>,
  maxWidth: number,
  horizontalSpacing: number
): Array<Array<{ node: Node<TurboNodeData>; width: number }>> {
  if (nodesAtDepth.length === 0) return [];

  const subRows: Array<Array<{ node: Node<TurboNodeData>; width: number }>> = [];
  let currentRow: Array<{ node: Node<TurboNodeData>; width: number }> = [];
  let currentRowWidth = 0;

  for (const nodeInfo of nodesAtDepth) {
    const nodeWidthWithSpacing =
      nodeInfo.width + (currentRow.length > 0 ? horizontalSpacing : 0);

    if (
      currentRowWidth + nodeWidthWithSpacing > maxWidth &&
      currentRow.length > 0
    ) {
      subRows.push(currentRow);
      currentRow = [nodeInfo];
      currentRowWidth = nodeInfo.width;
    } else {
      currentRow.push(nodeInfo);
      currentRowWidth += nodeWidthWithSpacing;
    }
  }

  if (currentRow.length > 0) {
    subRows.push(currentRow);
  }

  return subRows;
}

function getLayoutedElements(
  nodes: Array<Node<TurboNodeData>>,
  edges: Array<Edge>
): { nodes: Array<Node>; edges: Array<Edge> } {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const depths = calculateDepths(nodeIds, edges);

  const nodesByDepth = new Map<
    number,
    Array<{ node: Node<TurboNodeData>; width: number }>
  >();
  for (const node of nodes) {
    const depth = depths.get(node.id) ?? 0;
    const existing = nodesByDepth.get(depth);
    const nodeInfo = { node, width: calculateNodeWidth(node.data) };
    if (existing) {
      existing.push(nodeInfo);
    } else {
      nodesByDepth.set(depth, [nodeInfo]);
    }
  }

  const verticalSpacing = NODE_HEIGHT + 48;
  const horizontalSpacing = 80;
  const widthMultiplier = 1.75;
  const minBaselineWidth = 900;

  const sortedDepths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);
  const maxWidthByDepth = new Map<number, number>();
  let nextRowWidth = 0;

  for (let i = sortedDepths.length - 1; i >= 0; i--) {
    const depth = sortedDepths[i];
    const nodesAtDepth = nodesByDepth.get(depth) ?? [];
    const naturalWidth = calculateRowWidth(nodesAtDepth, horizontalSpacing);
    const maxAllowedWidth =
      nextRowWidth > 0 ? nextRowWidth * widthMultiplier : Infinity;

    maxWidthByDepth.set(depth, maxAllowedWidth);

    const effectiveWidth =
      naturalWidth > maxAllowedWidth ? maxAllowedWidth : naturalWidth;
    nextRowWidth = Math.max(effectiveWidth, minBaselineWidth);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let currentY = 0;

  for (const depth of sortedDepths) {
    const nodesAtDepth = nodesByDepth.get(depth) ?? [];
    const naturalWidth = calculateRowWidth(nodesAtDepth, horizontalSpacing);
    const maxAllowedWidth = maxWidthByDepth.get(depth) ?? Infinity;

    const subRows =
      naturalWidth > maxAllowedWidth
        ? splitIntoSubRows(nodesAtDepth, maxAllowedWidth, horizontalSpacing)
        : [nodesAtDepth];

    for (const subRow of subRows) {
      const subRowWidth = calculateRowWidth(subRow, horizontalSpacing);
      let x = -subRowWidth / 2;

      for (const { node, width } of subRow) {
        positions.set(node.id, { x, y: currentY });
        x += width + horizontalSpacing;
      }

      currentY += verticalSpacing;
    }
  }

  return {
    nodes: nodes.map((node) => {
      const pos = positions.get(node.id) ?? { x: 0, y: 0 };
      return {
        ...node,
        position: pos,
      };
    }),
    edges,
  };
}

interface AdjacencyMaps {
  dependentsMap: Map<string, Array<string>>;
  dependenciesMap: Map<string, Array<string>>;
  neighborsMap: Map<string, Set<string>>;
}

function buildAdjacencyMaps(edges: Array<GraphEdge>): AdjacencyMaps {
  const dependentsMap = new Map<string, Array<string>>();
  const dependenciesMap = new Map<string, Array<string>>();
  const neighborsMap = new Map<string, Set<string>>();

  for (const edge of edges) {
    const dependents = dependentsMap.get(edge.target) ?? [];
    dependents.push(edge.source);
    dependentsMap.set(edge.target, dependents);

    const dependencies = dependenciesMap.get(edge.source) ?? [];
    dependencies.push(edge.target);
    dependenciesMap.set(edge.source, dependencies);

    const sourceNeighbors = neighborsMap.get(edge.source) ?? new Set<string>();
    sourceNeighbors.add(edge.target);
    neighborsMap.set(edge.source, sourceNeighbors);

    const targetNeighbors = neighborsMap.get(edge.target) ?? new Set<string>();
    targetNeighbors.add(edge.source);
    neighborsMap.set(edge.target, targetNeighbors);
  }

  return { dependentsMap, dependenciesMap, neighborsMap };
}

function getDirectDependencies(
  nodeId: string,
  adjacencyMaps: AdjacencyMaps
): Set<string> {
  const connected = new Set<string>([nodeId]);
  const neighbors = adjacencyMaps.neighborsMap.get(nodeId);
  if (neighbors) {
    for (const neighbor of neighbors) connected.add(neighbor);
  }
  return connected;
}

function getAffectedNodes(
  nodeId: string,
  adjacencyMaps: AdjacencyMaps
): Set<string> {
  const affected = new Set<string>([nodeId]);
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) continue;
    const dependents = adjacencyMaps.dependentsMap.get(current) ?? [];
    for (const dependent of dependents) {
      if (!affected.has(dependent)) {
        affected.add(dependent);
        queue.push(dependent);
      }
    }
  }
  return affected;
}

function getAffectsNodes(
  nodeId: string,
  adjacencyMaps: AdjacencyMaps
): Set<string> {
  const affects = new Set<string>([nodeId]);
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) continue;
    const dependencies = adjacencyMaps.dependenciesMap.get(current) ?? [];
    for (const dependency of dependencies) {
      if (!affects.has(dependency)) {
        affects.add(dependency);
        queue.push(dependency);
      }
    }
  }
  return affects;
}

function getConnectedEdges(
  visibleNodes: Set<string>,
  edges: Array<GraphEdge>
): Set<string> {
  const connectedEdges = new Set<string>();
  edges.forEach((edge, i) => {
    if (visibleNodes.has(edge.source) && visibleNodes.has(edge.target)) {
      connectedEdges.add(`e${i}`);
    }
  });
  return connectedEdges;
}

function GraphViewToggle({
  view,
  onViewChange,
}: {
  view: GraphView;
  onViewChange: (view: GraphView) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-lg p-1"
      style={{
        backgroundColor: "var(--ds-gray-200)",
        border: "1px solid var(--ds-gray-400)",
      }}
    >
      <button
        type="button"
        onClick={() => onViewChange("packages")}
        className="flex-1 py-1 text-sm rounded-md transition-colors cursor-pointer"
        style={{
          color:
            view === "packages" ? "var(--ds-gray-1000)" : "var(--ds-gray-900)",
          backgroundColor:
            view === "packages" ? "var(--ds-background-100)" : "transparent",
        }}
      >
        Packages
      </button>
      <button
        type="button"
        onClick={() => onViewChange("tasks")}
        className="flex-1 py-1 text-sm rounded-md transition-colors cursor-pointer"
        style={{
          color:
            view === "tasks" ? "var(--ds-gray-1000)" : "var(--ds-gray-900)",
          backgroundColor:
            view === "tasks" ? "var(--ds-background-100)" : "transparent",
        }}
      >
        Tasks
      </button>
    </div>
  );
}

function getModeOptions(view: GraphView): Array<{
  mode: ActiveSelectionMode;
  getLabel: () => { prefix: string; suffix: string };
}> {
  if (view === "tasks") {
    return [
      {
        mode: "direct",
        getLabel: () => ({ prefix: "Direct neighbors of", suffix: "" }),
      },
      {
        mode: "blocks",
        getLabel: () => ({ prefix: "Blocked by", suffix: "" }),
      },
      {
        mode: "dependsOn",
        getLabel: () => ({ prefix: "", suffix: "depends on..." }),
      },
    ];
  }
  return [
    {
      mode: "direct",
      getLabel: () => ({ prefix: "Direct neighbors of", suffix: "" }),
    },
    {
      mode: "blocks",
      getLabel: () => ({ prefix: "", suffix: "affects..." }),
    },
    {
      mode: "dependsOn",
      getLabel: () => ({ prefix: "Packages that affect", suffix: "" }),
    },
  ];
}

function SelectionIndicator({
  selectedNode,
  selectionMode,
  view,
  isOpen,
  onToggleOpen,
  onModeChange,
  onClear,
}: {
  selectedNode: string | null;
  selectionMode: SelectionMode;
  view: GraphView;
  isOpen: boolean;
  onToggleOpen: () => void;
  onModeChange: (mode: ActiveSelectionMode) => void;
  onClear: () => void;
}) {
  if (!selectedNode || selectionMode === "none") return null;

  const modeOptions = getModeOptions(view);
  const currentOption = modeOptions.find((opt) => opt.mode === selectionMode);
  const { prefix, suffix } = currentOption?.getLabel() ?? {
    prefix: "",
    suffix: "",
  };

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="flex items-center gap-2 px-3 py-1 bg-[#2a8af6]/20 text-[#2a8af6] rounded-lg text-sm border border-[#2a8af6]/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-1 hover:opacity-80 cursor-pointer"
          style={{ color: "#2a8af6" }}
        >
          <span>
            {prefix}
            {prefix && " "}
            <strong>{selectedNode}</strong>
            {suffix && " "}
            {suffix}
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClear}
          className="ml-1 hover:opacity-80 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {isOpen && (
        <div
          className="mt-1 py-1 rounded-lg border border-[#2a8af6]/50 backdrop-blur-sm shadow-lg"
          style={{ backgroundColor: "var(--ds-background-200)" }}
        >
          {modeOptions.map((option) => {
            const { prefix: optPrefix, suffix: optSuffix } = option.getLabel();
            const isSelected = option.mode === selectionMode;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => onModeChange(option.mode)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#2a8af6]/20 cursor-pointer"
                style={{
                  color: isSelected ? "#2a8af6" : "var(--ds-gray-1000)",
                }}
              >
                {optPrefix}
                {optPrefix && " "}
                <strong>{selectedNode}</strong>
                {optSuffix && " "}
                {optSuffix}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DevtoolsContent() {
  const { fitBounds, fitView, getNodes } = useReactFlow();

  const [graphState] = useState<GraphState>(TURBOREPO_DEFAULT_GRAPH_STATE);
  const [view, setView] = useState<GraphView>("packages");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDisconnected, setShowDisconnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMinimap, setShowMinimap] = useState(true);

  const [baseNodes, setBaseNodes] = useState<Array<Node>>([]);
  const [baseEdges, setBaseEdges] = useState<Array<Edge>>([]);
  const [rawEdges, setRawEdges] = useState<Array<GraphEdge>>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TurboNodeData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const adjacencyMaps = useMemo(() => buildAdjacencyMaps(rawEdges), [rawEdges]);

  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (!selectedNode || selectionMode === "none") {
      return { highlightedNodes: null, highlightedEdges: null };
    }

    let visibleNodes: Set<string>;
    if (selectionMode === "direct") {
      visibleNodes = getDirectDependencies(selectedNode, adjacencyMaps);
    } else if (selectionMode === "blocks") {
      visibleNodes = getAffectedNodes(selectedNode, adjacencyMaps);
    } else {
      visibleNodes = getAffectsNodes(selectedNode, adjacencyMaps);
    }

    const visibleEdges = getConnectedEdges(visibleNodes, rawEdges);
    return { highlightedNodes: visibleNodes, highlightedEdges: visibleEdges };
  }, [selectedNode, selectionMode, rawEdges, adjacencyMaps]);

  useEffect(() => {
    if (baseNodes.length === 0) return;

    const updatedNodes: Array<Node> = baseNodes.map((node) => {
      const isHighlighted = !highlightedNodes || highlightedNodes.has(node.id);
      const isSelected = node.id === selectedNode;

      return {
        ...node,
        selected: isSelected,
        style: {
          ...(node.style as CSSProperties),
          opacity: isHighlighted ? 1 : 0.2,
        },
      };
    });

    const updatedEdges: Array<Edge> = baseEdges.map((edge) => {
      const isHighlighted = !highlightedEdges || highlightedEdges.has(edge.id);
      const useArrow =
        isHighlighted &&
        (selectionMode === "blocks" || selectionMode === "dependsOn");

      return {
        ...edge,
        markerStart: useArrow ? "edge-arrow" : undefined,
        markerEnd: undefined,
        style: {
          ...(edge.style as CSSProperties),
          opacity: isHighlighted ? 1 : 0.1,
        },
      };
    });

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [
    baseNodes,
    baseEdges,
    highlightedNodes,
    highlightedEdges,
    selectedNode,
    selectionMode,
    setNodes,
    setEdges,
  ]);

  const clearSelection = useCallback(
    (hadFilter: boolean) => {
      setSelectedNode(null);
      setSelectionMode("none");
      if (hadFilter) {
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 50);
      }
    },
    [fitView]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
        return;
      }

      if (selectedNode === node.id) {
        if (selectionMode === "direct") {
          setSelectionMode("blocks");
        } else if (selectionMode === "blocks") {
          setSelectionMode("dependsOn");
        } else if (selectionMode === "dependsOn") {
          clearSelection(true);
        }
      } else {
        setSelectedNode(node.id);
        setSelectionMode("direct");
      }
    },
    [selectedNode, selectionMode, clearSelection, isDropdownOpen]
  );

  const handlePaneClick = useCallback(() => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }
    clearSelection(selectionMode !== "none");
  }, [clearSelection, selectionMode, isDropdownOpen]);

  const getConnectedNodeIds = useCallback((graphEdges: Array<GraphEdge>) => {
    const connected = new Set<string>();
    for (const edge of graphEdges) {
      connected.add(edge.source);
      connected.add(edge.target);
    }
    return connected;
  }, []);

  const updatePackageGraphElements = useCallback(
    (state: GraphState) => {
      const connectedIds = getConnectedNodeIds(state.packageGraph.edges);
      const connectedPackages = state.packageGraph.nodes.filter((pkg) =>
        connectedIds.has(pkg.id)
      );

      const flowNodes: Array<Node<TurboNodeData>> = connectedPackages.map(
        (pkg) => ({
          id: pkg.id,
          type: "turbo",
          data: {
            icon: <Package size={14} />,
            title: pkg.name,
            subtitle: pkg.path || ".",
          },
          position: { x: 0, y: 0 },
        })
      );

      const flowEdges: Array<Edge> = state.packageGraph.edges.map(
        (edge, i) => ({
          id: `e${i}`,
          source: edge.source,
          target: edge.target,
          type: "turbo",
        })
      );

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(flowNodes, flowEdges);

      setBaseNodes(layoutedNodes);
      setBaseEdges(layoutedEdges);
      setRawEdges(state.packageGraph.edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [setNodes, setEdges, getConnectedNodeIds]
  );

  const updateTaskGraphElements = useCallback(
    (state: GraphState) => {
      const connectedIds = getConnectedNodeIds(state.taskGraph.edges);
      const connectedTasks = state.taskGraph.nodes.filter((task) =>
        connectedIds.has(task.id)
      );

      const flowNodes: Array<Node<TurboNodeData>> = connectedTasks.map(
        (task) => ({
          id: task.id,
          type: "turbo",
          data: {
            icon: <FunctionIcon />,
            title: task.task,
            subtitle: task.package,
          },
          position: { x: 0, y: 0 },
        })
      );

      const flowEdges: Array<Edge> = state.taskGraph.edges.map((edge, i) => ({
        id: `e${i}`,
        source: edge.source,
        target: edge.target,
        type: "turbo",
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(flowNodes, flowEdges);

      setBaseNodes(layoutedNodes);
      setBaseEdges(layoutedEdges);
      setRawEdges(state.taskGraph.edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [setNodes, setEdges, getConnectedNodeIds]
  );

  const updateFlowElements = useCallback(
    (state: GraphState, currentView: GraphView) => {
      clearSelection(false);
      if (currentView === "packages") {
        updatePackageGraphElements(state);
      } else {
        updateTaskGraphElements(state);
      }
    },
    [updatePackageGraphElements, updateTaskGraphElements, clearSelection]
  );

  const handleViewChange = useCallback(
    (newView: GraphView) => {
      setView(newView);
      updateFlowElements(graphState, newView);
    },
    [graphState, updateFlowElements]
  );

  useEffect(() => {
    updateFlowElements(graphState, view);
  }, [graphState, view, updateFlowElements]);

  const nodeLabel = view === "packages" ? "packages" : "tasks";

  const connectedNodeIds = useMemo(() => {
    const connected = new Set<string>();
    for (const edge of rawEdges) {
      connected.add(edge.source);
      connected.add(edge.target);
    }
    return connected;
  }, [rawEdges]);

  const { connectedNodes, disconnectedNodes } = useMemo(() => {
    const allNodes =
      view === "packages"
        ? graphState.packageGraph.nodes.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            subtitle: pkg.path,
          }))
        : graphState.taskGraph.nodes.map((task) => ({
            id: task.id,
            name: task.id,
            subtitle: task.script,
          }));

    const connected: typeof allNodes = [];
    const disconnected: typeof allNodes = [];

    for (const node of allNodes) {
      if (connectedNodeIds.has(node.id)) {
        connected.push(node);
      } else {
        disconnected.push(node);
      }
    }

    const sortFn = (a: (typeof allNodes)[0], b: (typeof allNodes)[0]) =>
      a.name.localeCompare(b.name) || a.subtitle.localeCompare(b.subtitle);

    return {
      connectedNodes: connected.sort(sortFn),
      disconnectedNodes: disconnected.sort(sortFn),
    };
  }, [graphState, view, connectedNodeIds]);

  const filteredConnectedNodes = useMemo(() => {
    let filtered = connectedNodes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = connectedNodes.filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.subtitle.toLowerCase().includes(query)
      );
    }

    if (selectedNode || highlightedNodes) {
      return [...filtered].sort((a, b) => {
        if (a.id === selectedNode) return -1;
        if (b.id === selectedNode) return 1;
        if (highlightedNodes) {
          const aHighlighted = highlightedNodes.has(a.id);
          const bHighlighted = highlightedNodes.has(b.id);
          if (aHighlighted && !bHighlighted) return -1;
          if (!aHighlighted && bHighlighted) return 1;
        }
        return (
          a.name.localeCompare(b.name) || a.subtitle.localeCompare(b.subtitle)
        );
      });
    }
    return filtered;
  }, [connectedNodes, searchQuery, highlightedNodes, selectedNode]);

  const filteredDisconnectedNodes = useMemo(() => {
    if (!searchQuery.trim()) return disconnectedNodes;
    const query = searchQuery.toLowerCase();
    return disconnectedNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.subtitle.toLowerCase().includes(query)
    );
  }, [disconnectedNodes, searchQuery]);

  const nodeCount = connectedNodes.length + disconnectedNodes.length;

  const focusOnNodes = useCallback(
    (nodeIds: Set<string>) => {
      const flowNodes = getNodes() as Array<Node<TurboNodeData>>;
      const targetNodes = flowNodes.filter((n) => nodeIds.has(n.id));
      if (targetNodes.length === 0) return;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const node of targetNodes) {
        const nodeWidth = calculateNodeWidth(node.data);
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + nodeWidth);
        maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
      }

      const padding = 50;
      fitBounds(
        {
          x: minX - padding,
          y: minY - padding,
          width: maxX - minX + padding * 2,
          height: maxY - minY + padding * 2,
        },
        { duration: 0 }
      );
    },
    [fitBounds, getNodes]
  );

  const handleModeChange = useCallback(
    (mode: ActiveSelectionMode) => {
      if (!selectedNode) return;
      setSelectionMode(mode);
      setIsDropdownOpen(false);

      let nodesToFocus: Set<string>;
      if (mode === "direct") {
        nodesToFocus = getDirectDependencies(selectedNode, adjacencyMaps);
      } else if (mode === "blocks") {
        nodesToFocus = getAffectedNodes(selectedNode, adjacencyMaps);
      } else {
        nodesToFocus = getAffectsNodes(selectedNode, adjacencyMaps);
      }
      focusOnNodes(nodesToFocus);
    },
    [selectedNode, adjacencyMaps, focusOnNodes]
  );

  const handleSidebarNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNode === nodeId) {
        if (selectionMode === "direct") {
          setSelectionMode("blocks");
          focusOnNodes(getAffectedNodes(nodeId, adjacencyMaps));
        } else if (selectionMode === "blocks") {
          setSelectionMode("dependsOn");
          focusOnNodes(getAffectsNodes(nodeId, adjacencyMaps));
        } else if (selectionMode === "dependsOn") {
          clearSelection(true);
        }
      } else {
        setSelectedNode(nodeId);
        setSelectionMode("direct");
        focusOnNodes(getDirectDependencies(nodeId, adjacencyMaps));
      }
    },
    [selectedNode, selectionMode, adjacencyMaps, focusOnNodes, clearSelection]
  );

  return (
    <div
      className="flex h-[calc(100vh-57px)] w-full relative"
      style={{ backgroundColor: "var(--ds-background-100)" }}
    >
      <aside
        className="w-64 flex flex-col shrink-0"
        style={{
          borderRight: "1px solid var(--ds-gray-400)",
          backgroundColor: "var(--ds-background-100)",
        }}
      >
        <div
          className="px-3 pt-4 pb-3"
          style={{ borderBottom: "1px solid var(--ds-gray-400)" }}
        >
          <GraphViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        <div
          className="px-3 py-2"
          style={{ borderBottom: "1px solid var(--ds-gray-400)" }}
        >
          <input
            type="text"
            placeholder={`Search ${nodeLabel}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded focus:outline-none placeholder:text-[var(--ds-gray-900)]"
            style={{
              backgroundColor: "var(--ds-gray-200)",
              border: "1px solid var(--ds-gray-400)",
              color: "var(--ds-gray-1000)",
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConnectedNodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isHighlighted =
              !highlightedNodes || highlightedNodes.has(node.id);

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleSidebarNodeClick(node.id)}
                className={`w-full text-left px-3 py-2 transition-colors cursor-pointer ${
                  !isHighlighted && !isSelected ? "opacity-40" : ""
                }`}
                style={{
                  borderBottom: "1px solid var(--ds-gray-400)",
                  backgroundColor: isSelected
                    ? "var(--ds-gray-200)"
                    : "transparent",
                }}
              >
                <div
                  className="text-sm truncate font-mono"
                  style={{ color: "var(--ds-gray-1000)" }}
                >
                  {node.name}
                </div>
                <div
                  className="text-xs truncate font-mono"
                  style={{ color: "var(--ds-gray-900)" }}
                >
                  {node.subtitle}
                </div>
              </button>
            );
          })}

          {filteredDisconnectedNodes.length > 0 && (
            <div style={{ borderTop: "1px solid var(--ds-gray-400)" }}>
              <button
                type="button"
                onClick={() => setShowDisconnected(!showDisconnected)}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer"
                style={{ color: "var(--ds-gray-900)" }}
              >
                <span>
                  {filteredDisconnectedNodes.length} {nodeLabel} with no
                  dependencies
                </span>
                <span>{showDisconnected ? "−" : "+"}</span>
              </button>
              {showDisconnected && (
                <div style={{ backgroundColor: "var(--ds-gray-100)" }}>
                  {filteredDisconnectedNodes.map((node) => (
                    <div
                      key={node.id}
                      className="px-3 py-1.5"
                      style={{ borderBottom: "1px solid var(--ds-gray-400)" }}
                    >
                      <div
                        className="text-xs truncate"
                        style={{ color: "var(--ds-gray-1000)" }}
                      >
                        {node.name}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: "var(--ds-gray-900)" }}
                      >
                        {node.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="px-3 py-2.5 space-y-1 text-xs font-mono"
          style={{
            borderTop: "1px solid var(--ds-gray-400)",
            color: "var(--ds-gray-900)",
          }}
        >
          <div>
            {nodeCount} {nodeLabel} · turbo v{graphState.turboVersion}
          </div>
          <div>Connected: z-ey3eiei/Turborepo</div>
        </div>
      </aside>

      <div className="flex-1 relative min-h-0">
        <SelectionIndicator
          selectedNode={selectedNode}
          selectionMode={selectionMode}
          view={view}
          isOpen={isDropdownOpen}
          onToggleOpen={() => setIsDropdownOpen(!isDropdownOpen)}
          onModeChange={handleModeChange}
          onClear={() => {
            clearSelection(true);
            setIsDropdownOpen(false);
          }}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          className="turbo-flow"
        >
          <Controls showInteractive={false}>
            <button
              type="button"
              onClick={() => setShowMinimap(!showMinimap)}
              className="react-flow__controls-button cursor-pointer"
              title={showMinimap ? "Hide minimap" : "Show minimap"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="12" y="12" width="7" height="7" rx="1" />
              </svg>
            </button>
          </Controls>
          {showMinimap && <MiniMap pannable zoomable nodeStrokeWidth={3} />}
          <svg>
            <defs>
              <linearGradient
                id="edge-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ae53ba" />
                <stop offset="100%" stopColor="#2a8af6" />
              </linearGradient>

              <marker
                id="edge-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth="12"
                markerHeight="12"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#2a8af6"
                  fillOpacity="0.9"
                />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
      </div>
    </div>
  );
}

export function DevtoolsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-[600px]"
          style={{ backgroundColor: "var(--ds-background-100)" }}
        >
          <div style={{ color: "var(--ds-gray-900)" }}>Loading...</div>
        </div>
      }
    >
      <ReactFlowProvider>
        <DevtoolsContent />
      </ReactFlowProvider>
    </Suspense>
  );
}
