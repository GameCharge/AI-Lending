import os
from typing import Optional

from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, ValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.templating import Jinja2Templates


class EmailValidator(BaseModel):
    """Простая модель для проверки корректности email."""

    email: EmailStr


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="ИИ-Анкета24 Landing")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(base_dir, "static")
templates_path = os.path.join(base_dir, "templates")

app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=templates_path)


@app.get("/", response_class=HTMLResponse)
@limiter.limit("20/minute")
async def read_root(request: Request) -> HTMLResponse:
    """Главная страница лендинга."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/lead")
@limiter.limit("3/minute")
async def create_lead(
    request: Request,
    name: str = Form(...),
    telegram: str = Form(...),
    email: str = Form(...),
    honeypot: Optional[str] = Form(None),
) -> JSONResponse:
    """Приём заявки с формы на лендинге."""
    if honeypot:
        # боты обычно заполняют скрытое поле — тихо говорим «ок»
        return JSONResponse(
            status_code=201,
            content={"status": "ok", "message": "Заявка успешно отправлена"},
        )

    if len(name) > 50 or len(telegram) > 50 or len(email) > 100:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Слишком длинный текст"},
        )

    try:
        EmailValidator(email=email)
    except ValidationError:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Некорректный формат email"},
        )

    print(f"Новый лид: {name} | TG: {telegram} | Email: {email}")

    return JSONResponse(
        {"status": "ok", "message": "Заявка успешно отправлена"},
        status_code=201,
    )


@app.get("/health")
async def healthcheck() -> dict:
    """Простой health-check для мониторинга."""
    return {"status": "ok"}