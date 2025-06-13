function convertToNameValue(obj) {
  return Object.entries(obj)
    .filter(([_, value]) => value !== "") 
    .map(([name, value]) => ({
      name,
      value: Array.isArray(value) ? JSON.stringify(value) : value.toString(),
    }));
}

function buildCliArgs(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== "") 
    .flatMap(([key, value]) => {
      // Special handling for observation/condition names
      if ((key === 'observation_names' || key === 'condition_names' || key === 'columns') && value) {
        return [`--${key}`, value.toString()];
      }
      // Handle boolean flag for minio_secure
      if (key === 'minio_secure') {
        if (value.toString().toLowerCase() === 'true') {
          return [`--${key}`];
        }
        return [];
      }
      // Skip empty optional parameters
      if (value === "") return [];
      return [`--${key}`, value.toString()];
    });
}

const nodeTypeToTemplate = {
  'load-dataset': 'download-data',
  'plot-observation-plot': 'plot-observation-data',
  'plot-condition-plot': 'plot-condition-data',
  'abbreviate-columns': 'abbreviate-columns',
  'plot-correlation': 'plot-correlation',
  'plot-histograms': 'plot-histograms',
  'plot-epi-curve': 'plot-epi-curve',
  'generate-report': 'generate-report'
};

const argoWorkflowTemplate = {
  apiVersion: "argoproj.io/v1alpha1",
  kind: "Workflow",
  metadata: {
    generateName: "icmr-",
    namespace: "argo",
    labels: {
      "workflows.argoproj.io/archive-strategy": "true"
    }
  },
  spec: {
    entrypoint: "main-dag",
    ttlStrategy: { secondsAfterCompletion: 86400 },
    templates: [
      {
        name: "download-data",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "download-data"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "plot-observation-data",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "plot-observation-data"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "plot-condition-data",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "plot-condition-data"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "abbreviate-columns",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "abbreviate-columns"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "plot-correlation",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "plot-correlation"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "plot-histograms",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "plot-histograms"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "plot-epi-curve",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "plot-epi-curve"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "generate-report",
        inputs: { parameters: [] },
        container: {
          image: "suryansh72/icmr-fhir-cli:latest",
          command: ["python", "/app/icmr_viz/cli.py", "generate-report"],
          args: [],
          resources: {
            limits: { memory: "2Gi", cpu: "2" },
            requests: { memory: "1Gi", cpu: "1" }
          },
          env: [
            {
              name: "PYTHONUNBUFFERED",
              value: "1"
            }
          ]
        }
      },
      {
        name: "main-dag",
        dag: { tasks: [] }
      }
    ]
  }
};

function mapNodeToTask(node) {
  const templateName = nodeTypeToTemplate[node.info.type] || node.info.type;
  
  // Build the task object
  const task = {
    name: node.info.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase(), // Ensure Kubernetes-compatible name
    template: templateName,
    arguments: {
      parameters: convertToNameValue(node.data)
    }
  };

  // Add dependencies if they exist
  if (node.info.depends && node.info.depends.length > 0) {
    task.dependencies = node.info.depends.map(dep => 
      dep.replace(/[^a-z0-9-]/gi, '-').toLowerCase() 
    );
  }

  return task;
}

function sanitizeK8sName(name) {
  // Replace non-alphanumeric characters with dashes
  let sanitized = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  // Ensure it starts with an alphanumeric character
  if (!/^[a-z0-9]/.test(sanitized)) {
    sanitized = 'wf-' + sanitized;
  }
  // Limit length to 63 characters
  if (sanitized.length > 63) {
    sanitized = sanitized.substring(0, 63);
  }
  // Ensure it ends with an alphanumeric character
  if (!/[a-z0-9]$/.test(sanitized)) {
    sanitized = sanitized.substring(0, sanitized.length - 1) + 'x';
  }
  return sanitized;
}

export function generateArgoWorkflow(name, nodes) {
  const workflow = JSON.parse(JSON.stringify(argoWorkflowTemplate));
  const sanitizedName = sanitizeK8sName(name);
  
  const mainDag = workflow.spec.templates.find(t => t.name === "main-dag");
  mainDag.dag.tasks = nodes.map(mapNodeToTask);

  // Add storage volume for all templates to share data
  workflow.spec.volumes = [
    {
      name: "workflow-data",
      emptyDir: {}
    }
  ];

  workflow.spec.templates.forEach(template => {
    if (template.container) {
      const correspondingNodes = nodes.filter(node => 
        nodeTypeToTemplate[node.info.type] === template.name
      );
      
      if (correspondingNodes.length > 0) {
        template.container.args = buildCliArgs(correspondingNodes[0].data);
        
        // Add volume mount to container
        template.container.volumeMounts = [
          {
            name: "workflow-data",
            mountPath: "/app/data"
          }
        ];
      }
    }
  });

  workflow.metadata.generateName = `icmr-${sanitizedName}-`;
  workflow.metadata.labels["workflow-name"] = sanitizedName;

  return workflow;
}
