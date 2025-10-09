import { BaseNodeTemplate } from "../types/common.type";

export const nodeTemplates:BaseNodeTemplate[] = [
  {
    label: "load-dataset",
    icon: "database-backup",
    color: "#E6897E",
    type: "load-dataset",
    description: "Load a dataset from FHIR server ",
    params: {
      base_url: "https://fhir.rs.adarv.in/fhir",
      dataset_name: "LeptoDemo",
    },
  },

  {
    label: "correlation",
    icon: "cable",
    color: "#B87EE6",
    type: "correlation",
    description:
      "Standardized measure of relationship between two variables, ranges from -1 to +1.",
    params: {},
  },

  {
    label: "condition",
    icon: "receipt-text",
    color: "#7EE6B8",
    type: "condition",
    description:
      "Lists selected specific condition fhir resource types for the loaded dataset. default : all conditions",
    params: {},
  },
  {
    label: "observation",
    icon: "telescope",
    color: "#7EB8E6",
    type: "observation",
    description:
      "Lists selected specific observation fhir resource types for the loaded dataset. default : all observations",
    params: {},
  },
  {
    label: "cluster",
    icon: "boxes",
    color: "#E6B87E",
    type: "cluster",
    description:
      "Grouping patients/data points into clusters based on similarity.",
    params: {
      features: "",
      clusters: "3",
      topx: "10",
    },
  },

  {
    label: "frequency",
    icon: "audio-lines",
    color: "#7EE6E6",
    type: "frequency",
    description: "The count of how many times each value appears.",
    params: {
      column: "",
      proportion: "false",
    },
  },

  {
    label: "range",
    icon: "activity",
    color: "#E67EB8",
    type: "range",
    description: "The difference between the maximum and minimum values.",
    params: {
      column: "",
    },
  },

  {
    label: "std",
    icon: "axis-3d",
    color: "#B8E67E",
    type: "std",
    description: "A measure of how spread out values are around the mean.",
    params: {
      column: "",
    },
  },

  {
    label: "mode",
    icon: "blend",
    color: "#E6E67E",
    type: "mode",
    description:
      "The most frequently occurring value(s) for an attribute or column in a dataset",
    params: {
      column: "",
    },
  },

  {
    label: "median",
    icon: "circle-slash-2",
    color: "#7E7EE6",
    type: "median",
    description: "The middle value when all data points are sorted.",
    params: {
      column: "",
    },
  },

  {
    label: "mean",
    icon: "waves",
    color: "#E67E7E",
    type: "mean",
    description: "The average of an attribute or a column in a  dataset.",
    params: {
      file: "processed_data.csv",
      column: "",
    },
  },
  {
    label: "abbreviate",
    icon: "expand",
    color: "#7EE67E",
    type: "abbreviate",
    description:
      "Creates abbreviated versions of observation and condition names for better visualization. Helps with readability in charts.",
    params: {},
  },

  {
    label: "plot",
    icon: "land-plot",
    color: "#B87E7E",
    type: "plot",
    description:
      "Creates interactive visualizations . Supports multiple chart types including bar, line, scatter, heatmap, and network plots.",
    params: {
      data_file: "",
      csv_file: "",
      plot_type: "bar",
      operation: "",
      title: "",
      x_label: "",
      y_label: "",
      color_column: "",
      size_column: "",
      facet_column: "",
      width: "800",
      height: "600",
      output: "",
    },
  },
  {
    label: "join",
    icon: "merge",
    color: "#FF6B6B",
    type: "join",
    description:
      "Combines multiple datasets using various join operations (inner, outer, left, right). Merges data based on specified columns.",
    params: {
      join_types: "inner",
      join_columns: "patient_id",
      suffixes: "_x,_y",
    },
  },
  {
    label: "symptom-pattern",
    icon: "wallpaper",
    color: "#E74C3C",
    type: "symptom-pattern",
    description:
      "analyzes data to discover frequent co-occurrences and association rules (like 'if fever then headache') using statistical pattern mining with configurable support, confidence, and lift thresholds.",
    params: {
      min_support: "0.1",
      min_confidence: "0.7",
      min_lift: "1.2",
      exclude_cols: "",
    },
  },
  {
    label: "covariance",
    icon: "trending-down",
    color: "#3498DB",
    type: "covariance",
    description:
      "Calculates covariance between two numeric variables. Measures how variables change together in relation to their means.",
    params: {
      col1: "",
      col2: "",
    },
  },
  {
    label: "corr-coefficient",
    icon: "arrow-up-0-1",
    color: "#1ABC9C",
    type: "corr-coefficient",
    description:
      "The exact numerical value of correlation (e.g., Pearson’s, Spearmen). Tells how strong and in which direction two healthcare metrics are related.",
    params: {
      col1: "",
      col2: "",
    },
  },
  {
    label: "prevalence",
    icon: "waypoints",
    color: "#F39C12",
    type: "prevalence",
    description:
      "Calculates disease prevalence rates in the population. Shows percentage of patients with specific conditions.",
    params: {
      disease_col: "",
      case_value: "1",
    },
  },
];
