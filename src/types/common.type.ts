import { dynamicIconImports } from "lucide-react/dynamic";

type IconName = keyof typeof dynamicIconImports;

export type BaseNodeTemplate = {
  label: string;
  icon: IconName;
  color: string;
  type: string;
  description: string;
  params?: Record<string, string>;
};

export type CustomNodeData = {
  id: string;
  position: { x: number; y: number };
  data: BaseNodeTemplate;
  type: string;
};

export type IntermediateNode = {
  data: Record<string, string>;
  info: {
    id: string;
    depends: string[];
    type: string;
  };
};

export type ArgoWorkflowTemplate = {
  apiVersion: "argoproj.io/v1alpha1";
  kind: "Workflow";
  metadata: {
    generateName: string;
    namespace: string;
    labels?: Record<string, string>;
  };
  spec: {
    entrypoint: string;
    ttlStrategy?: {
      secondsAfterCompletion?: number;
      secondsAfterSuccess?: number;
      secondsAfterFailure?: number;
    };
    templates: ArgoTemplate[];
    volumes?:Record<string,any>[]
  };
};

export type ArgoTemplate = ArgoContainerTemplate | ArgoDagTemplate;

export type ArgoContainerTemplate = {
  name: string;
  inputs?: {
    parameters?: { name: string; value?: string }[];
  };
  container: {
    image: string;
    command?: string[];
    args?: string[];
    resources?: {
      limits?: { memory?: string; cpu?: string };
      requests?: { memory?: string; cpu?: string };
    };
    env?: { name: string; value: string }[];
    volumeMounts?: Record<string, string>[];
  };
};

export type ArgoDagTemplate = {
  name: string;
  dag: {
    tasks: ArgoDagTask[];
  };
};

export type ArgoDagTask = {
  name: string;
  template: string;
  dependencies?: string[];
  arguments?: {
    parameters?: { name: string; value: string }[];
  };
};
