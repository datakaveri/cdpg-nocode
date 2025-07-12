import { argoWorkflowTemplate } from "../constants/argoWorkflowTemplate";

function convertToNameValue(obj) {
	return Object.entries(obj)
		.filter(([_, value]) => value !== "")
		.map(([name, value]) => ({
			name,
			value: Array.isArray(value)
				? JSON.stringify(value)
				: value.toString(),
		}));
}

function buildCliArgs(params) {
	return Object.entries(params)
		.filter(([_, value]) => value !== "")
		.flatMap(([key, value]) => {
			// Special handling for observation/condition names
			if (
				(key === "observation_names" ||
					key === "condition_names" ||
					key === "columns") &&
				value
			) {
				return [`--${key}`, value.toString()];
			}
			// Handle boolean flag for minio_secure
			if (key === "minio_secure") {
				if (value.toString().toLowerCase() === "true") {
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
	"generate-report": "generate-report", // Add this mapping
	"symptom-pattern": "symptom-pattern", // Add this mapping
	covariance: "covariance", // Add this mapping
	"corr-coefficient": "corr-coefficient", // Add this mapping
	prevalence: "prevalence", // Add this mapping
};

function mapNodeToTask(node) {
	const baseTemplateName =
		nodeTypeToTemplate[node.info.type] || node.info.type;

	// Create unique template names for each node instance
	let templateName = `${baseTemplateName}-${node.info.id
		.replace(/[^a-z0-9-]/gi, "-")
		.toLowerCase()}`;

	// For plot nodes, include operation in template name
	if (node.info.type === "plot" && node.data.operation) {
		templateName = `plot-${node.data.operation}-${node.info.id
			.replace(/[^a-z0-9-]/gi, "-")
			.toLowerCase()}`;
	}

	// Clean task name - ensure it's valid for Kubernetes
	let taskName = node.info.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
	
	// Remove any leading/trailing dashes and ensure it doesn't start with a number
	taskName = taskName.replace(/^-+|-+$/g, '');
	if (/^[0-9]/.test(taskName)) {
		taskName = `node-${taskName}`;
	}
	
	if (node.info.type === "plot" && node.data.operation) {
		taskName = `${taskName}-${node.data.operation}`
			.replace(/[^a-z0-9-]/gi, "-")
			.toLowerCase();
	}

	// Build the task object
	const task = {
		name: taskName,
		template: templateName,
		arguments: {
			parameters: convertToNameValue(node.data),
		},
	};

	// Add dependencies if they exist
	if (node.info.depends && node.info.depends.length > 0) {
		task.dependencies = node.info.depends.map((dep) => {
			let cleanDep = dep.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
			cleanDep = cleanDep.replace(/^-+|-+$/g, '');
			if (/^[0-9]/.test(cleanDep)) {
				cleanDep = `node-${cleanDep}`;
			}
			return cleanDep;
		});
	}

	return task;
}

function sanitizeK8sName(name) {
	// Replace non-alphanumeric characters with dashes
	let sanitized = name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
	// Ensure it starts with an alphanumeric character
	if (!/^[a-z0-9]/.test(sanitized)) {
		sanitized = "wf-" + sanitized;
	}
	// Limit length to 63 characters
	if (sanitized.length > 63) {
		sanitized = sanitized.substring(0, 63);
	}
	// Ensure it ends with an alphanumeric character
	if (!/[a-z0-9]$/.test(sanitized)) {
		sanitized = sanitized.substring(0, sanitized.length - 1) + "x";
	}
	return sanitized;
}

// Helper function to create a unique template for each node
function createUniqueTemplate(baseTemplate, node) {
	const newTemplate = JSON.parse(JSON.stringify(baseTemplate)); // Deep clone

	// Create unique template name for this specific node
	const baseTemplateName =
		nodeTypeToTemplate[node.info.type] || node.info.type;
	newTemplate.name = `${baseTemplateName}-${node.info.id
		.replace(/[^a-z0-9-]/gi, "-")
		.toLowerCase()}`;

	// Set the CLI arguments for this specific node
	newTemplate.container.args = buildCliArgs(node.data);

	// Add volume mount to container
	newTemplate.container.volumeMounts = [
		{
			name: "workflow-data",
			mountPath: "/app/data",
		},
	];

	return newTemplate;
}

// Helper function to create a unique plot template for each node
function createUniquePlotTemplate(baseTemplate, node) {
	const newTemplate = JSON.parse(JSON.stringify(baseTemplate)); // Deep clone

	if (node.data.operation) {
		newTemplate.name = `plot-${node.data.operation}-${node.info.id
			.replace(/[^a-z0-9-]/gi, "-")
			.toLowerCase()}`;
	} else {
		newTemplate.name = `plot-${node.info.id
			.replace(/[^a-z0-9-]/gi, "-")
			.toLowerCase()}`;
	}

	// Set the CLI arguments for this specific node
	newTemplate.container.args = buildCliArgs(node.data);

	// Add volume mount to container
	newTemplate.container.volumeMounts = [
		{
			name: "workflow-data",
			mountPath: "/app/data",
		},
	];

	return newTemplate;
}

export function generateArgoWorkflow(name, nodes) {
	const workflow = JSON.parse(JSON.stringify(argoWorkflowTemplate));
	const sanitizedName = sanitizeK8sName(name);

	const mainDag = workflow.spec.templates.find((t) => t.name === "main-dag");
	mainDag.dag.tasks = nodes.map(mapNodeToTask);

	// Add storage volume for all templates to share data
	workflow.spec.volumes = [
		{
			name: "workflow-data",
			emptyDir: {},
		},
	];

	// Create a map of base template names to their original templates
	const originalTemplates = new Map();
	workflow.spec.templates.forEach((template) => {
		if (template.container) {
			originalTemplates.set(template.name, template);
		}
	});

	// Create unique templates for each node
	const newTemplates = [];
	const essentialTemplates = ["main-dag"]; // Keep non-container templates

	// Keep essential templates
	workflow.spec.templates.forEach((template) => {
		if (essentialTemplates.includes(template.name)) {
			newTemplates.push(template);
		}
	});

	// Create unique templates for each node
	nodes.forEach((node) => {
		const baseTemplateName =
			nodeTypeToTemplate[node.info.type] || node.info.type;
		let baseTemplate = originalTemplates.get(baseTemplateName);

		// Log missing templates for debugging
		if (!baseTemplate) {
			console.warn(`No base template found for node type: ${node.info.type}, expected template: ${baseTemplateName}`);
			return; // Skip this node if no template is found
		}

		// Special handling for plot nodes
		if (node.info.type === "plot") {
			baseTemplate = originalTemplates.get("plot");
			if (baseTemplate) {
				const uniqueTemplate = createUniquePlotTemplate(
					baseTemplate,
					node
				);
				newTemplates.push(uniqueTemplate);
			}
		} else {
			// Handle other node types
			if (baseTemplate) {
				const uniqueTemplate = createUniqueTemplate(baseTemplate, node);
				newTemplates.push(uniqueTemplate);
			}
		}
	});

	// Replace the templates array with our new unique templates
	workflow.spec.templates = newTemplates;

	workflow.metadata.generateName = `icmr-${sanitizedName}-`;
	workflow.metadata.labels["workflow-name"] = sanitizedName;

	return workflow;
}