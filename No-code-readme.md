# ICMR FHIR No-Code Analytics Platform

A powerful no-code platform built with React Flow for creating and managing FHIR data analytics workflows.

## 🌟 Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating analytics pipelines
- **Real-time Preview**: Instant visualization of analysis results
- **Argo Integration**: Automated workflow execution and scheduling
- **MinIO Storage**: Seamless data persistence and sharing
- **Component Library**: Pre-built nodes for common analytics operations
- **Custom Nodes**: Support for custom analytics components
- **Interactive Visualization**: Real-time plot customization

## 📋 Table of Contents

- [ICMR FHIR No-Code Analytics Platform](#icmr-fhir-no-code-analytics-platform)
  - [🌟 Features](#-features)
  - [📋 Table of Contents](#-table-of-contents)
  - [🔧 Prerequisites](#-prerequisites)
  - [🚀 Installation](#-installation)
  - [⚙️ Kubernetes Setup](#️-kubernetes-setup)
  - [🔄 Argo Workflow Setup](#-argo-workflow-setup)
  - [🌐 NGINX Configuration](#-nginx-configuration)
  - [🔌 Platform Configuration](#-platform-configuration)
  - [📦 MinIO Setup](#-minio-setup)
  - [📝 Usage Guide](#-usage-guide)
    - [Building Workflows](#building-workflows)
  - [📚 Additional Resources](#-additional-resources)

## 🔧 Prerequisites

- Node.js >= 14
- npm >= 6
- Docker
- Kubernetes (minikube)
- kubectl CLI
- Git

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/icmr-fhir.git
cd icmr-fhir/scripts/FHIR-Visualizations/icmr_viz/icmr-react/icmr-analytics
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Kubernetes Setup

1. Install and start minikube:
```bash
# Install minikube (macOS)
brew install minikube

# Start minikube
minikube start

# Switch to minikube's Docker environment
eval $(minikube docker-env)
```

2. Verify setup:
```bash
kubectl get nodes
minikube status
```

## 🔄 Argo Workflow Setup

1. Create Argo namespace:
```bash
kubectl create namespace argo
```

2. Apply Argo configuration:
```bash
# Create a file named argo-config.yaml
cat > argo-config.yaml << 'EOL'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo
  namespace: argo
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argo-cluster-role
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/exec", "pods/log"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argo-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: argo-cluster-role
subjects:
  - kind: ServiceAccount
    name: argo
    namespace: argo
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: workflow-controller-configmap
  namespace: argo
data:
  config: |
    containerRuntimeExecutor: pns
EOL

# Apply the configuration
kubectl apply -f argo-config.yaml
```

3. Deploy Argo Server:
```bash
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/stable/manifests/quick-start-postgres.yaml
```

## 🌐 NGINX Configuration

1. Create NGINX configuration:
```bash
# Create nginx.conf
cat > nginx.conf << 'EOL'
events {
    worker_connections 1024;
}

http {
    upstream argo_workflow {
        server argo-server:2746;
    }

    server {
        listen 80;
        server_name localhost;
        
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;

        location / {
            add_header Access-Control-Allow-Origin '*' always;
            add_header Access-Control-Allow-Credentials 'true';
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD' always;
            add_header Access-Control-Allow-Headers 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range,token,BuildToken' always;
            if ($request_method = 'OPTIONS') {
                return 200;
            }
            proxy_pass http://argo_workflow;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
EOL
```

2. Create Dockerfile for NGINX:
```bash
# Create Dockerfile
cat > Dockerfile << 'EOL'
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOL

# Build NGINX image
docker build . -t my-nginx:latest
```

3. Deploy NGINX:
```bash
# Create deployment configuration
cat > nginx-deployment.yaml << 'EOL'
apiVersion: v1
kind: Service
metadata:
  name: nginx-project
  namespace: argo
spec:
  type: ClusterIP 
  ports:
    - port: 80
  selector:
    app: nginx-project
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-project
  namespace: argo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-project
  template:
    metadata:
      labels:
        app: nginx-project
    spec:
      containers:
        - name: nginx
          image: my-nginx:latest 
          ports:
            - containerPort: 80
          imagePullPolicy: Never
EOL

# Apply deployment
kubectl apply -f nginx-deployment.yaml
```

## 🔌 Platform Configuration

1. Get Argo authentication token:
```bash
# Get Argo token
ARGO_TOKEN=$(kubectl -n argo exec deploy/argo-server -- argo auth token)
echo $ARGO_TOKEN
```

2. Configure environment variables:
```bash
# Create .env file
cat > .env << EOL
REACT_APP_ARGO_API=http://localhost:3000
REACT_APP_ARGO_TOKEN=${ARGO_TOKEN}
REACT_APP_MINIO_ENDPOINT=your-minio-endpoint:9000
REACT_APP_MINIO_ACCESS_KEY=your-access-key
REACT_APP_MINIO_SECRET_KEY=your-secret-key
EOL
```

3. Start port forwarding:
```bash
# Forward NGINX port
kubectl port-forward -n argo svc/nginx-project 3000:80
```

4. Start the development server:
```bash
npm start
```

## 📦 MinIO Setup

1. Deploy MinIO on Kubernetes:
```bash
# Create MinIO namespace
kubectl create namespace minio-system

# Add MinIO Helm repository
helm repo add minio https://charts.min.io/
helm repo update

# Install MinIO
helm install minio minio/minio \
  --namespace minio-system \
  --set resources.requests.memory=1Gi \
  --set persistence.size=10Gi \
  --set mode=standalone
```

2. Get MinIO credentials:
```bash
# Get access key and secret key
echo "AccessKey: $(kubectl get secret minio -n minio-system -o jsonpath="{.data.accesskey}" | base64 --decode)"
echo "SecretKey: $(kubectl get secret minio -n minio-system -o jsonpath="{.data.secretkey}" | base64 --decode)"
```

3. Port forward MinIO:
```bash
# Forward MinIO API port
kubectl port-forward -n minio-system svc/minio 9000:9000 &

# Forward MinIO Console port
kubectl port-forward -n minio-system svc/minio 9001:9001 &
```

4. Access MinIO:
- API Endpoint: http://localhost:9000
- Console: http://localhost:9001
- Default bucket: icmr-fhir-data

## 📝 Usage Guide

### Building Workflows

1. **Node Palette**
   - Left sidebar contains available analytics nodes
   - Drag nodes onto the canvas
   - Connect nodes by dragging between ports

2. **Node Configuration**
   - Click node to open configuration panel
   - Set parameters in right sidebar
   - Parameters match CLI options from SDK

3. **Workflow Management**
   - Save workflows as templates
   - Export/Import workflows from argo endpoint
   - Schedule workflow execution

4. **Real-time Visualization**
   - Preview plots in canvas
   - Adjust visualization parameters
   - Export plots as PNG/HTML from minio endpoint


## 📚 Additional Resources

- [React Flow Documentation](https://reactflow.dev/)
- [Argo Workflows Documentation](https://argoproj.github.io/argo-workflows/)
- [MinIO Documentation](https://min.io/docs/minio/kubernetes/upstream/)
