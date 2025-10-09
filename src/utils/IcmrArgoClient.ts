export interface ArgoWorkflowMetadata {
  name: string;
  [key: string]: any;
}

export interface ArgoWorkflowResponse {
  metadata?: ArgoWorkflowMetadata;
  [key: string]: any;
}

export class IcmrArgoClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = token.trim().replace(/^Bearer\s*/i, "");
  }

  private async _makeRequest<T = any>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body: Record<string, any> | null = null
  ): Promise<T> {
    const headers = new Headers({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      const responseData = await response.text();

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, responseData);
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }

      try {
        return JSON.parse(responseData) as T;
      } catch {
        return { message: responseData } as unknown as T;
      }
    } catch (error: any) {
      console.error("Request failed:", error);
      throw new Error(`Argo API Error: ${error.message}`);
    }
  }

  public async testConnection(): Promise<any> {
    return this._makeRequest("/api/v1/info");
  }

  public async submitWorkflow(workflow: Record<string, any>): Promise<ArgoWorkflowResponse> {
    const payload = { workflow };

    try {
      console.log("Submitting workflow:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/api/v1/workflows/argo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.text();

      if (!response.ok) {
        console.error(`Workflow submission error (${response.status}):`, responseData);
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }

      try {
        const jsonResponse: ArgoWorkflowResponse = JSON.parse(responseData);
        if (jsonResponse.metadata?.name) {
          console.log(`Actual workflow name: ${jsonResponse.metadata.name}`);
        } else {
          console.warn("Workflow submission response does not contain the workflow name:", jsonResponse);
        }
        return jsonResponse;
      } catch {
        return { message: responseData };
      }
    } catch (error: any) {
      console.error("Workflow submission failed:", error);
      throw new Error(`Argo API Error: ${error.message}`);
    }
  }

  public async getStatus(workflowName: string): Promise<ArgoWorkflowResponse> {
    try {
      const res = await this._makeRequest<ArgoWorkflowResponse>(
        `/api/v1/workflows/argo/${encodeURIComponent(workflowName)}`
      );
      return res;
    } catch (error: any) {
      console.error(`Failed to get status for workflow ${workflowName}:`, error);
      throw error;
    }
  }
}
