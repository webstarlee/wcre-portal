import os
from flask import Flask, jsonify, make_response, render_template, redirect, url_for, request, session
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from flask_apscheduler import APScheduler
from pymongo import MongoClient
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from models import User
from flask_paginate import Pagination, get_page_args
from bson.objectid import ObjectId
from gridfs import GridFS
from dotenv import load_dotenv
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
from pymongo.collection import ReturnDocument
from bson.objectid import ObjectId

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%d/%b/%Y %H:%M:%S",
)
logger = logging.getLogger(__name__)

sentry_sdk.init(
    dsn="https://903f368e70906f512655f4f4555be8c6@o4505664587694081.ingest.sentry.io/4505664611155968",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
)

ALLOWED_EXTENSIONS = {"pdf"}
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

try:
    app = Flask(__name__)
    load_dotenv() 
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY"),
        MAIL_SERVER="smtp.gmail.com",
        MAIL_PORT=465,
        MAIL_USERNAME=os.getenv("EMAIL_USER"),
        MAIL_PASSWORD=os.getenv("EMAIL_PW"),
        MAIL_USE_TLS=False,
        MAIL_USE_SSL=True,
        SCHEDULER_API_ENABLED=True,
        PERMANENT_SESSION_LIFETIME=timedelta(minutes=15)
    )
    scheduler = APScheduler()
    scheduler.init_app(app)
    mail = Mail(app)
    bcrypt = Bcrypt(app)
    login_manager = LoginManager(app)
    login_manager.login_view = "login"
except Exception as e:
    logger.error(f"Error Starting Flask App: {str(e)}")
else:
    try:
        client = MongoClient(
            os.environ.get("MONGODB_URI"),
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000,
        )
        db = client["wcre_panel"]
        users = db["Users"]
        logins = db["Logins"]
        listings = db["Listings"]
        sales = db["Sales"]
        leases = db["Leases"]
        docs = db["Documents"]
        scheduler_locks = db["SchedulerLocks"]
        fs = GridFS(db)
        logger.info("Connected to MongoDB successfully")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")
    else:
        lock_acquired = scheduler_locks.find_one_and_update(
            {"_id": ObjectId("6501f81b496e0d9bfaac4680"), "locked": False},
            {"$set": {"locked": True}},
            return_document=ReturnDocument.AFTER,
        )
        if lock_acquired and lock_acquired.get("locked"):
            scheduler.start()
        else:
            logging.info("Scheduler already started by another worker.")


@app.before_request
def refresh_session():
    session.modified = True

def send_email(subject, template, data, conn):
    try:
        msg = Message(
            subject,
            sender="portal@wolfcre.com",
            recipients=["nathanwolf100@gmail.com", "jason.wolf@wolfcre.com"],
        )
        email_content = render_template(template, **data)
        msg.html = transform(email_content)
        conn.send(msg)
    except Exception as e:
        print("Error Sending Email: ", e)

@scheduler.task('interval', id='do_alert_for_expiring_listings', seconds=43200, misfire_grace_time=900)
def alert_for_expiring_listings():
    upcoming_expiration_date = datetime.now() + timedelta(days=7)
    formatted_upcoming_expiration_date = upcoming_expiration_date.strftime('%m/%d/%Y')
    expiring_listings = list(listings.find({"listing_end_date": {"$lte": formatted_upcoming_expiration_date}}))
    if len(expiring_listings) > 0:
        for listing in expiring_listings:
            listing_expiry_date = datetime.strptime(listing['listing_end_date'], '%m/%d/%Y')
            days_left = (listing_expiry_date - datetime.now()).days + 1
            subject = f"ACTION NEEDED - A LISTING IS EXPIRING IN {days_left} DAYS"
            with app.app_context():
                with mail.connect() as conn:
                    send_email(subject, 'email_templates/email_expiring_listing.html', {"listing": listing}, conn)
    else:
        print("No Upcoming Expiring Listings")


def convert_state_code_to_full_name(state_code):
    state_mapping = {
        "NJ": "New Jersey",
        "PA": "Pennsylvania"
    }
    return state_mapping.get(state_code, state_code)

@app.route("/count/<string:collection_type>")
@login_required
def get_count(collection_type):
    collection_map = {
        "listings": listings,
        "sales": sales,
        "leases": leases,
    }
    collection = collection_map.get(collection_type)
    if collection is None:
        return jsonify(error=f"Invalid collection type: {collection_type}"), 400
    count = collection.count_documents({})
    return jsonify(count=count)



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
    documents = list(db["Documents"].find({"document_type": document_type}))
    for document in documents:
        document["_id"] = str(document["_id"])
    return jsonify(documents)


@app.route("/documents")
@login_required
def documents():
    is_admin = current_user.role == "Admin"
    greeting_msg = f"Marketing Dashboard - Document View"
    document_types = [
        "Office Collaterals",
        "Industrial Collaterals",
        "Investment Collaterals",
        "Healthcare Collaterals",
        "Retail Collaterals",
        "BOV Reports",
        "Quarterly Reports",
        "Key Marketing Pieces",
        "Other Documents"
    ]
    document_counts = {}
    for document_type in document_types:
        document_counts[document_type] = db["Documents"].count_documents(
            {"document_type": document_type}
        )
    return render_template(
        "documents.html",
        document_types=document_types,
        document_counts=document_counts,
        is_admin=is_admin,
        greeting_msg=greeting_msg,
    )


def send_pdf_response(collection, item_id, pdf_key, default_filename):
    item = collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        return f"No {default_filename.split('.')[0].capitalize()} Found", 404
    pdf_file_base64 = item.get(pdf_key)
    if not pdf_file_base64:
        return (
            f"No PDF Found for This {default_filename.split('.')[0].capitalize()}",
            404,
        )
    pdf_file_data = base64.b64decode(pdf_file_base64)
    response = make_response(pdf_file_data)
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set("Content-Disposition", "attachment", filename=default_filename)
    return response


@app.route("/download_listing_pdf/<listing_id>", methods=["GET"])
@login_required
def download_listing_pdf(listing_id):
    return send_pdf_response(listings, listing_id, "listing_agreement_file_base64", "listing_agreement.pdf")

@app.route("/download_listing_amendment_pdf/<listing_id>", methods=["GET"])
@login_required
def download_listing_amendment_pdf(listing_id):
    return send_pdf_response(listings, listing_id, "listing_amendment_file_base64", "listing_amendment.pdf")


@app.route("/download_sale_pdf/<sale_id>", methods=["GET"])
@login_required
def download_sale_pdf(sale_id):
    return send_pdf_response(sales, sale_id, "sale_agreement_file_base64", "sale_agreement.pdf")


@app.route("/download_lease_agreement_pdf/<lease_id>", methods=["GET"])
@login_required
def download_lease_agreement_pdf(lease_id):
    return send_pdf_response(leases, lease_id, "lease_agreement_file_base64", "lease_agreement.pdf")


@app.route("/download_lease_commission_pdf/<lease_id>", methods=["GET"])
@login_required
def download_lease_commission_pdf(lease_id):
    return send_pdf_response(leases, lease_id, "lease_commission_file_base64", "lease_commission.pdf")


def handle_upload():
    if "file" not in request.files:
        return {"success": False, "error": "No File Part"}
    file = request.files["file"]
    if file.filename == "":
        return {"success": False, "error": "No Selected File"}
    if not allowed_file(file.filename):
        return {"success": False, "error": "Allowed File Types Are .pdf"}
    file_binary_data = file.read()
    file_base64_data = base64.b64encode(file_binary_data).decode()
    return {"success": True, "fileBase64": file_base64_data}


@app.route("/upload_pdf", methods=["POST"])
@login_required
def upload_pdf():
    return handle_upload()


@app.route("/submit_document", methods=["POST"])
@login_required
def submit_document():
    try:
        form_keys = ["document-file-base64", "document-type", "document-name"]
        new_document = {
            key.replace("-", "_"): request.form.get(key) for key in form_keys
        }
        result = docs.insert_one(new_document)
        if not result.inserted_id:
            raise Exception("Error inserting the document.")
        return make_response(
            {"status": "success", "redirect": url_for("documents")}, 200
        )
    except Exception as e:
        logger.error(e)
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
    try:
        form_keys = [
            "listing-street",
            "listing-city",
            "listing-state",
            "listing-owner-name",
            "listing-owner-email",
            "listing-owner-phone",
            "listing-end-date",
            "listing-start-date",
            "listing-property-type",
            "listing-month-to-month",
            "listing-price",
            "listing-lat",
            "listing-long"
        ]
        new_listing = {
            key.replace("-", "_"): request.form.get(key) for key in form_keys
        }
        new_listing["brokers"] = request.form.getlist("brokers[]")
        new_listing["listing_state"] = convert_state_code_to_full_name(new_listing["listing_state"])
        new_listing["listing_agreement_file_base64"] = request.form.get("listing-agreement-file-base64")
        new_listing["listing_amendment_file_base64"] = request.form.get("listing-amendment-file-base64" )
        result = listings.insert_one(new_listing)
        if not result.inserted_id:
            raise Exception("Error inserting the listing.")
        try:
            with app.app_context():
                with mail.connect() as conn:
                    send_email("New Listing Notification", 'email_templates/email_new_listing.html', {"listing": new_listing}, conn)
        except Exception as e:
            print("Error Sending Email: ", e)
        return make_response(
            {"status": "success", "redirect": url_for("view_listings")}, 200
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


@app.route("/submit_sale", methods=["POST"])
@login_required
def submit_sale():
    try:
        form_keys = [
            "sale-street",
            "sale-city",
            "sale-state",
            "sale-sqft",
            "sale-seller-name",
            "sale-seller-email",
            "sale-seller-phone",
            "sale-buyer-name",
            "sale-buyer-email",
            "sale-buyer-phone",
            "sale-end-date",
            "sale-agreement-file-base64",
            "sale-property-type",
            "sale-type",
            "sale-price",
            "sale-commission"
        ]
        new_sale = {key.replace("-", "_"): request.form.get(key) for key in form_keys}
        new_sale["brokers"] = request.form.getlist("brokers[]")
        new_sale["sale_state"] = convert_state_code_to_full_name(new_sale["sale_state"])
        result = sales.insert_one(new_sale)
        if not result.inserted_id:
            raise Exception("Error Inserting the Sale")
        try:
            with app.app_context():
                with mail.connect() as conn:
                    send_email("New Sale Notification", 'email_templates/email_new_sale.html', {"sale": new_sale}, conn)
        except Exception as e:
            print("Error Sending Email: ", e)
        return make_response(
            {"status": "success", "redirect": url_for("view_sales")}, 200
        )
    except Exception as e:
        logger.error(e)
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Error Occurred While Submitting The Sale",
                }
            ),
            500,
        )


@app.route("/submit_lease", methods=["POST"])
@login_required
def submit_lease():
    try:
        form_keys = [
            "lease-street",
            "lease-city",
            "lease-state",
            "lease-sqft",
            "lease-property-type",
            "lease-lessor-name",
            "lease-lessor-email",
            "lease-lessor-phone",
            "lease-lessee-name",
            "lease-lessee-email",
            "lease-lessee-phone",
        ]
        new_lease = {key.replace("-", "_"): request.form.get(key) for key in form_keys}
        years = request.form.get("lease-years")
        months = request.form.get("lease-months")
        new_lease["lease_term_length"] = f"{years} Years, {months} Months"
        new_lease["brokers"] = request.form.getlist("brokers[]")
        new_lease["lease_agreement_file_base64"] = request.form.get(
            "lease-agreement-file-base64"
        )
        new_lease["lease_commission_file_base64"] = request.form.get(
            "lease-commission-agreement-file-base64"
        )
        new_lease["lease_state"] = convert_state_code_to_full_name(new_lease["lease_state"])
        result = leases.insert_one(new_lease)
        if not result.inserted_id:
            raise Exception("Error Inserting the Lease")
        try:
            with app.app_context():
                with mail.connect() as conn:
                    send_email("New Lease Notification", 'email_templates/email_new_lease.html', {"lease": new_lease}, conn)
        except Exception as e:
            print("Error Sending Email: ", e)
        return make_response(
            {"status": "success", "redirect": url_for("view_leases")}, 200
        )
    except Exception as e:
        logger.error(e)
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Error Occurred While Submitting The Lease",
                }
            ),
            500,
        )


def delete_item_from_collection(item_id, collection, item_type):
    try:
        result = collection.delete_one({"_id": ObjectId(item_id)})
    except:
        return {
            "success": False,
            "message": f"{item_type} Not Found or Couldn't Be Deleted",
        }, 404
    else:
        if result.deleted_count > 0:
            return {"success": True}, 200
        else:
            return {
                "success": False,
                "message": f"{item_type} Not Found or Couldn't Be Deleted",
            }, 404


@app.route("/delete_listing/<listing_id>", methods=["GET"])
@login_required
def delete_listing(listing_id):
    return delete_item_from_collection(listing_id, listings, "Listing")


@app.route("/delete_sale/<sale_id>", methods=["GET"])
@login_required
def delete_sale(sale_id):
    return delete_item_from_collection(sale_id, sales, "Sale")


@app.route("/delete_document/<document_id>", methods=["GET"])
@login_required
def delete_document(document_id):
    return delete_item_from_collection(document_id, docs, "Document")


@app.route("/delete_lease/<lease_id>", methods=["GET"])
@login_required
def delete_lease(lease_id):
    return delete_item_from_collection(lease_id, leases, "Lease")


def create_ics_event(item_id, collection, item_type, street_key, date_key):
    item = collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        return {"success": False, "message": f"{item_type} not found"}, 404
    c = Calendar()
    e = Event()
    e.name = f"{item_type} Closing Date: {item[street_key]}"
    e.begin = arrow.get(item[date_key], "MM/DD/YYYY").format("YYYY-MM-DD")
    e.make_all_day()
    c.events.add(e)
    response = Response(c.serialize(), mimetype="text/calendar")
    response.headers["Content-Disposition"] = "attachment; filename=event.ics"
    return response


@app.route("/create_ics_listing/<listing_id>")
@login_required
def create_ics_listing(listing_id):
    return create_ics_event(
        listing_id, listings, "Listing", "listing_street", "listing_end_date"
    )


@app.route("/create_ics_sale/<sale_id>")
@login_required
def create_ics_sale(sale_id):
    return create_ics_event(sale_id, sales, "Sale", "sale_street", "sale_end_date")


@app.route("/create_ics_lease/<lease_id>")
@login_required
def create_ics_lease(lease_id):
    return create_ics_event(lease_id, leases, "Lease", "lease_street", "lease_end_date")


def edit_record(record_id, collection, fields):
    data = request.get_json()
    record = collection.find_one({"_id": ObjectId(record_id)})
    if not record:
        return {"success": False, "error": f"{collection.name.capitalize()} not found"}
    update_data = {field: data[field] for field in fields if field in data}
    collection.update_one({"_id": ObjectId(record_id)}, {"$set": update_data})
    return {"success": True}


@app.route("/edit_listing/<listing_id>", methods=["POST"])
@login_required
def edit_listing(listing_id):
    existing_listing = listings.find_one({"_id": ObjectId(listing_id)})
    base64_fields = [
        'listing_agreement_file_base64',
        'listing_amendment_file_base64'
    ]
    for field in base64_fields:
        if not request.json.get(field) and existing_listing.get(field):
            request.json.pop(field, None)
    if request.json.get("listing_state"):
        request.json["listing_state"] = convert_state_code_to_full_name(request.json["listing_state"])
    fields = [
        "listing_street",
        "listing_city",
        "listing_state",
        "listing_owner_name",
        "listing_owner_email",
        "listing_owner_phone",
        "listing_end_date",
        "listing_start_date"
        ] + base64_fields + [
        "listing_property_type",
        "listing_month_to_month",
        "listing_price",
    ]
    return edit_record(listing_id, listings, fields)


@app.route("/edit_sale/<sale_id>", methods=["POST"])
@login_required
def edit_sale(sale_id):
    existing_sale = sales.find_one({"_id": ObjectId(sale_id)})
    if not request.json.get('sale_agreement_file_base64') and existing_sale.get('sale_agreement_file_base64'):
        request.json.pop('sale_agreement_file_base64', None)
    if request.json.get("sale_state"):
        request.json["sale_state"] = convert_state_code_to_full_name(request.json["sale_state"])
    fields = [
        "sale_street",
        "sale_city",
        "sale_sqft",
        "sale_seller_name",
        "sale_seller_email",
        "sale_seller_phone",
        "sale_buyer_name",
        "sale_buyer_email",
        "sale_buyer_phone",
        "sale_end_date",
        "sale_agreement_file_base64",
        "sale_property_type",
        "sale_type",
        "sale_price",
        "sale_commission",
    ]
    return edit_record(sale_id, sales, fields)


@app.route("/edit_lease/<lease_id>", methods=["POST"])
@login_required
def edit_lease(lease_id):
    existing_lease = leases.find_one({"_id": ObjectId(lease_id)})
    base64_fields = [
        'lease_agreement_file_base64',
        'lease_commission_file_base64'
    ]
    for field in base64_fields:
        if not request.json.get(field) and existing_lease.get(field):
            request.json.pop(field, None)
    if request.json.get("sale_state"):
        request.json["lease_state"] = convert_state_code_to_full_name(request.json["lease_state"])
    fields = [
        "lease_street",
        "lease_city",
        "lease_sqft",
        "lease_property_type",
        "lease_price",
        "lease_term_length",
        "lease_percentage_space"
    ] + base64_fields + [
        "lease_lessor_name",
        "lease_lessor_email",
        "lease_lessee_name",
        "lease_lessee_email"
    ]
    return edit_record(lease_id, leases, fields)



def search_in_collection(collection, fields, page, search_query, items_per_page=12):
    regex_query = {
        "$regex": f".*{search_query}.*",
        "$options": "i",
    }
    query = {"$or": [{field: regex_query} for field in fields]}
    search_results = (
        collection.find(query)
        .sort("_id", -1)
        .skip((page - 1) * items_per_page)
        .limit(items_per_page)
    )

    search_results_data = []
    for result in search_results:
        result["_id"] = str(result["_id"])
        search_results_data.append(result)
    return search_results_data


@app.route("/search_listings", methods=["POST"])
@login_required
def search_listings():
    page = int(request.get_json().get("page", 1))
    search_query = request.get_json().get("query")
    fields = [
        "listing_street",
        "listing_city",
        "listing_state",
        "listing_owner_name",
        "listing_owner_email",
        "listing_owner_phone",
        "brokers",
        "listing_end_date",
        "listing_start_date",
        "listing_property_type",
        "listing_month_to_month",
        "listing_price",
    ]
    results = search_in_collection(listings, fields, page, search_query)
    return jsonify(results)


@app.route("/search_sales", methods=["POST"])
@login_required
def search_sales():
    page = int(request.get_json().get("page", 1))
    search_query = request.get_json().get("query")
    fields = [
        "sale_street",
        "sale_city",
        "sale_state",
        "sale_property_type",
        "sale_sqft",
        "sale_seller_name",
        "sale_seller_email",
        "sale_seller_phone",
        "brokers",
        "sale_buyer",
        "sale_buyer_email",
        "sale_buyer_phone",
        "sale_end_date",
        "sale_type",
        "sale_price",
        "sale_commission",
    ]
    results = search_in_collection(sales, fields, page, search_query)
    return jsonify(results)

@app.route("/search_leases", methods=["POST"])
@login_required
def search_leases():
    page = int(request.get_json().get("page", 1))
    search_query = request.get_json().get("query")
    fields = [
        "lease_street",
        "lease_city",
        "lease_state",
        "lease_property_type",
        "lease_sqft",
        "lease_percentage_space",
        "lease_term_length",
        "lease_seller_name",
        "lease_seller_email",
        "lease_seller_phone",
        "brokers",
        "lease_buyer",
        "lease_buyer_email",
        "lease_buyer_phone",
        "lease_end_date",
        "lease_type",
        "lease_price",
    ]
    results = search_in_collection(leases, fields, page, search_query)
    return jsonify(results)


Talisman(app, content_security_policy=None)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6969, debug=True)