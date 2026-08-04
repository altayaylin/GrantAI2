from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    deepseek_api_key: str = ""
    cors_origins: str = ""
    polar_access_token: str = ""
    polar_webhook_secret: str = ""
    polar_pro_product_id: str = ""
    polar_server: str = "sandbox"
    frontend_url: str = "https://naviuni.org"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
