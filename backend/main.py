from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from database import init_db
from routers.jobs import router as jobs_router, stats_router
from routers import applications


def create_app() -> FastAPI:
    app = FastAPI(title="JobBoard Pro API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        messages = [f"{' -> '.join(str(loc) for loc in e['loc'])}: {e['msg']}" for e in errors]
        return JSONResponse(
            status_code=422,
            content={"error": "; ".join(messages)},
        )

    app.include_router(jobs_router)
    app.include_router(stats_router)
    app.include_router(applications.router)

    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
