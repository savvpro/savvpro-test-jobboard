from fastapi import FastAPI

app = FastAPI()


@app.get("/hello")
async def hello_controller():
    return {
        "message": "Hello from FastAPI"
    }