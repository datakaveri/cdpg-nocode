from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
from minio.error import S3Error
import os
import io
from typing import Optional

app = FastAPI(
    title="Medical Analytics API",
    description="API to retrieve operation outputs from MinIO",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MinIO Configuration
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio.icmr.svc.cluster.local:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
BUCKET_NAME = "no-code-data-bucket"

# Initialize MinIO client
minio_client = Minio(
    endpoint=MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Medical Analytics API",
        "version": "1.0.0"
    }

@app.get("/operations/{operation_name}/files")
async def get_operation_file(
    operation_name: str,
    file_type: str = Query(..., regex="^(csv|html|png|json)$", description="File type to retrieve")
):
    try:
        operation_folder = operation_name.lower().replace('_', '-')
        
        # List all objects in the operation folder
        objects = minio_client.list_objects(
            BUCKET_NAME, 
            prefix=f"{operation_folder}/",
            recursive=True
        )
        
        # Find the file with matching extension
        target_file = None
        for obj in objects:
            if obj.object_name.endswith(f".{file_type}"):
                target_file = obj.object_name
                break
        
        if not target_file:
            raise HTTPException(
                status_code=404,
                detail=f"No {file_type} file found in {operation_folder} folder"
            )
        
        response = minio_client.get_object(BUCKET_NAME, target_file)
        file_data = response.read()
        response.close()
        response.release_conn()
        
        # Determine content type
        content_types = {
            "csv": "text/csv",
            "html": "text/html",
            "png": "image/png",
            "json": "application/json"
        }
        content_type = content_types.get(file_type, "application/octet-stream")
        
        # Extract filename
        filename = os.path.basename(target_file)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except S3Error as e:
        raise HTTPException(
            status_code=404,
            detail=f"MinIO error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/operations/{operation_name}/list")
async def list_operation_files(operation_name: str):
    try:
        operation_folder = operation_name.lower().replace('_', '-')
        
        objects = minio_client.list_objects(
            BUCKET_NAME,
            prefix=f"{operation_folder}/",
            recursive=True
        )
        
        files = []
        for obj in objects:
            file_ext = os.path.splitext(obj.object_name)[1].lstrip('.')
            files.append({
                "filename": os.path.basename(obj.object_name),
                "path": obj.object_name,
                "type": file_ext,
                "size": obj.size,
                "last_modified": obj.last_modified.isoformat() if obj.last_modified else None
            })
        
        if not files:
            raise HTTPException(
                status_code=404,
                detail=f"No files found in {operation_folder} folder"
            )
        
        return {
            "operation": operation_name,
            "folder": operation_folder,
            "files": files,
            "total_files": len(files)
        }
        
    except S3Error as e:
        raise HTTPException(
            status_code=404,
            detail=f"MinIO error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)