import os
from dotenv import load_dotenv
from util.logz import create_logger

load_dotenv() 
logger = create_logger()

MONGO_URI = os.environ.get("MONGODB_URI")
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
SECRET_KEY=os.getenv("SECRET_KEY")
MAIL_USERNAME=os.getenv("EMAIL_USER")
MAIL_PASSWORD=os.getenv("EMAIL_PW")
JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY")
PORT=os.getenv("PORT", default=8080)
DEBUG = os.getenv("DEBUG", "False").lower() == "true"