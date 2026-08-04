from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import universities, profiles, deadlines, activities, achievements, billing

app = FastAPI(
    title="Naviuni API",
    description="Бэкенд для подбора университетов и управления профилем студента",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
        "https://grant-ai-2.vercel.app",
        "https://naviuni.org",
        "https://www.naviuni.org",
        *settings.cors_origin_list,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(universities.router)
app.include_router(profiles.router)
app.include_router(deadlines.router)
app.include_router(activities.router)
app.include_router(achievements.router)
app.include_router(billing.router)


@app.get("/")
def root():
    return {"status": "Naviuni API работает", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

