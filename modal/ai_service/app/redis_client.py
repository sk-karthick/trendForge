import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_HOST")

redis_client = redis.from_url(REDIS_URL)
