import { env } from "../environments/environments";

export const argoWorkflowTemplate = {
	apiVersion: "argoproj.io/v1alpha1",
	kind: "Workflow",
	metadata: {
		generateName: "icmr-",
		namespace: "argo",
		labels: {
			"workflows.argoproj.io/archive-strategy": "true",
		},
	},
	spec: {
		entrypoint: "main-dag",
		ttlStrategy: { secondsAfterCompletion: 86400 },
		templates: [
			{
				name: "download-data",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: [
						"python",
						"/app/icmr_viz/cli.py",
						"download-data",
					],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "join",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "join"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "correlation",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "correlation"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "condition",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "condition"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "observation",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "observation"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "cluster",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "cluster"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "frequency",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "frequency"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "range",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "range"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "std",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "std"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "mode",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "mode"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "median",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "median"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "mean",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "mean"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "abbreviate",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "abbreviate"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "plot",
				inputs: { parameters: [] },
				container: {
					image: env.sdkImage,
					command: ["python", "/app/icmr_viz/cli.py", "plot"],
					args: [],
					resources: {
						limits: { memory: "2Gi", cpu: "2" },
						requests: { memory: "1Gi", cpu: "1" },
					},
					env: [
						{
							name: "PYTHONUNBUFFERED",
							value: "1",
						},
					],
				},
			},
			{
				name: "main-dag",
				dag: { tasks: [] },
			},
		],
	},
};
