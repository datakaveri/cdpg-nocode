# ICMR OPERATIONS SDK

A powerful Python SDK for analyzing and visualizing FHIR (Fast Healthcare Interoperability Resources) data with seamless integration to MinIO storage and a no-code analytics platform.

## 🌟 Features

- **FHIR Data Processing**: Easily download and process FHIR resources from any FHIR server
- **Advanced Analytics**: Comprehensive statistical and pattern analysis capabilities
- **Interactive Visualizations**: Beautiful, interactive plots powered by Plotly
- **MinIO Integration**: Seamless data persistence and sharing
- **No-Code Platform**: Drag-and-drop interface for building analytics workflows
- **Clustering Analysis**: Identify patterns in patient data
- **Correlation Analysis**: Understand relationships between observations and conditions
- **Symptom Pattern Analysis**: Discover common symptom combinations

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Visualization Types](#visualization-types)
- [MinIO Integration](#minio-integration)
- [Examples](#examples)
- [Docker Support](#docker-support)

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/icmr-fhir.git
cd icmr-fhir/scripts/FHIR-Visualizations/icmr_viz

# Install dependencies
pip install -r requirements.txt
```

## ⚙️ Configuration

Create a `config.json` file in your project root:

```json
{
  "base_url": "http://your-fhir-server/fhir",
  "minio": {
    "endpoint": "minio.icmr.svc.cluster.local:9000",
    "access_key": "your_access_key",
    "secret_key": "your_secret_key",
    "secure": false
  }
}
```

## 📟 CLI Commands and Parameter Types

### 1. Download Data
Downloads and processes FHIR resources.

```bash
python -m icmr_viz.cli download-data [OPTIONS]

Parameters:
  --base_url TEXT                 # FHIR server URL (string)
  -o2, --processed_data_path PATH # Output path for processed data (string, path)
  -o1, --patients_df_path PATH    # Output path for patients data (string, path)
  -o3, --obs_names_path PATH      # Output path for observation names (string, path)
  -o4, --cond_names_path PATH     # Output path for condition names (string, path)
  -d, --dataset_name TEXT         # Dataset names (string, comma-separated)

Example:
python -m icmr_viz.cli download-data --base_url http://fhir-server/fhir --dataset_name covid_data,diabetes_data
```

### 2. Join Datasets
Combines multiple datasets with various join operations.

```bash
python -m icmr_viz.cli join [OPTIONS]

Parameters:
  -pf, --processed_files TEXT    # Input processed data files (string, comma-separated)
  -df, --patients_files TEXT     # Input patient data files (string, comma-separated)
  -j, --join_types TEXT         # Join types: inner,outer,left,right (string)
  -c, --join_columns TEXT       # Columns to join on (string, comma-separated)
  --preview                     # Preview mode flag (boolean)

Example:
python -m icmr_viz.cli join -pf data1.csv,data2.csv -df patients1.csv,patients2.csv -j inner -c patient_id,visit_id
```

### 3. Statistical Operations

#### Mean Analysis
```bash
python -m icmr_viz.cli mean [OPTIONS]

Parameters:
  -f, --file TEXT     # Input CSV file (string, path)
  -c, --column TEXT   # Column name (string)
  
Supported Variables:
  - Numeric columns only (int, float)

Example:
python -m icmr_viz.cli mean -f processed_data.csv -c blood_pressure
```

#### Median Analysis
```bash
python -m icmr_viz.cli median [OPTIONS]

Parameters:
  -f, --file TEXT     # Input CSV file (string, path)
  -c, --column TEXT   # Column name (string)

Supported Variables:
  - Numeric columns only (int, float)

Example:
python -m icmr_viz.cli median -f processed_data.csv -c heart_rate
```

#### Mode Analysis
```bash
python -m icmr_viz.cli mode [OPTIONS]

Parameters:
  -f, --file TEXT     # Input CSV file (string, path)
  -c, --column TEXT   # Column name (string)

Supported Variables:
  - Numeric columns (int, float)
  - Categorical columns (string)

Example:
python -m icmr_viz.cli mode -f processed_data.csv -c diagnosis
```

#### Standard Deviation
```bash
python -m icmr_viz.cli std [OPTIONS]

Parameters:
  -f, --file TEXT     # Input CSV file (string, path)
  -c, --column TEXT   # Column name (string)

Supported Variables:
  - Numeric columns only (int, float)

Example:
python -m icmr_viz.cli std -f processed_data.csv -c temperature
```

#### Range Analysis
```bash
python -m icmr_viz.cli range [OPTIONS]

Parameters:
  -f, --file TEXT     # Input CSV file (string, path)
  -c, --column TEXT   # Column name (string)

Supported Variables:
  - Numeric columns only (int, float)

Example:
python -m icmr_viz.cli range -f processed_data.csv -c age
```

### 4. Advanced Analytics

#### Cluster Analysis
```bash
python -m icmr_viz.cli cluster [OPTIONS]

Parameters:
  -f, --file TEXT          # Input CSV file (string, path)
  --features TEXT          # Features for clustering (string, comma-separated)
  -k, --clusters INTEGER   # Number of clusters (int)
  -t, --topx INTEGER      # Top clusters to show (int)

Supported Variables:
  - Numeric features for clustering (int, float)
  - Categorical features (automatically encoded)

Example:
python -m icmr_viz.cli cluster -f processed_data.csv --features age,bp,temp -k 5
```

#### Correlation Analysis
```bash
python -m icmr_viz.cli correlation [OPTIONS]

Parameters:
  -i, --input TEXT         # Input CSV file (string, path)
  --obs-names-path PATH    # Observation names file (string, path)
  --cond-names-path PATH   # Condition names file (string, path)

Supported Variables:
  - Numeric columns (int, float)
  - Binary columns (0/1)

Example:
python -m icmr_viz.cli correlation -i processed_data.csv --obs-names-path obs.pkl --cond-names-path cond.pkl
```

#### Symptom Pattern Analysis
```bash
python -m icmr_viz.cli symptom_pattern [OPTIONS]

Parameters:
  -i, --input TEXT           # Input CSV file (string, path)
  --min_support FLOAT        # Minimum support threshold (float: 0.0-1.0)
  --min_confidence FLOAT     # Minimum confidence threshold (float: 0.0-1.0)
  --min_lift FLOAT          # Minimum lift threshold (float)

Supported Variables:
  - Binary columns (0/1)
  - Categorical columns (automatically binarized)

Example:
python -m icmr_viz.cli symptom_pattern -i processed_data.csv --min_support 0.1 --min_confidence 0.7
```

### 5. Visualization

### Plot Types and Their Best Use Cases

1. **Bar Plots**
   - **Best For**: 
     - Frequency distributions
     - Categorical comparisons
     - Count data visualization
   - **Data Types**: Categorical, discrete numeric

2. **Line Plots**
   - **Best For**:
     - Time series data
     - Trend analysis
     - Continuous measurements
   - **Data Types**: Time series, continuous numeric

3. **Scatter Plots**
   - **Best For**:
     - Correlation analysis
     - Relationship exploration
     - Pattern detection
   - **Data Types**: Continuous numeric pairs

4. **Heatmaps**
   - **Best For**:
     - Correlation matrices
     - Density visualization
   - **Data Types**: Numeric matrices, correlation coefficients

5. **Box Plots**
   - **Best For**:
     - Distribution analysis
     - Outlier detection
     - Group comparisons
   - **Data Types**: Numeric data with groups

6. **Network Plots**
   - **Best For**:
     - Relationship mapping
     - Connection analysis
     - Pattern discovery
   - **Data Types**: Relational data, association rules

7. **Pie Charts**
   - **Best For**:
     - Part-to-whole relationships
     - Proportion analysis
     - Simple comparisons
   - **Data Types**: Categorical with percentages

8. **Histograms**
   - **Best For**:
     - Distribution shape
     - Frequency analysis
     - Value ranges
   - **Data Types**: Continuous numeric

#### Plot Generation
```bash
python -m icmr_viz.cli plot [OPTIONS]

Parameters:
  -t, --plot_type TEXT     # Plot type (string: bar/line/scatter/histogram/box/violin/heatmap/pie/network)
  -op, --operation TEXT    # Operation to plot (string)
  --title TEXT            # Plot title (string)
  -x, --x_label TEXT      # X-axis label (string)
  -y, --y_label TEXT      # Y-axis label (string)
  --width INTEGER        # Plot width in pixels (int)
  --height INTEGER       # Plot height in pixels (int)
  --theme TEXT           # Plot theme (string)

```

1. Bar Plot
   ```bash
   # For categorical comparisons
   python -m icmr_viz.cli plot -t bar -op frequency --title "Diagnosis Distribution"
   ```

2. Line Plot
   ```bash
   # For time series or trend analysis
   python -m icmr_viz.cli plot -t line -op observation --title "Temperature Trends"
   ```

3. Scatter Plot
   ```bash
   # For correlation analysis
   python -m icmr_viz.cli plot -t scatter -op correlation --title "Age vs BP Correlation"
   ```

4. Heatmap
   ```bash
   # For correlation matrices
   python -m icmr_viz.cli plot -t heatmap -op correlation --title "Symptom Correlations"
   ```

5. Box Plot
   ```bash
   # For distribution analysis
   python -m icmr_viz.cli plot -t box -op mean --title "Age Distribution by Condition"
   ```

6. Network Plot
   ```bash
   # For symptom associations
   python -m icmr_viz.cli plot -t network -op symptom_pattern --title "Symptom Relationships"
   ```

## 🐳 Docker Support

```dockerfile
# Build the image
docker build -t icmr-viz .

# Run with environment variables
docker run -p 8050:8050 \
  -e MINIO_ENDPOINT=minio.icmr.svc.cluster.local:9000 \
  -e MINIO_ACCESS_KEY=your_access_key \
  -e MINIO_SECRET_KEY=your_secret_key \
  -e FHIR_BASE_URL=http://your-fhir-server/fhir \
  icmr-viz
```

## 📊 Complete Analysis Example

Here's a complete workflow example:

```bash
# 1. Download and process FHIR data
python -m icmr_viz.cli download-data --base_url http://fhir-server/fhir --dataset_name covid_data

# 2. Perform basic statistical analysis
python -m icmr_viz.cli mean -f processed_data.csv
python -m icmr_viz.cli median -f processed_data.csv
python -m icmr_viz.cli std -f processed_data.csv

# 3. Analyze correlations
python -m icmr_viz.cli correlation -i processed_data.csv

# 4. Perform clustering
python -m icmr_viz.cli cluster -f processed_data.csv --features age,temperature,bp -k 5

# 5. Analyze symptom patterns
python -m icmr_viz.cli symptom_pattern -i processed_data.csv --min_support 0.1 --min_confidence 0.7

# 6. Create visualizations
python -m icmr_viz.cli plot -t heatmap -op correlation --title "Symptom Correlations"
python -m icmr_viz.cli plot -t scatter -op cluster --title "Patient Clusters"
python -m icmr_viz.cli plot -t network -op symptom_pattern --title "Symptom Associations"
```


##  MinIO Data Storage and Retrieval

The SDK uses MinIO as its primary storage backend for data persistence and sharing. Here's how data is organized and accessed:

### Storage Organization

1. **Data Layer**
   - Raw FHIR resources are stored in their original format
   - Processed CSV files are stored with standardized naming
   - Observation and condition mappings are preserved as pickle files
   - All files are versioned with timestamps

2. **Analysis Layer**
   - Statistical results stored as JSON files
   - Correlation matrices saved in CSV format
   - Clustering results with model parameters
   - Pattern analysis outcomes with confidence metrics

3. **Visualization Layer**
   - Interactive Plotly plots as HTML
   - Static plots as PNG files
   - Plot configurations and templates
   - Custom color schemes and themes
