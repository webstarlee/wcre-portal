
from bson.objectid import ObjectId
from datetime import datetime

def process_mongo_data(data):
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, datetime):
        return data.isoformat()
    if isinstance(data, list):
        return [process_mongo_data(item) for item in data]
    if isinstance(data, dict):
        return {key: process_mongo_data(value) for key, value in data.items()}
    return data