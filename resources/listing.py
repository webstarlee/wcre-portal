import db
from flask_restful import Resource
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from util.logz import create_logger

class GetListings(Resource):
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
            return jsonify(logins)