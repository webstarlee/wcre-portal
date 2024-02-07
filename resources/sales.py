import db
import random
from flask_restful import Resource, reqparse
from flask import jsonify, session, Response
from datetime import datetime
from flask_paginate import Pagination, get_page_args
from flask_jwt_extended import jwt_required, get_jwt_identity
from util.logz import create_logger
from util.parse_json import parse_json
from bson.objectid import ObjectId
from ics import Calendar, Event
import arrow

class GetSales(Resource):
    def __init__(self):
        self.logger = create_logger()

    @jwt_required()  # Requires dat token
    def get(self, page=1):
        current_user = get_jwt_identity()
        is_admin = current_user['role'] == "Admin"
        current_user_id = current_user['_id']['$oid']
        per_page = 15
        total, sales_data = (
            (
                db.Sale.count_documents({}),
                db.Sale.aggregate([
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
                    {"$sort": {"sale_entered_date": -1}},
                    {"$skip": (int(page) - 1) * per_page},
                    {"$limit": per_page}
                ])
            )
            if is_admin
            else (
                db.Sale.count_documents({"brokers": {"$in": [str(current_user_id)]}}),
                db.Sale.aggregate([
                    {
                        "$match": {
                            "brokers": {"$in": [str(current_user_id)]}
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
                    {"$sort": {"sale_entered_date": -1}},
                    {"$skip": (int(page) - 1) * per_page},
                    {"$limit": per_page}
                ])
            )
        )
        
        final_sales = []
        for sale in sales_data:
            single_brokers = []
            if len(sale['brokerObjects']) > 0:
                for brokerObject in sale['brokerObjects']:
                    single_broker = {
                        "id": str(brokerObject['_id']),
                        "fullname": brokerObject['fullname'],
                        "profile_picture_url": brokerObject['profile_picture_url'],
                        "role": brokerObject['role'],
                        "username": brokerObject['username']
                    }

                    single_brokers.append(single_broker)

            single_sale = {
                "id": str(sale['_id']),
                "sale_street": sale['sale_street'],
                "sale_city": sale['sale_city'],
                "sale_state": sale['sale_state'],
                "sale_cover": sale['sale_cover'] if 'sale_cover' in sale else "",
                "sale_sqft": sale['sale_sqft'],
                "sale_seller_entity": sale['sale_seller_entity'],
                "sale_seller_name": sale['sale_seller_name'],
                "sale_seller_email": sale['sale_seller_email'],
                "sale_seller_phone": sale['sale_seller_phone'],
                "sale_buyer_entity": sale['sale_buyer_entity'],
                "sale_buyer_name": sale['sale_buyer_name'],
                "sale_buyer_email": sale['sale_buyer_email'],
                "sale_buyer_phone": sale['sale_buyer_phone'],
                "sale_end_date": sale['sale_end_date'],
                "sale_property_type": sale['sale_property_type'],
                "sale_type": sale['sale_type'],
                "sale_price": sale['sale_price'],
                "sale_commission": sale['sale_commission'],
                "brokers": sale['brokers'],
                "sale_agreement_file_id": sale['sale_agreement_file_id'],
                "sale_notes": sale['sale_notes'],
                "sale_entered_date": sale['sale_entered_date'],
                "broker_users": single_brokers
            }
            
            final_sales.append(single_sale)
        
        broker_users = db.User.find({})
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
            sales=final_sales,
            brokers=final_brokers
        )

class SaveSale(Resource):
    def __init__(self):
        self.logger = create_logger()
    
    parser = reqparse.RequestParser()
    parser.add_argument('sale_cover', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_street', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_city', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_state', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_sqft', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_entity', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_name', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_email', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_phone', type=str, required=True, help='This field cannot be left blank')

    parser.add_argument('sale_buyer_entity', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_name', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_email', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_phone', type=str, required=True, help='This field cannot be left blank')

    parser.add_argument('sale_end_date', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_property_type', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('brokers', action="append", required=True, help='This field cannot be left blank')
    parser.add_argument('sale_type', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_price', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_commission', type=str, help='This field cannot be left blank')
    parser.add_argument('sale_agreement_file_id', type=str, help='This field cannot be left blank')
    parser.add_argument('sale_notes', type=str, required=True, help='This field cannot be left blank')

    @jwt_required()  # Requires dat token
    def post(self):
        current_user = get_jwt_identity()
        data = SaveSale.parser.parse_args()
        sale_cover=data['sale_cover']
        sale_street=data['sale_street']
        sale_city=data['sale_city']
        sale_state=data['sale_state']
        sale_sqft=data['sale_sqft']
        sale_seller_entity=data['sale_seller_entity']
        sale_seller_name=data['sale_seller_name']
        sale_seller_email=data['sale_seller_email']
        sale_seller_phone=data['sale_seller_phone']
        sale_buyer_entity=data['sale_buyer_entity']
        sale_buyer_name=data['sale_buyer_name']
        sale_buyer_email=data['sale_buyer_email']
        sale_buyer_phone=data['sale_buyer_phone']
        sale_end_date=data['sale_end_date']
        sale_property_type=data['sale_property_type']
        brokers=data['brokers']
        sale_type=data['sale_type']
        sale_price=data['sale_price']
        sale_commission=data['sale_commission']
        sale_agreement_file_id=data['sale_agreement_file_id']
        sale_notes=data['sale_notes']

        new_sale = {
            "sale_cover": sale_cover,
            "sale_street": sale_street,
            "sale_city": sale_city,
            "sale_state": sale_state,
            "sale_sqft": sale_sqft,
            "sale_seller_entity": sale_seller_entity,
            "sale_seller_name": sale_seller_name,
            "sale_seller_email": sale_seller_email,
            "sale_seller_phone": sale_seller_phone,
            "sale_buyer_entity": sale_buyer_entity,
            "sale_buyer_name": sale_buyer_name,
            "sale_buyer_email": sale_buyer_email,
            "sale_buyer_phone": sale_buyer_phone,
            "sale_end_date": sale_end_date,
            "sale_property_type": sale_property_type,
            "brokers": brokers,
            "sale_type": sale_type,
            "sale_price": sale_price,
            "sale_commission": sale_commission,
            "sale_agreement_file_id": sale_agreement_file_id,
            "sale_notes": sale_notes,
            "sale_entered_date": datetime.utcnow()
        }

        result = db.Sale.insert_one(new_sale)
        if not result.inserted_id:
            return jsonify(result=False, message="something went wrong")
        
        session['send_notification_for'] = str(result.inserted_id)
        self.logger.info("New Sale Submitted By " + current_user['fullname'])
        return jsonify(result=True)

class UpdateSale(Resource):
    def __init__(self):
        self.logger = create_logger()
    
    parser = reqparse.RequestParser()
    parser.add_argument('id', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_cover', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_street', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_city', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_state', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_sqft', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_entity', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_name', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_email', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_seller_phone', type=str, required=True, help='This field cannot be left blank')

    parser.add_argument('sale_buyer_entity', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_name', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_email', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_buyer_phone', type=str, required=True, help='This field cannot be left blank')

    parser.add_argument('sale_end_date', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_property_type', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('brokers', action="append", required=True, help='This field cannot be left blank')
    parser.add_argument('sale_type', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_price', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('sale_commission', type=str, help='This field cannot be left blank')
    parser.add_argument('sale_agreement_file_id', type=str, help='This field cannot be left blank')
    parser.add_argument('sale_notes', type=str, required=True, help='This field cannot be left blank')

    @jwt_required()  # Requires dat token
    def post(self):
        data = UpdateSale.parser.parse_args()
        sale_id=data['id']
        sale_cover=data['sale_cover']
        sale_street=data['sale_street']
        sale_city=data['sale_city']
        sale_state=data['sale_state']
        sale_sqft=data['sale_sqft']
        sale_seller_entity=data['sale_seller_entity']
        sale_seller_name=data['sale_seller_name']
        sale_seller_email=data['sale_seller_email']
        sale_seller_phone=data['sale_seller_phone']
        sale_buyer_entity=data['sale_buyer_entity']
        sale_buyer_name=data['sale_buyer_name']
        sale_buyer_email=data['sale_buyer_email']
        sale_buyer_phone=data['sale_buyer_phone']
        sale_end_date=data['sale_end_date']
        sale_property_type=data['sale_property_type']
        brokers=data['brokers']
        sale_type=data['sale_type']
        sale_price=data['sale_price']
        sale_commission=data['sale_commission']
        sale_agreement_file_id=data['sale_agreement_file_id']
        sale_notes=data['sale_notes']

        edit_sale = {
            "sale_cover": sale_cover,
            "sale_street": sale_street,
            "sale_city": sale_city,
            "sale_state": sale_state,
            "sale_sqft": sale_sqft,
            "sale_seller_entity": sale_seller_entity,
            "sale_seller_name": sale_seller_name,
            "sale_seller_email": sale_seller_email,
            "sale_seller_phone": sale_seller_phone,
            "sale_buyer_entity": sale_buyer_entity,
            "sale_buyer_name": sale_buyer_name,
            "sale_buyer_email": sale_buyer_email,
            "sale_buyer_phone": sale_buyer_phone,
            "sale_end_date": sale_end_date,
            "sale_property_type": sale_property_type,
            "brokers": brokers,
            "sale_type": sale_type,
            "sale_price": sale_price,
            "sale_commission": sale_commission,
            "sale_agreement_file_id": sale_agreement_file_id,
            "sale_notes": sale_notes,
        }

        db.Sale.update_one({"_id": ObjectId(sale_id)}, {"$set": edit_sale})
        
        single_sale = db.Sale.find_one({"_id": ObjectId(sale_id)})
        if not single_sale:
            return jsonify(result=False, message="something went wrong")
        
        broker_object_ids = []
        for single_broker_id in brokers:
            broker_object_ids.append(ObjectId(single_broker_id))
        
        listing_brokers = db.User.find({"_id": {"$in": broker_object_ids}})
        # print(listing_brokers)
        single_brokers = []
        for listing_broker in listing_brokers:
            single_broker = {
                "id": str(listing_broker['_id']),
                "fullname": listing_broker['fullname'],
                "profile_picture_url": listing_broker['profile_picture_url'],
                "role": listing_broker['role'],
                "username": listing_broker['username']
            }

            single_brokers.append(single_broker)
        
        edit_sale['id'] = sale_id
        edit_sale['broker_users'] = single_brokers

        return jsonify(result=True, sale=edit_sale)

class DeleteSale(Resource):
    def __init__(self):
        self.logger = create_logger()
    
    parser = reqparse.RequestParser()
    parser.add_argument('sale_id', type=str, required=True, help='This field cannot be left blank')

    def post(self):
        data = DeleteSale.parser.parse_args()
        sale_id=data['sale_id']
        sale = db.Sale.find_one({"_id": ObjectId(sale_id)})
        if sale:
            db.Sale.delete_one({"_id": ObjectId(sale_id)})
            return jsonify(result=True)
        
        return jsonify(result=False)

class DownloadSaleLCS(Resource):
    def __init__(self):
        self.logger = create_logger()

    def get(self, sale_id):
        sale = db.Sale.find_one({"_id": ObjectId(sale_id)})
        if not sale:
            return jsonify({"success": False, "message": "Sale not found"})
        
        c = Calendar()
        e = Event()
        e.name = f"Listing Closing Date: {sale['sale_street']}"
        e.begin = arrow.get(sale['sale_end_date'], "MM/DD/YYYY").format("YYYY-MM-DD")
        e.make_all_day()
        c.events.add(e)
        response = Response(c.serialize(), mimetype="text/calendar")
        response.headers["Content-Disposition"] = f"attachment; filename=Sale_{sale['sale_street']}.ics"
        return response
    
class ResetSales(Resource):
    def __init__(self):
        self.logger = create_logger()

    def get(self):
        sales = db.Sale.find({})
        for sale in sales:
            broker_ids = []
            if len(sale['brokers']) > 0:
                for broker_fullname in sale['brokers']:
                    user = db.User.find_one({"fullname": broker_fullname})
                    if user:
                        print(user["_id"])
                        broker_ids.append(str(user['_id']))
            print(broker_ids)
            datetime_object = datetime.strptime(sale['sale_entered_date'], '%m/%d/%Y')
            # utc_datetime = datetime_object.astimezone(datetime.timezone.utc)
            db.Sale.update_one({"_id": sale['_id']}, {"$set": {"sale_entered_date": datetime_object, "brokers": broker_ids}})
            print(datetime_object)

        
        return jsonify(
            total="asdfasdf"
        )