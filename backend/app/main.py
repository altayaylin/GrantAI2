from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import universities, profiles, deadlines, activities, achievements

app = FastAPI(
    title="GrantAI API",
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


@app.get("/")
def root():
    return {"status": "GrantAI API работает", "docs": "/docs"}
