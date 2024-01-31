import boto3
import uuid
import os
from botocore.exceptions import NoCredentialsError
from flask_restful import Resource, reqparse
from flask import jsonify
from flask_jwt_extended import jwt_required
from config import AWS_ACCESS_KEY, AWS_SECRET_KEY
from util.logz import create_logger
from werkzeug.datastructures import FileStorage

class UploadFile(Resource):
    def __init__(self):
        self.logger = create_logger()
    
    parser = reqparse.RequestParser()
    parser.add_argument('cover', type=FileStorage, location='files')
    parser.add_argument('agreement', type=FileStorage, location='files')
    parser.add_argument('amendment', type=FileStorage, location='files')

    @jwt_required()  # Requires dat token
    def post(self):
        AWS_S3_BUCKET = 'wcre-documents'
        s3 = boto3.client('s3', 
            aws_access_key_id=AWS_ACCESS_KEY, 
            aws_secret_access_key=AWS_SECRET_KEY, 
            region_name='us-east-2')
        
        data = UploadFile.parser.parse_args()
        cover_file = data['cover']
        cover_binary_data = cover_file.read()
        cover_content_type = cover_file.content_type
        cover_extension = cover_file.filename.split('.')[-1] if '.' in cover_file.filename else ''
        cover_object_name = f"{uuid.uuid4()}.{cover_extension}"
        try:
            s3.put_object(Body=cover_binary_data, Bucket=AWS_S3_BUCKET, Key=cover_object_name, ContentType=cover_content_type)
        except NoCredentialsError:
            return jsonify({"success": False, "error": "Credentials Not Available"})
        
        amendment_object_name=""
        agreement_object_name=""
        if data['agreement']:
            agreement_file = data['agreement']
            agreement_binary_data = agreement_file.read()
            agreement_content_type = agreement_file.content_type
            agreement_extension = agreement_file.filename.split('.')[-1] if '.' in agreement_file.filename else ''
            agreement_object_name = f"{uuid.uuid4()}.{agreement_extension}"
            try:
                s3.put_object(Body=agreement_binary_data, Bucket=AWS_S3_BUCKET, Key=agreement_object_name, ContentType=agreement_content_type)
            except NoCredentialsError:
                return jsonify({"success": False, "error": "Credentials Not Available"})
            
        if data['amendment']:
            amendment_file = data['amendment']
            amendment_binary_data = amendment_file.read()
            amendment_content_type = amendment_file.content_type
            amendment_extension = amendment_file.filename.split('.')[-1] if '.' in amendment_file.filename else ''
            amendment_object_name = f"{uuid.uuid4()}.{amendment_extension}"
            try:
                s3.put_object(Body=amendment_binary_data, Bucket=AWS_S3_BUCKET, Key=amendment_object_name, ContentType=amendment_content_type)
            except NoCredentialsError:
                return jsonify({"success": False, "error": "Credentials Not Available"})
            

        return jsonify(
            cover=cover_object_name,
            agreement=agreement_object_name,
            amendment=amendment_object_name,
        )
        