import os
import psycopg2
import psycopg2.extras
from config import settings


def _get_dsn():
    dsn = settings.DATABASE_URL
    if dsn.startswith("postgres://"):
        dsn = dsn.replace("postgres://", "postgresql://", 1)
    return dsn


class PgConnectionWrapper:
    """Wraps psycopg2 connection to match the sqlite3-like interface used by routers."""

    def __init__(self, conn):
        self._conn = conn
        self._cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def execute(self, query, params=None):
        self._cursor.execute(query, params)
        return self._cursor

    def commit(self):
        self._conn.commit()

    def close(self):
        self._cursor.close()
        self._conn.close()


def get_db():
    conn = psycopg2.connect(_get_dsn())
    db = PgConnectionWrapper(conn)
    try:
        yield db
    finally:
        db.close()


def init_db():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    conn = psycopg2.connect(_get_dsn())
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS recordings (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            admin_name TEXT NOT NULL,
            record_date TEXT NOT NULL,
            record_time TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            transcription TEXT,
            analysis TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prompts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    cur.execute("SELECT COUNT(*) as cnt FROM prompts")
    if cur.fetchone()["cnt"] == 0:
        cur.execute("""
            INSERT INTO prompts (title, content, is_active) VALUES (
                'Стандартный анализ продаж',
                'Проанализируй следующий диалог между администратором студии растяжки и клиентом.

Оцени по следующим критериям:
1. Приветствие и установление контакта (0-10 баллов)
2. Выявление потребностей клиента (0-10 баллов)
3. Презентация услуг студии (0-10 баллов)
4. Работа с возражениями (0-10 баллов)
5. Закрытие сделки / запись на занятие (0-10 баллов)

Для каждого критерия укажи:
- Оценку
- Что было сделано хорошо
- Что можно улучшить
- Конкретные рекомендации

В конце дай общую оценку (0-50 баллов) и краткое резюме: довёл ли администратор продажу до конца, какие этапы были пропущены или отработаны слабо.

Диалог:
',
                TRUE
            )
        """)
    conn.commit()
    cur.close()
    conn.close()
