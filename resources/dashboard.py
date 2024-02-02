import db
import arrow
from flask_restful import Resource
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from util.logz import create_logger
from helpers.format import greeting
from helpers import process_mongo_data

class GetInitialData(Resource):
    def __init__(self):
        self.logger = create_logger()

    @jwt_required()  # Requires dat token
    def get(self):
        current_user = get_jwt_identity()
        is_admin = current_user['role'] == "Admin"
        total_documents = db.Doc.count_documents({})
        current_time = arrow.now("EST")
        greeting_msg = f"{greeting(current_time)}, {current_user['fullname'].split()[0]}!"
        if not is_admin:
            total_listings = db.Listing.count_documents({"brokers": {"$in": [current_user['_id']['$oid']]}})
            total_sales = db.Sale.count_documents({"brokers": {"$in": [current_user['fullname']]}})
            total_leases = db.Lease.count_documents({"brokers": {"$in": [current_user['fullname']]}})
            latest_notifications = list(db.Notification.find({"user": current_user['fullname']}).sort("timestamp", -1).limit(8))
            processed_data = process_mongo_data(latest_notifications)
            return jsonify(
                totalListings=total_listings,
                totalSales=total_sales,
                totalDocuments=total_documents,
                totalLeases=total_leases,
                notifications=processed_data,
                greetingMsg=greeting_msg,
            )
        else:
            total_listings = db.Listing.count_documents({})
            total_sales = db.Sale.count_documents({})
            total_leases = db.Lease.count_documents({})
            latest_notifications = list(db.Notification.find({}).sort("timestamp", -1).limit(8))
            processed_data = process_mongo_data(latest_notifications)
            return jsonify(
                totalListings=total_listings,
                totalSales=total_sales,
                totalDocuments=total_documents,
                totalLeases=total_leases,
                notifications=processed_data,
                greetingMsg=greeting_msg,
            )