import db
from flask_restful import Resource
from flask import jsonify
from flask_paginate import Pagination, get_page_args
from flask_jwt_extended import jwt_required, get_jwt_identity
from util.logz import create_logger
from util.parse_json import parse_json

class GetListings(Resource):
    def __init__(self):
        self.logger = create_logger()

    @jwt_required()  # Requires dat token
    def get(self, page=1):
        current_user = get_jwt_identity()
        is_admin = current_user['role'] == "Admin"
        per_page = 15
        sort_order = [("listing_entered_date", 1)]  
        total, listings_data = (
            (
                db.Listing.count_documents({}),
                db.Listing.find()
                .sort(sort_order)  
                .skip((int(page) - 1) * per_page)
                .limit(per_page),
            )
            if is_admin
            else (
                db.Listing.count_documents({"brokers": {"$in": [current_user['fullname']]}}),
                db.Listing.find({"brokers": {"$in": [current_user['fullname']]}})
                .sort(sort_order) 
                .skip((int(page) - 1) * per_page)
                .limit(per_page),
            )
        )
        
        final_listings = []
        for listing in listings_data:
            single_listing = {
                "id": str(listing['_id']),
                "listing_street": listing['listing_street'],
                "listing_city": listing['listing_city'],
                "listing_state": listing['listing_state'],
                "listing_owner_entity": listing['listing_owner_entity'],
                "listing_owner_name": listing['listing_owner_name'],
                "listing_owner_email": listing['listing_owner_email'],
                "listing_owner_phone": listing['listing_owner_phone'],
                "listing_end_date": listing['listing_end_date'],
                "listing_start_date": listing['listing_start_date'],
                "listing_property_type": listing['listing_property_type'],
                "listing_lat": listing['listing_lat'],
                "listing_long": listing['listing_long'],
                "listing_notes": listing['listing_notes'],
                "listing_price": listing['listing_price'],
                "brokers": listing['brokers'],
                "listing_agreement_file_id": listing['listing_agreement_file_id'],
                "listing_amendment_file_id": listing['listing_amendment_file_id'],
                "listing_entered_date": listing['listing_entered_date']
            }
            
            final_listings.append(single_listing)
        
        return jsonify(
            total=total,
            listings=final_listings
        )