import os
from flask import (
    Flask,
    jsonify,
    make_response,
    render_template,
    redirect,
    url_for,
    request,
)
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    current_user,
    login_required,
)
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from models import User
from flask_paginate import Pagination, get_page_args
from bson.objectid import ObjectId
from gridfs import GridFS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask import Flask, Response
from datetime import datetime
import pytz
from ics import Calendar, Event
import arrow
import base64
from flask_mail import Mail, Message
from premailer import transform
from flask_talisman import Talisman
import logging
import sentry_sdk
from flask import Flask
from sentry_sdk.integrations.flask import FlaskIntegration

ALLOWED_EXTENSIONS = {"pdf"}
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%d/%b/%Y %H:%M:%S",
)
logger = logging.getLogger(__name__)


sentry_sdk.init(
    dsn="https://903f368e70906f512655f4f4555be8c6@o4505664587694081.ingest.sentry.io/4505664611155968",
    integrations=[
        FlaskIntegration(),
    ],
    traces_sample_rate=1.0,
)


try:
    app = Flask(__name__)
    app.config["MAIL_SERVER"] = "smtpout.secureserver.net"
    app.config["MAIL_PORT"] = 465
    app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")
    app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PW")
    app.config["MAIL_USE_TLS"] = False
    app.config["MAIL_USE_SSL"] = True
    mail = Mail(app)
    load_dotenv()
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    login_manager = LoginManager(app)
    login_manager.login_view = "login"
    bcrypt = Bcrypt(app)
    mongodb_uri = os.environ.get("MONGODB_URI")
except Exception as e:
    print(f"Error Starting Flask App: {str(e)}")

try:
    client = MongoClient(
        mongodb_uri,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000,
    )
    db = client["wcre_panel"]
    users = db["users"]
    logins = db["logins"]
    listings = db["Listings"]
    sales = db["Sales"]
    leases = db["Leases"]
    docs = db["Documents"]
    fs = GridFS(db)
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {str(e)}")


@app.route("/")
def login_page():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = load_user(request.form["username"])
        if user and bcrypt.check_password_hash(user.password, request.form["password"]):
            login_user(user)
            now_utc = datetime.now(pytz.timezone("UTC"))
            now_est = now_utc.astimezone(pytz.timezone("US/Eastern"))
            formatted_est = now_est.strftime("%Y-%m-%d %I:%M:%S %p %Z")
            log_entry = {
                "username": request.form["username"],
                "login_time": formatted_est,
                "ip_address": request.remote_addr,
            }
            logins.insert_one(log_entry)
            return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="Invalid Username or Password")
    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


@login_manager.user_loader
def load_user(username):
    u = users.find_one({"username": username})
    return (
        User(
            u["username"],
            u["password"],
            u["role"],
            u["fullname"],
            u.get("profile_picture_url"),
        )
        if u
        else None
    )


def greeting(current_time):
    if current_time.hour < 12:
        return "Good Morning"
    elif 12 <= current_time.hour < 18:
        return "Good Afternoon"
    else:
        return "Good Evening"

@app.route("/dashboard")
@login_required
def dashboard():
    total_listings = listings.count_documents({})
    total_sales = sales.count_documents({})
    total_leases = leases.count_documents({})
    total_documents = docs.count_documents({})
    current_time = arrow.now("EST")
    greeting_msg = f"{greeting(current_time)}, {current_user.fullname.split()[0]}!"
    return render_template(
        "dashboard.html",
        total_listings=total_listings,
        total_sales=total_sales,
        total_documents=total_documents,
        total_leases=total_leases,
        greeting_msg=greeting_msg,
    )


@app.route("/listings")
@login_required
def view_listings():
    is_admin = current_user.role == "Admin"
    if current_user.is_authenticated:
        page, per_page, _ = get_page_args(
            page_parameter="page", per_page_parameter="per_page"
        )
        per_page = 12

        total, listings_data = (
            (
                listings.count_documents({}),
                listings.find()
                .sort("_id", -1)
                .skip((page - 1) * per_page)
                .limit(per_page),
            )
            if current_user.role == "Admin"
            else (
                listings.count_documents({"brokers": {"$in": [current_user.fullname]}}),
                listings.find({"brokers": {"$in": [current_user.fullname]}})
                .skip((page - 1) * per_page)
                .limit(per_page),
            )
        )
        pagination = Pagination(
            page=page, per_page=per_page, total=total, css_framework="bootstrap4"
        )
        return render_template(
            "listings.html",
            listings=listings_data,
            pagination=pagination,
            is_admin=is_admin,
            listing_count=total,
        )
    return redirect(url_for("login"))


@app.route("/sales")
@login_required
def view_sales():
    is_admin = current_user.role == "Admin"
    if current_user.is_authenticated:
        page, per_page, _ = get_page_args(
            page_parameter="page", per_page_parameter="per_page"
        )
        per_page = 12
        total, sales_data = (
            (
                sales.count_documents({}),
                sales.find().skip((page - 1) * per_page).limit(per_page),
            )
            if current_user.role == "Admin"
            else (
                sales.count_documents({"brokers": {"$in": [current_user.fullname]}}),
                sales.find({"brokers": {"$in": [current_user.fullname]}})
                .skip((page - 1) * per_page)
                .limit(per_page),
            )
        )
        pagination = Pagination(
            page=page, per_page=per_page, total=total, css_framework="bootstrap4"
        )
        return render_template(
            "sales.html",
            sales=sales_data,
            pagination=pagination,
            is_admin=is_admin,
            sale_count=total,
        )
    return redirect(url_for("login"))


@app.route("/leases")
@login_required
def view_leases():
    is_admin = current_user.role == "Admin"
    if current_user.is_authenticated:
        page, per_page, _ = get_page_args(
            page_parameter="page", per_page_parameter="per_page"
        )
        per_page = 12
        total, leases_data = (
            (
                leases.count_documents({}),
                leases.find().skip((page - 1) * per_page).limit(per_page),
            )
            if current_user.role == "Admin"
            else (
                leases.count_documents({"brokers": {"$in": [current_user.fullname]}}),
                leases.find({"brokers": {"$in": [current_user.fullname]}})
                .skip((page - 1) * per_page)
                .limit(per_page),
            )
        )
        pagination = Pagination(
            page=page, per_page=per_page, total=total, css_framework="bootstrap4"
        )
        return render_template(
            "leases.html",
            leases=leases_data,
            pagination=pagination,
            is_admin=is_admin,
            lease_count=total,
        )
    return redirect(url_for("login"))


@app.route("/get_documents")
@login_required
def get_documents():
    document_type = request.args.get("document_type")
    documents = list(db['Documents'].find({'document_type': document_type}))
    for document in documents:
        document["_id"] = str(document["_id"])
    return jsonify(documents)



@app.route("/documents")
@login_required
def documents():
    is_admin = current_user.role == "Admin"
    greeting_msg = f"Marketing Dashboard - Document View"
    document_types = [
        "Office Collaterals", "Industrial Collaterals", "Investment Collaterals", 
        "Healthcare Collaterals", "Retail Collaterals", "BOV Reports", 
        "Quarterly Reports", "Key Marketing Pieces"
    ]
    document_counts = {}
    for document_type in document_types:
        document_counts[document_type] = db['Documents'].count_documents({'document_type': document_type})
    return render_template(
        "documents.html",
        document_types=document_types,
        document_counts=document_counts,
        is_admin=is_admin,
        greeting_msg=greeting_msg,
    )


@app.route("/download_listing_pdf/<listing_id>", methods=["GET"])
@login_required
def download_listing_pdf(listing_id):
    listing = listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        return "No Listing Found", 404
    pdf_file_base64 = listing.get("pdf_file_base64")
    if not pdf_file_base64:
        return "No PDF Found for This Listing", 404
    pdf_file_data = base64.b64decode(pdf_file_base64)
    response = make_response(pdf_file_data)
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set("Content-Disposition", "attachment", filename="listing.pdf")
    return response


@app.route("/download_sale_pdf/<sale_id>", methods=["GET"])
@login_required
def download_sale_pdf(sale_id):
    sale = sales.find_one({"_id": ObjectId(sale_id)})
    if not sale:
        return "No Sale Found", 404
    pdf_file_base64 = sale.get("pdf_file_base64")
    if not pdf_file_base64:
        return "No PDF Found for This Sale", 404
    pdf_file_data = base64.b64decode(pdf_file_base64)
    response = make_response(pdf_file_data)
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set("Content-Disposition", "attachment", filename="sale.pdf")
    return response


@app.route("/upload_pdf", methods=["POST"])
@login_required
def upload_pdf():
    if "file" not in request.files:
        return {"success": False, "error": "No File Part"}
    file = request.files["file"]
    if file.filename == "":
        return {"success": False, "error": "No Selected File"}
    if file and allowed_file(file.filename):
        file_binary_data = file.read()
        file_base64_data = base64.b64encode(file_binary_data).decode()
        return {"success": True, "fileBase64": file_base64_data}
    else:
        return {"success": False, "error": "Allowed File Types Are .pdf"}


@app.route("/upload_document_pdf", methods=["POST"])
@login_required
def upload_document_pdf():
    if "file" not in request.files:
        return {"success": False, "error": "No File Part"}
    file = request.files["file"]
    if file.filename == "":
        return {"success": False, "error": "No Selected File"}

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_binary_data = file.read()
        file_base64_data = base64.b64encode(file_binary_data).decode()
        return {"success": True, "fileBase64": file_base64_data}
    else:
        return {"success": False, "error": "Allowed File Types Are .pdf"}


@app.route("/submit_document", methods=["POST"])
@login_required
def submit_document():
    if request.method == "POST":
        document_file_base64 = request.form.get("document-file-base64")
        document_type = request.form.get("document-type")
        document_name = request.form.get("document-name")
        new_document = {
            "document_name": document_name,
            "document_type": document_type,
            "pdf_file_base64": document_file_base64,
        }

        try:
            result = docs.insert_one(new_document)
        except:
            return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Error Occurred While Submitting The Document",
                        }
                    ),
                    500,
                )
        else:
            if result.inserted_id:
                return make_response(
                    {"status": "success", "redirect": url_for("documents")}, 200
                )
            else:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Error Occurred While Submitting The Document",
                        }
                    ),
                    500,
                )


@app.route("/submit_listing", methods=["POST"])
@login_required
def submit_listing():
    if request.method == "POST":
        try:
            listing_street = request.form.get("listing-street")
            listing_city = request.form.get("listing-city")
            listing_state = request.form.get("listing-state")
            listing_owner = request.form.get("listing-owner-name")
            listing_email = request.form.get("listing-owner-email")
            listing_phone = request.form.get("listing-owner-phone")
            listing_brokers = request.form.getlist("brokers[]")
            listing_end_date = request.form.get("listing-end-date")
            listing_start_date = request.form.get("listing-start-date")
            listing_agreement_file_base64 = request.form.get(
                "listing-agreement-file-base64"
            )
            listing_property_type = request.form.get("listing-property-type")
            listing_type = request.form.get("listing-type")
            listing_investment_sale = request.form.get("investment-sale")
            listing_price = request.form.get("listing-price")

            if listing_state == "NJ":
                listing_state = "New Jersey"
            elif listing_state == "PA":
                listing_state = "Pennsylvania"

            new_listing = {
                "listing_street": listing_street,
                "listing_city": listing_city,
                "listing_state": listing_state,
                "listing_owner": listing_owner,
                "listing_email": listing_email,
                "listing_phone": listing_phone,
                "brokers": listing_brokers,
                "pdf_file_base64": listing_agreement_file_base64,
                "listing_end_date": listing_end_date,
                "listing_start_date": listing_start_date,
                "listing_property_type": listing_property_type,
                "listing_type": listing_type,
                "listing_investment_sale": listing_investment_sale,
                "listing_price": listing_price,
            }

            result = listings.insert_one(new_listing)
            if result.inserted_id:
                msg = Message(
                    "WCRE Portal - A New Listing Has Been Submitted",
                    sender="portal@wolfcre.com",
                    recipients=["nathanwolf100@gmail.com", "jason.wolf@wolfcre.com"],
                )
                email_content = render_template(
                    "email_templates/email_new_listing.html", listing=new_listing
                )
                msg.html = transform(email_content)
                mail.send(msg)
                return make_response(
                    {"status": "success", "redirect": url_for("view_listings")}, 200
                )
            else:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Error Occurred While Submitting The Listing",
                        }
                    ),
                    500,
                )
        except Exception as e:
            logger.error(e)
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Error Occurred While Submitting The Listing",
                    }
                ),
                500,
            )
    return redirect(url_for("login"))


@app.route("/submit_sale", methods=["POST"])
@login_required
def submit_sale():
    if request.method == "POST":
        try:
            sale_street = request.form.get("sale-street")
            sale_city = request.form.get("sale-city")
            sale_state = request.form.get("sale-state")
            sale_sqft = request.form.get("sale-sqft")
            sale_seller = request.form.get("sale-seller-name")
            sale_seller_entity = request.form.get("sale-seller-entity")
            sale_seller_email = request.form.get("sale-seller-email")
            sale_seller_phone = request.form.get("sale-seller-phone")
            sale_buyer = request.form.get("sale-buyer-name")
            sale_buyer_email = request.form.get("sale-buyer-email")
            sale_buyer_phone = request.form.get("sale-buyer-phone")
            sale_brokers = request.form.getlist("brokers[]")
            sale_end_date = request.form.get("sale-end-date")
            sale_agreement_file_base64 = request.form.get("sale-agreement-file-base64")
            sale_property_type = request.form.get("sale-property-type")
            sale_type = request.form.get("sale-type")
            sale_price = request.form.get("sale-price")

            if sale_state == "NJ":
                sale_state = "New Jersey"
            elif sale_state == "PA":
                sale_state == "Pennsylvania"

            new_sale = {
                "sale_street": sale_street,
                "sale_city": sale_city,
                "sale_state": sale_state,
                "sale_property_type": sale_property_type,
                "sale_sqft": sale_sqft,
                "sale_seller": sale_seller,
                "sale_seller_entity": sale_seller_entity,
                "sale_seller_email": sale_seller_email,
                "sale_seller_phone": sale_seller_phone,
                "sale_buyer": sale_buyer,
                "sale_buyer_email": sale_buyer_email,
                "sale_buyer_phone": sale_buyer_phone,
                "brokers": sale_brokers,
                "pdf_file_base64": sale_agreement_file_base64,
                "sale_end_date": sale_end_date,
                "sale_type": sale_type,
                "sale_price": sale_price,
            }

            result = sales.insert_one(new_sale)
            if result.inserted_id:
                msg = Message(
                    "WCRE Portal - A New Sale Has Been Submitted",
                    sender="portal@wolfcre.com",
                    recipients=["nathanwolf100@gmail.com", "jason.wolf@wolfcre.com"],
                )
                email_content = render_template(
                    "email_templates/email_new_sale.html", sale=new_sale
                )
                msg.html = transform(email_content)
                mail.send(msg)
                return make_response(
                    {"status": "success", "redirect": url_for("view_sales")}, 200
                )
            else:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Error Occurred While Submitting The Listing",
                        }
                    ),
                    500,
                )
        except Exception as e:
            logger.error(e)
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Error Occurred While Submitting The Listing",
                    }
                ),
                500,
            )
    return redirect(url_for("login"))


@app.route("/submit_lease", methods=["POST"])
@login_required
def submit_lease():
    return


@app.route("/delete_listing/<listing_id>", methods=["GET"])
@login_required
def delete_listing(listing_id):
    try:
        result = listings.delete_one({"_id": ObjectId(listing_id)})
    except:
        return {
            "success": False,
            "message": "Listing Not Found or Couldn't Be Deleted",
        }, 404
    else:
        if result.deleted_count > 0:
            return {"success": True}, 200
        else:
            return {
                "success": False,
                "message": "Listing Not Found or Couldn't Be Deleted",
            }, 404


@app.route("/delete_sale/<sale_id>", methods=["GET"])
@login_required
def delete_sale(sale_id):
    try:
        result = sales.delete_one({"_id": ObjectId(sale_id)})
    except:
        return {
            "success": False,
            "message": "Sale Not Found or Couldn't Be Deleted",
        }, 404
    else:
        if result.deleted_count > 0:
            return {"success": True}, 200
        else:
            return {
                "success": False,
                "message": "Sale Not Found or Couldn't Be Deleted",
            }, 404
        
@app.route("/delete_document/<document_id>", methods=["GET"])
@login_required
def delete_document(document_id):
    try:
        result = docs.delete_one({"_id": ObjectId(document_id)})
    except:
        return {
            "success": False,
            "message": "Document Not Found or Couldn't Be Deleted",
        }, 404
    else:
        if result.deleted_count > 0:
            return {"success": True}, 200
        else:
            return {
                "success": False,
                "message": "Document Not Found or Couldn't Be Deleted",
            }, 404


@app.route("/create_ics/<listing_id>")
@login_required
def create_ics(listing_id):
    listing = listings.find_one({"_id": ObjectId(listing_id)})
    c = Calendar()
    e = Event()
    e.name = "Listing End Date: " + listing["listing_street"]
    e.begin = arrow.get(listing["listing_end_date"], "MM/DD/YYYY").format("YYYY-MM-DD")
    e.make_all_day()
    c.events.add(e)
    response = Response(c.serialize(), mimetype="text/calendar")
    response.headers["Content-Disposition"] = "attachment; filename=event.ics"
    return response


@app.route("/edit_listing/<listing_id>", methods=["POST"])
@login_required
def edit_listing(listing_id):
    data = request.get_json()
    listing = listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        return {"success": False, "error": "Listing not found"}
    for field in [
        "listing_price",
        "listing_start_date",
        "listing_end_date",
        "listing_street",
        "listing_city",
        "listing_owner",
        "listing_email",
        "listing_phone",
    ]:
        if field in data:
            listings.update_one(
                {"_id": ObjectId(listing_id)}, {"$set": {field: data[field]}}
            )
    return {"success": True}


@app.route("/edit_sale/<sale_id>", methods=["POST"])
@login_required
def edit_sale(sale_id):
    data = request.get_json()
    sale = sales.find_one({"_id": ObjectId(sale_id)})
    if not sale:
        return {"success": False, "error": "Sale not found"}
    for field in [
        "sale_type",
        "sale_end_date",
        "sale_price",
        "sale_sqft",
        "sale_street",
        "sale_city",
    ]:
        if field in data:
            sales.update_one({"_id": ObjectId(sale_id)}, {"$set": {field: data[field]}})
    return {"success": True}

@app.route("/search_listings", methods=["POST"])
@login_required
def search_listings():
    page = int(request.get_json().get("page", 1))  # Get page number from the request
    items_per_page = 12
    search_query = request.get_json().get("query")
    regex_query = {
        "$regex": f".*{search_query}.*",
        "$options": "i",
    }
    query = {
        "$or": [
            {"listing_street": regex_query},
            {"listing_city": regex_query},
            {"listing_state": regex_query},
            {"listing_owner": regex_query},
            {"listing_email": regex_query},
            {"listing_phone": regex_query},
            {"brokers": regex_query},
            {"listing_end_date": regex_query},
            {"listing_start_date": regex_query},
            {"listing_property_type": regex_query},
            {"listing_type": regex_query},
            {"listing_price": regex_query},
        ]
    }
    search_results = (
        listings.find(query)
        .sort("_id", -1)
        .skip((page - 1) * items_per_page)
        .limit(items_per_page)
    )  # Pagination
    search_results_data = []
    for result in search_results:
        result["_id"] = str(result["_id"])
        search_results_data.append(result)
    return jsonify(search_results_data)


@app.route("/search_sales", methods=["POST"])
@login_required
def search_sales():
    page = int(request.get_json().get("page", 1))  # Get page number from the request
    items_per_page = 12
    search_query = request.get_json().get("query")
    regex_query = {
        "$regex": f".*{search_query}.*",
        "$options": "i",
    }
    query = {
        "$or": [
            {"sale_street": regex_query},
            {"sale_city": regex_query},
            {"sale_state": regex_query},
            {"sale_property_type": regex_query},
            {"sale_sqft": regex_query},
            {"sale_seller": regex_query},
            {"sale_seller_entity": regex_query},
            {"sale_seller_email": regex_query},
            {"sale_seller_phone": regex_query},
            {"brokers": regex_query},
            {"sale_buyer": regex_query},
            {"sale_buyer_email": regex_query},
            {"sale_buyer_phone": regex_query},
            {"sale_end_date": regex_query},
            {"sale_type": regex_query},
            {"sale_price": regex_query},
        ]
    }
    search_results = (
        sales.find(query)
        .sort("_id", -1)
        .skip((page - 1) * items_per_page)
        .limit(items_per_page)
    )  # Pagination
    search_results_data = []
    for result in search_results:
        result["_id"] = str(result["_id"])
        search_results_data.append(result)
    return jsonify(search_results_data)


Talisman(app, content_security_policy=None)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6969, debug=True)