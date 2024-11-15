import os
import boto3
import resources
import sentry_sdk
from flask_mail import Mail
from flask_cors import CORS
from flask_restful import Api
from datetime import timedelta
from flask_bcrypt import Bcrypt
from flask import Flask, send_from_directory, session
from flask_jwt_extended import JWTManager
from flask_apscheduler import APScheduler
from sentry_sdk.integrations.flask import FlaskIntegration
from config import (
    PORT,
    DEBUG,
    logger,
    SECRET_KEY,
    JWT_SECRET_KEY,
    SECRET_KEY,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY
)

sentry_sdk.init(
    dsn="https://903f368e70906f512655f4f4555be8c6@o4505664587694081.ingest.sentry.io/4505664611155968",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
)

try:
    logger.info("Initializing Portal")
    app = Flask(__name__, static_folder = "./client/dist")
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    app.config.update(
        CORS_HEADERS="Content-Type",
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=10),
        JWT_SECRET_KEY=JWT_SECRET_KEY,
        SECRET_KEY=SECRET_KEY,
        MAIL_SERVER="smtp.office365.com",
        MAIL_PORT=587,
        MAIL_USERNAME=MAIL_USERNAME,
        MAIL_PASSWORD=MAIL_PASSWORD,
        MAIL_USE_TLS=True,
        MAIL_USE_SSL=False,
        SCHEDULER_API_ENABLED=True,
        PERMANENT_SESSION_LIFETIME=timedelta(minutes=15),
        STATIC_URL_PATH="/static"
    )
    scheduler = APScheduler()
    scheduler.init_app(app)
    mail = Mail(app)
    bcrypt = Bcrypt(app)
    jwt = JWTManager(app)
    api = Api(app)
except Exception as e:
    logger.error("Error Initializing Portal")
else:
    logger.info("Initialization Successful")

@app.before_request
def refresh_session():
    session.modified = True

api.add_resource(resources.Info, '/api/info')
api.add_resource(resources.SignIn, '/api/signin')
api.add_resource(resources.GetLoginsList, '/api/logins')
api.add_resource(resources.GetInitialData, '/api/dashboard')
api.add_resource(resources.GetListings, '/api/listings/<page>')
api.add_resource(resources.ResetListings, '/api/listing/reset')
api.add_resource(resources.CheckListings, '/api/listing/check')
api.add_resource(resources.SaveListing, '/api/listing/upload')
api.add_resource(resources.UpdateListing, '/api/listing/update')
api.add_resource(resources.DeleteListings, '/api/listing/delete')
api.add_resource(resources.UploadFile, '/api/upload')
api.add_resource(resources.DownloadFile, '/api/download/<file_id>')
api.add_resource(resources.DownloadListingLCS, '/api/download/listing/lcs/<listing_id>')

api.add_resource(resources.ResetSales, '/api/sales/reset')
api.add_resource(resources.GetSales, '/api/sales/<page>')
api.add_resource(resources.SaveSale, '/api/sale/upload')
api.add_resource(resources.UpdateSale, '/api/sale/update')
api.add_resource(resources.DeleteSale, '/api/sale/delete')
api.add_resource(resources.DownloadSaleLCS, '/api/download/sale/lcs/<sale_id>')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)