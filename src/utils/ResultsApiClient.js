import { env } from "../environments/environments";

export class ResultsApiClient {
    constructor(baseUrl = env.resultsApiUrl) {
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }

    async fetchFile(operationName, fileType) {
        const url = `${this.baseUrl}/operations/${encodeURIComponent(operationName)}/files?file_type=${encodeURIComponent(fileType)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Results API ${res.status}`);
        }
        if (fileType === "html") {
            return await res.text();
        }
        // csv returns text as well
        return await res.text();
    }

    async list(operationName) {
        const url = `${this.baseUrl}/operations/${encodeURIComponent(operationName)}/list`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Results API ${res.status}`);
        }
        return await res.json();
    }
}

export function parseCsv(text) {
    // Simple CSV parser for small tables; handles commas within quotes
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (inQuotes && text[i + 1] === '"') { // escaped quote
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push(field);
            field = '';
        } else if ((c === '\n' || c === '\r') && !inQuotes) {
            if (field !== '' || row.length) {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
            }
        } else {
            field += c;
        }
    }
    if (field !== '' || row.length) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}


