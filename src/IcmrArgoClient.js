export class IcmrArgoClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token.trim().replace(/^Bearer\s*/i, '');
  }

  async _makeRequest(path, method = 'GET', body = null) {
    const headers = new Headers({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    try {
      console.log(`Making ${method} request to ${this.baseUrl}${path}`);
      if (body) {
        console.log('Request payload:', JSON.stringify(body, null, 2));
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const responseData = await response.text();
      
      if (!response.ok) {
        console.error(`API Error (${response.status}):`, responseData);
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }
      
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('Response:', JSON.stringify(jsonResponse, null, 2));
        return jsonResponse;
      } catch (e) {
        // If response is not JSON, return text
        console.log('Response (text):', responseData);
        return { message: responseData };
      }
    } catch (error) {
      console.error('Request failed:', error);
      throw new Error(`Argo API Error: ${error.message}`);
    }
  }

  async testConnection() {
    return this._makeRequest('/api/v1/info');
  }

  // In IcmrArgoClient.js, modify the submitWorkflow method to return the actual workflow name:

  async submitWorkflow(workflow) {
    const payload = {workflow}
    console.log(payload)
    
    try {
      console.log('Submitting workflow:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/argo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      const responseData = await response.text();
      
      if (!response.ok) {
        console.error(`Workflow submission error (${response.status}):`, responseData);
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }
      
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('Workflow submitted successfully:', JSON.stringify(jsonResponse, null, 2));
        
        // Extract and return the actual workflow metadata including the real workflow name
        if (jsonResponse.metadata && jsonResponse.metadata.name) {
          console.log(`Actual workflow name: ${jsonResponse.metadata.name}`);
          return jsonResponse;
        } else {
          console.warn('Workflow submission response does not contain the workflow name:', jsonResponse);
          return jsonResponse;
        }
      } catch (e) {
        // If response is not JSON, return text
        console.log('Response (text):', responseData);
        return { message: responseData };
      }
    } catch (error) {
      console.error('Workflow submission failed:', error);
      throw new Error(`Argo API Error: ${error.message}`);
    }
  }

  async getStatus(workflowName) {
    try {
      return this._makeRequest(`/api/v1/workflows/argo/${encodeURIComponent(workflowName)}`);
    } catch (error) {
      console.error(`Failed to get status for workflow ${workflowName}:`, error);
      throw error;
    }
  }
}