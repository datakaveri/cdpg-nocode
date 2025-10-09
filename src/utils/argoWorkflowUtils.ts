import { argoWorkflowTemplate } from "../constants/argoWorkflowTemplate";
import {
  ArgoDagTemplate,
  ArgoTemplate,
  ArgoWorkflowTemplate,
  IntermediateNode,
  ArgoContainerTemplate,
} from "../types/common.type";

interface NameValue {
  name: string;
  value: string;
}

function convertToNameValue(obj: Record<string, any>): NameValue[] {
  return Object.entries(obj)
    .filter(([_, value]) => value !== "")
    .map(([name, value]) => ({
      name,
      value: Array.isArray(value) ? JSON.stringify(value) : value.toString(),
    }));
}

function buildCliArgs(params: Record<string, any>): string[] {
  return Object.entries(params)
    .filter(([_, value]) => value !== "")
    .flatMap(([key, value]) => {
      if (
        (key === "observation_names" ||
          key === "condition_names" ||
          key === "columns") &&
        value
      ) {
        return [`--${key}`, value.toString()];
      }
      if (key === "minio_secure") {
        if (value.toString().toLowerCase() === "true") return [`--${key}`];
        return [];
      }
      if (value === "") return [];
      return [`--${key}`, value.toString()];
    });
}

const nodeTypeToTemplate: Record<string, string> = {
  "load-dataset": "download-data",
  correlation: "correlation",
  condition: "condition",
  observation: "observation",
  cluster: "cluster",
  frequency: "frequency",
  range: "range",
  std: "std",
  mode: "mode",
  median: "median",
  mean: "mean",
  abbreviate: "abbreviate",
  plot: "plot",
  join: "join",
  "generate-report": "generate-report",
  "symptom-pattern": "symptom-pattern",
  covariance: "covariance",
  "corr-coefficient": "corr-coefficient",
  prevalence: "prevalence",
};

function mapNodeToTask(node: IntermediateNode) {
  const baseTemplateName = nodeTypeToTemplate[node.info.type] || node.info.type;

  let templateName = `${baseTemplateName}-${node.info.id
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()}`;

  if (node.info.type === "plot" && node.data.operation) {
    templateName = `plot-${node.data.operation}-${node.info.id
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase()}`;
  }

  let taskName = node.info.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  taskName = taskName.replace(/^-+|-+$/g, "");
  if (/^[0-9]/.test(taskName)) taskName = `node-${taskName}`;

  if (node.info.type === "plot" && node.data.operation) {
    taskName = `${taskName}-${node.data.operation}`
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase();
  }

  const task: any = {
    name: taskName,
    template: templateName,
    arguments: {
      parameters: convertToNameValue(node.data),
    },
  };

  if (node.info.depends?.length) {
    task.dependencies = node.info.depends.map((dep) => {
      let cleanDep = dep.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      cleanDep = cleanDep.replace(/^-+|-+$/g, "");
      if (/^[0-9]/.test(cleanDep)) cleanDep = `node-${cleanDep}`;
      return cleanDep;
    });
  }

  return task;
}

function sanitizeK8sName(name: string): string {
  let sanitized = name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  if (!/^[a-z0-9]/.test(sanitized)) sanitized = "wf-" + sanitized;
  if (sanitized.length > 63) sanitized = sanitized.substring(0, 63);
  if (!/[a-z0-9]$/.test(sanitized))
    sanitized = sanitized.substring(0, sanitized.length - 1) + "x";
  return sanitized;
}

function createUniqueTemplate(
  baseTemplate: ArgoContainerTemplate,
  node: IntermediateNode
): ArgoContainerTemplate {
  const newTemplate = JSON.parse(
    JSON.stringify(baseTemplate)
  ) as ArgoContainerTemplate;

  const baseTemplateName = nodeTypeToTemplate[node.info.type] || node.info.type;
  newTemplate.name = `${baseTemplateName}-${node.info.id
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()}`;

  newTemplate.container.args = buildCliArgs(node.data);
  newTemplate.container.volumeMounts = [
    { name: "workflow-data", mountPath: "/app/data" },
  ];

  return newTemplate;
}

function createUniquePlotTemplate(
  baseTemplate: ArgoContainerTemplate,
  node: IntermediateNode
): ArgoContainerTemplate {
  const newTemplate = JSON.parse(
    JSON.stringify(baseTemplate)
  ) as ArgoContainerTemplate;

  newTemplate.name = node.data.operation
    ? `plot-${node.data.operation}-${node.info.id
        .replace(/[^a-z0-9-]/gi, "-")
        .toLowerCase()}`
    : `plot-${node.info.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`;

  newTemplate.container.args = buildCliArgs(node.data);
  newTemplate.container.volumeMounts = [
    { name: "workflow-data", mountPath: "/app/data" },
  ];

  return newTemplate;
}

function isDagTemplate(t: ArgoTemplate): t is ArgoDagTemplate {
  return "dag" in t;
}

export function generateArgoWorkflow(
  name: string,
  nodes: IntermediateNode[]
): ArgoWorkflowTemplate {
  const workflow: ArgoWorkflowTemplate = JSON.parse(
    JSON.stringify(argoWorkflowTemplate)
  );
  const sanitizedName = sanitizeK8sName(name);

  const mainDag = workflow.spec.templates.find((t) => t.name === "main-dag");
  if (!mainDag) throw new Error("Main DAG template not found");

  if (isDagTemplate(mainDag)) {
    mainDag.dag.tasks = nodes.map(mapNodeToTask);
  } else {
    throw new Error("main-dag template is not a DAG template");
  }

  workflow.spec.volumes = [{ name: "workflow-data", emptyDir: {} }];

  const originalTemplates = new Map<string, ArgoContainerTemplate>();
  workflow.spec.templates.forEach((template) => {
    if ("container" in template && template.container) {
      originalTemplates.set(template.name, template as ArgoContainerTemplate);
    }
  });

  const newTemplates: ArgoTemplate[] = [];
  const essentialTemplates = ["main-dag"];
  workflow.spec.templates.forEach((template) => {
    if (essentialTemplates.includes(template.name)) newTemplates.push(template);
  });

  nodes.forEach((node) => {
    const baseTemplateName =
      nodeTypeToTemplate[node.info.type] || node.info.type;
    let baseTemplate = originalTemplates.get(baseTemplateName);

    if (!baseTemplate) {
      console.warn(
        `No base template found for node type: ${node.info.type}, expected template: ${baseTemplateName}`
      );
      return;
    }

    if (node.info.type === "plot") {
      baseTemplate = originalTemplates.get("plot");
      if (baseTemplate)
        newTemplates.push(createUniquePlotTemplate(baseTemplate, node));
    } else {
      newTemplates.push(createUniqueTemplate(baseTemplate, node));
    }
  });

  workflow.spec.templates = newTemplates;

  workflow.metadata.generateName = `icmr-${sanitizedName}-`;
  workflow.metadata.labels!["workflow-name"] = sanitizedName;

  return workflow;
}
