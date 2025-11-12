import logging
import os

LOG_DIR = "log"
os.makedirs(LOG_DIR, exist_ok=True)

# -----------------------------
# Root logger: Supabase & HTTP requests
# -----------------------------
SUPABASE_LOG_FILE = os.path.join(LOG_DIR, "supabase.log")
logging.basicConfig(
    filename=SUPABASE_LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# -----------------------------
# Named logger: Daily job timestamps only
# -----------------------------
daily_job_logger = logging.getLogger("daily_job")
daily_job_logger.setLevel(logging.INFO)

daily_job_handler = logging.FileHandler(os.path.join(LOG_DIR, "daily_job.log"))
daily_job_handler.setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
)
daily_job_logger.addHandler(daily_job_handler)
daily_job_logger.propagate = False  # Avoid writing to supabase.log

# -----------------------------
# Named logger: Price Updates
# -----------------------------
price_job_logger = logging.getLogger("price_job")
price_job_logger.setLevel(logging.INFO)

price_job_handler = logging.FileHandler(os.path.join(LOG_DIR, "price_job.log"))
price_job_handler.setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
)
price_job_logger.addHandler(price_job_handler)
price_job_logger.propagate = False  # Avoid writing to supabase.log

