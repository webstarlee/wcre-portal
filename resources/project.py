import json
import db
import re
from flask_restful import Resource, reqparse
from flask import jsonify
from flask_jwt_extended import jwt_required
from helpers import price_format, multiple
from util.logz import create_logger
from util.msg import MSG_FIELD_DEFAULT
from util.parse_json import parse_json
import re

class GetProjectList(Resource):
    def __init__(self):
        self.logger = create_logger()

    parser = reqparse.RequestParser()
    parser.add_argument('page_num', type=str,
                        required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('items_per_page', type=str,
                        required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('sort_by_key', type=str,
                        required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('sort_by_order', type=str,
                        required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('search', type=str, required=True,
                        help=MSG_FIELD_DEFAULT)

    @jwt_required()  # Requires dat token
    def post(self):
        data = GetProjectList.parser.parse_args()
        page_num = data['page_num']
        items_per_page = data['items_per_page']
        sort_by_key = data['sort_by_key']
        sort_by_order = data['sort_by_order']
        search = data['search']
        
        order = 1
        if sort_by_order == "desc":
            order = -1
        skip = (int(page_num)-1)*int(items_per_page)

        search_query = {}
        if search:
            pattern = re.compile(f'.*{search}.*', re.IGNORECASE)
            symbol_query = {"symbol": pattern}
            token_query = {"token": pattern}
            group_query = {"group_id": pattern}
            search_query = {'$or': [symbol_query, token_query, group_query]}
            
        print(search_query)
        raw_projects = db.Project.find(search_query).limit(skip+int(items_per_page)).skip(skip).sort([(f'{sort_by_key}', order)])

        projects = []
        for raw in raw_projects:
            user = db.User.find_one({"user_id": raw["user_id"]})
            username = ""
            if user:
                username = user["username"]
            pair = db.Pair.find_one({"pair_address": raw["pair_address"]})
            projects.append({
                "_id": str(raw["_id"]),
                "ath": raw["ath"],
                "chain": raw["chain"],
                "created_at": str(raw["created_at"]),
                "group_id": raw["group_id"],
                "marketcap": float(raw["marketcap"]),
                "pair_address": raw["pair_address"],
                "pair_url": raw["pair_url"],
                "status": raw["status"],
                "symbol": raw["symbol"],
                "token": raw["token"],
                "user_id": raw["user_id"],
                "current_marketcap": float(pair["marketcap"]),
                "username": username
            })
        count = len(list(db.Project.find()))
        return parse_json({
            "total_count": count,
            "projects": projects
        })


class UpdateProject(Resource):
    def __init__(self):
        self.logger = create_logger()

    parser = reqparse.RequestParser()
    parser.add_argument('token', type=str, required=True,
                        help=MSG_FIELD_DEFAULT)
    parser.add_argument('pair_address', type=str,
                        required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('ath', type=str, required=True, help=MSG_FIELD_DEFAULT)
    parser.add_argument('status', type=str, required=True,
                        help=MSG_FIELD_DEFAULT)

    @jwt_required()  # Requires dat token
    def post(self):
        data = UpdateProject.parser.parse_args()
        token = data['token']
        pair_address = data['pair_address']
        ath = data['ath']
        status = data['status']
        db.Project.update_one({"$and": [{"token": token}, {"pair_address": pair_address}]}, {
                              "$set": {"ath": float(ath), "status": status}})
        return "return_data"
