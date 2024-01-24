import db
import pytz
from datetime import datetime, timedelta
from flask import request
from flask_restful import Resource, reqparse
from flask import jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from util.logz import create_logger
from util.parse_json import parse_json
from flask_bcrypt import check_password_hash

class Info(Resource):
    def __init__(self):
        self.logger = create_logger()

    @jwt_required()  # Requires dat token
    def get(self):
        current_user = get_jwt_identity()
        return_user = {
            "fullname": current_user["fullname"],
            "username": current_user["username"],
            "user_id": current_user["_id"]['$oid'],
            "role":  current_user["role"],
            "avatar": current_user["profile_picture_url"],
        }
        return jsonify(return_user)

class SignIn(Resource):
    def __init__(self):
        self.logger = create_logger()

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help='This field cannot be left blank')
    parser.add_argument('password', type=str, required=True, help='This field cannot be left blank')

    def post(self):
        data = SignIn.parser.parse_args()
        username = data['username']
        password = data['password']

        user = parse_json(db.User.find_one({"username": username}))

        if not user or not check_password_hash(user['password'], password):
            return {'message': 'Wrong username or password.'}, 401
        
        access_token = create_access_token(identity=user)
        now_utc = datetime.now(pytz.timezone("UTC"))
        now_est = now_utc.astimezone(pytz.timezone("US/Eastern"))
        formatted_est = now_est.strftime("%Y-%m-%d %I:%M:%S %p %Z")
        log_entry = {
            "username": username,
            "login_time": formatted_est,
            "ip_address": request.remote_addr,
        }
        db.Login.insert_one(log_entry)
        
        return_user = {
            "fullname": user["fullname"],
            "username": user["username"],
            "user_id": user["_id"]['$oid'],
            "role":  user["role"],
            "avatar": user["profile_picture_url"],
            "token": access_token
        }
        
        return jsonify(return_user)

class GetLoginsList(Resource):
    def __init__(self):
        self.logger = create_logger()

    @jwt_required()  # Requires dat token
    def get(self):
        current_user = get_jwt_identity()
        is_admin = current_user['role'] == "Admin"
        if not is_admin:
            return {'message': 'Permission denied.'}, 400
        else:
            logins = list(db.Login.find({}).sort("login_time", -1))
            for login in logins:
                login['login_time'] = datetime.strptime(login['login_time'][:-4], "%Y-%m-%d %I:%M:%S %p")
                login['_id'] = str(login['_id'])
            return jsonify(logins)