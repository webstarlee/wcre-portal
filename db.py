from pymongo import MongoClient
from util.logz import create_logger
from config import MONGO_URI, logger

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000,
    ) # your connection string

    db = client["wcre_dev"]

    User = db["Users"]
    Login = db["Logins"]
    Listing = db["Listings"]
    Sale = db["Sales"]
    Lease = db["Leases"]
    Doc = db["Documents"]
    Notification = db["Notifications"]
    
    logger.info("Connected to MongoDB Successfully")
except Exception as e:
    logger.error("Error Connecting to MongoDB")