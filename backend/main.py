from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .database import engine, Base
from .routers import jobs, applications, stats

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JobBoard Pro API",
    description="A full-stack job listing and application management platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(stats.router)


@app.get("/")
def root():
    return {"message": "JobBoard Pro API", "docs": "/docs"}
