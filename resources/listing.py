import db
import random
from flask_restful import Resource, reqparse
from flask import jsonify, session
from datetime import datetime
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
        total, listings_data = (
            (
                db.Listing.count_documents({}),
                db.Listing.aggregate([
                    {
                        "$lookup":
                            {
                                "from": "Users",
                                "let": { "brokers": '$brokers' },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$in": [
                                                    {
                                                        "$toString": "$_id"
                                                    },
                                                    "$$brokers"
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "as": "brokerObjects"
                            }
                    },
                    {"$sort": {"listing_entered_date": 1}},
                    {"$skip": (int(page) - 1) * per_page},
                    {"$limit": per_page}
                ])
            )
            if is_admin
            else (
                db.Listing.count_documents({"brokers": {"$in": [current_user['fullname']]}}),
                db.Listing.aggregate([
                    {
                        "$match": {
                            {"brokers": {"$in": [current_user['fullname']]}}
                        },
                    },
                    {
                        "$lookup":
                            {
                                "from": "Users",
                                "let": { "brokers": '$brokers' },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$in": [
                                                    {
                                                        "$toString": "$_id"
                                                    },
                                                    "$$brokers"
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "as": "brokerObjects"
                            }
                    },
                    {"$sort": {"listing_entered_date": 1}},
                    {"$skip": (int(page) - 1) * per_page},
                    {"$limit": per_page}
                ])
            )
        )
        
        final_listings = []
        for listing in listings_data:
            single_brokers = []
            if len(listing['brokerObjects']) > 0:
                for brokerObject in listing['brokerObjects']:
                    single_broker = {
                        "id": str(brokerObject['_id']),
                        "fullname": brokerObject['fullname'],
                        "profile_picture_url": brokerObject['profile_picture_url'],
                        "role": brokerObject['role'],
                        "username": brokerObject['username']
                    }

                    single_brokers.append(single_broker)

            single_listing = {
                "id": str(listing['_id']),
                "listing_street": listing['listing_street'],
                "listing_city": listing['listing_city'],
                "listing_state": listing['listing_state'],
                "listing_cover": listing['listing_cover'] if 'listing_cover' in listing else "",
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
                "listing_entered_date": listing['listing_entered_date'],
                "broker_users": single_brokers
            }
            
            final_listings.append(single_listing)
        
        broker_users = db.User.find({"role": "Broker"})
        final_brokers = []
        for broker_user in broker_users:
            single_broker = {
                "id": str(broker_user['_id']),
                "fullname": broker_user['fullname'],
                "profile_picture_url": broker_user['profile_picture_url'],
                "role": broker_user['role'],
                "username": broker_user['username']
            }
            final_brokers.append(single_broker)
        
        return jsonify(
            total=total,
            listings=final_listings,
            brokers=final_brokers
        )
    
class SaveListing(Resource):
    def __init__(self):
        self.logger = create_logger()
    
    parser = reqparse.RequestParser()
    parser.add_argument('listing_street', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_city', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_price', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('owner_entity', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_start', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_end', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('primary_contact', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('owner_email', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('owner_phone', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('broker_ids', action="append", required=True, help='This field cannot be left blank')
    parser.add_argument('property_type', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_state', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('cover', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('agreement', type=str, help='This field cannot be left blank')
    parser.add_argument('amendment', type=str, help='This field cannot be left blank')
    parser.add_argument('note', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_lat', type=int, required=True, help='This field cannot be left blank')
    parser.add_argument('listing_lng', type=int, required=True, help='This field cannot be left blank')

    @jwt_required()  # Requires dat token
    def post(self):
        data = SaveListing.parser.parse_args()
        listing_street=data['listing_street']
        listing_city=data['listing_city']
        listing_price=data['listing_price']
        owner_entity=data['owner_entity']
        listing_start=data['listing_start']
        listing_end=data['listing_end']
        primary_contact=data['primary_contact']
        owner_email=data['owner_email']
        owner_phone=data['owner_phone']
        broker_ids=data['broker_ids']
        property_type=data['property_type']
        listing_state=data['listing_state']
        cover=data['cover']
        agreement=data['agreement']
        amendment=data['amendment']
        note=data['note']
        listing_lat=data['listing_lat']
        listing_lng=data['listing_lng']

        new_listing = {
            "listing_street": listing_street,
            "listing_city": listing_city,
            "listing_state": listing_state,
            "listing_cover": cover,
            "listing_owner_name": primary_contact,
            "listing_owner_email": owner_email,
            "listing_owner_phone": owner_phone,
            "listing_start_date": listing_start,
            "listing_end_date": listing_end,
            "listing_property_type": property_type,
            "listing_price": listing_price,
            "listing_lat": listing_lat,
            "listing_long": listing_lng,
            "brokers": broker_ids,
            "listing_owner_entity": owner_entity,
            "listing_agreement_file_id": agreement,
            "listing_amendment_file_id": amendment,
            "listing_notes": note,
            "listing_entered_date": datetime.now().strftime("%m/%d/%Y")
        }

        print(new_listing)

        result = db.Listing.insert_one(new_listing)
        if not result.inserted_id:
            return jsonify(result=False, message="something went wrong")
        
        session['send_notification_for'] = str(result.inserted_id)
        return jsonify(result=True)
    
class ResetListings(Resource):
    def __init__(self):
        self.logger = create_logger()

    def get(self):
        listings = db.Listing.find({})
        for listing in listings:
            broker_ids = []
            if len(listing['brokers']) > 0:
                for broker_fullname in listing['brokers']:
                    user = db.User.find_one({"fullname": broker_fullname})
                    if user:
                        print(user["_id"])
                        broker_ids.append(str(user['_id']))
            print(broker_ids)
            db.Listing.update_one({"_id": listing['_id']}, {"$set": {"brokers": broker_ids}})
        
        return jsonify(
            total="asdfasdf"
        )


class CheckListings(Resource):
    def __init__(self):
        self.logger = create_logger()

    def get(self):
        # listings = db.Listing.aggregate([
        #     {
        #         "$sort": {"listing_entered_date": 1}
        #     },
        #     {
        #         "$skip": 0
        #     },
        #     {
        #         "$limit": 12
        #     },
        #     {
        #         "$lookup": {
        #             "from": "users",
                    # "pipeline": [
                    #     { 
                    #     "$match": 
                    #         { 
                    #         "$expr": { "$in": [ "_id", "$brokers" ] }
                    #         }  
                    #     }
                    # ],
        #             "as": "brokerDetails"
        #         }
        #     }])

        listings = db.Listing.aggregate([
            {
                "$lookup":
                    {
                        "from": "Users",
                        "let": { "brokers": '$brokers' },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            {
                                                "$toString": "$_id"
                                            },
                                            "$$brokers"
                                        ]
                                    }
                                }
                            }
                        ],
                        "as": "brokerObjects"
                    }
            },
            {"$sort": {"listing_entered_date": 1}},
            {"$skip": 0},
            {"$limit": 15}
        ])


        
        return parse_json(listings)