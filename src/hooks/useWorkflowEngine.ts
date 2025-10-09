import { useState } from "react";
import { toast } from "react-toastify";
import { IcmrArgoClient } from "../utils/IcmrArgoClient";
import { generateArgoWorkflow } from "../utils/argoWorkflowUtils";
import { sleep } from "../utils";
import {env} from "../environments/environments"
import { BaseNodeTemplate, IntermediateNode } from "../types/common.type";
import { Edge, Node } from "@xyflow/react";

export default function useWorkflowEngine(nodes: Node<BaseNodeTemplate>[], edges:Edge[]) {
  const [isRunning, setIsRunning] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<null|string>(null);

  const handleDebugConsole = () => setShowDebugConsole((p) => !p);

  const findRootNodes = () => {
    const hasIncomingEdge = new Set(edges.map((e) => e.target));
    return nodes.filter((n) => !hasIncomingEdge.has(n.id));
  };

  const levelTraverse = (rootIds:string[]) :string[] => {
    const queue = [...rootIds];
    const graph = new Map<string, string[]>(nodes.map((n) => [n.id, [] as string[]]));
     edges.forEach((e) => {
       if (e.source && e.target) {
         graph.get(e.source)?.push(e.target);
       }
     });
    const result: string[] = [];
    const visited = new Set<string>();

    while (queue.length) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        result.push(current);
        queue.push(...(graph.get(current) ?? []));
      }
    }

    return result;
  };



  const createIntermediateState = (
    nodeIds: string[]
  ): IntermediateNode[] | null => {
    if (!nodeIds.length) return null;

    const intermediate: IntermediateNode[] = nodeIds
      .map((id) => {
        const node = nodes.find((n) => n.id === id);
        if (!node) return null; // safeguard

        const depends = edges
          .filter((e) => e.target === id && e.source)
          .map((e) => e.source as string);

        const filteredParams = Object.fromEntries(
          Object.entries(node.data.params || {}).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null
          )
        );

        return {
          data: filteredParams as Record<string, string>,
          info: {
            id,
            depends,
            type: node.data.type,
          },
        };
      })
      .filter((n): n is IntermediateNode => n !== null);

    return intermediate;
  };


  const handleDeploy = async () => {
    try {
      setIsRunning(true);
      setDebugLogs(["Starting deployment..."]);
      setShowDebugConsole(true);

      const roots: Node<BaseNodeTemplate>[] = findRootNodes();
      if (!roots.length) throw new Error("No root nodes found.");

      const rootIds = roots.map((r) => r.id)
      const order = levelTraverse(rootIds);
      const state = createIntermediateState(order);
      const client = new IcmrArgoClient(env.argoUrl, env.argoToken);

      setDebugLogs((p) => [...p, "Testing Argo connection..."]);
      await client.testConnection();

      const workflowName = `icmr-${Date.now()}`;
      if(state === null) throw new Error("Handle deploy function state is null")
      const wf = generateArgoWorkflow(workflowName, state);
      await client.submitWorkflow(wf);
      toast.success("Workflow submitted");
      await monitor(client, workflowName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Deployment failed: ${errorMessage}`);
      setDebugLogs((p) => [...p, `✗ Error: ${errorMessage}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const monitor = async (client: IcmrArgoClient, name:string) => {
    const timeout = 300000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const status = await client.getStatus(name);
      const phase = status?.status?.phase || "Unknown";
      setWorkflowStatus(phase);
      setDebugLogs((p) => [...p, `Status: ${phase}`]);
      if (/succeeded/i.test(phase)) return toast.success("Workflow succeeded!");
      if (/failed/i.test(phase)) throw new Error("Workflow failed");
      await sleep(5000);
    }
    throw new Error("Monitoring timed out");
  };

  return {
    debugLogs,
    showDebugConsole,
    handleDebugConsole,
    workflowStatus,
    handleDeploy,
    isRunning,
  };
}
