import os
from flask import Flask, jsonify, make_response, render_template, redirect, url_for, request
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
from bson.errors import InvalidId
from gridfs import GridFS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask import Flask, Response
from ics import Calendar, Event
import arrow
import base64
from flask_mail import Mail, Message
from premailer import transform


ALLOWED_EXTENSIONS = {"pdf"}
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

try:
    app = Flask(__name__)
    app.config['MAIL_SERVER']='smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = os.getenv("EMAIL_USER")
    app.config['MAIL_PASSWORD'] = os.getenv("EMAIL_PW")
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
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
    listings = db["listings"]
    fs = GridFS(db)
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")


@app.route("/")
def login_page():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = load_user(request.form["username"])
        if user and bcrypt.check_password_hash(user.password, request.form["password"]):
            login_user(user)
            return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="Invalid Username or Password")
    return render_template("login.html")


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
    current_time = arrow.now("EST")
    greeting_msg = f"{greeting(current_time)}, {current_user.fullname.split()[0]}!"
    return render_template(
        "dashboard.html", total_listings=total_listings, greeting_msg=greeting_msg
    )

@app.route("/marketing")
@login_required
def marketing():
    greeting_msg = f"Marketing Dashboard - Brochure View"
    brochure_types = ['Office', 'Industrial', 'Investments', 'Healthcare', 'Retail']
    brochure_counts = {}
    for brochure_type in brochure_types:
        brochure_counts[brochure_type] = db[brochure_type.lower() + "_brochures"].count_documents({})
    return render_template("marketing.html", brochure_types=brochure_types, brochure_counts=brochure_counts, greeting_msg=greeting_msg)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


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
                listings.find().skip((page - 1) * per_page).limit(per_page),
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
            "listings.html", listings=listings_data, pagination=pagination, is_admin=is_admin
        )
    return redirect(url_for("login"))


@app.route("/download_listing_pdf/<listing_id>", methods=["GET"])
@login_required
def download_listing_pdf(listing_id):
    listing = listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        return "No listing found", 404
    pdf_file_base64 = listing.get("pdf_file_base64")
    if not pdf_file_base64:
        return "No PDF found for this listing", 404
    pdf_file_data = base64.b64decode(pdf_file_base64)
    response = make_response(pdf_file_data)
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set("Content-Disposition", "attachment", filename="listing.pdf")
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
        filename = secure_filename(file.filename)
        file_binary_data = file.read()
        file_base64_data = base64.b64encode(file_binary_data).decode()
        return {"success": True, "fileBase64": file_base64_data}
    else:
        return {"success": False, "error": "Allowed File Types Are .pdf"}
    
@app.route("/get_brochures")
@login_required
def get_brochures():
    brochure_type = request.args.get('brochure_type')
    brochures = list(db[brochure_type.lower() + "_brochures"].find({}))
    for brochure in brochures:
        brochure['_id'] = str(brochure['_id'])  # Convert ObjectId to string
    return jsonify(brochures)

@app.route("/upload_brochure_pdf", methods=["POST"])
@login_required
def upload_brochure_pdf():
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
    
@app.route("/submit_brochure", methods=["POST"])
@login_required
def submit_brochure():
    if request.method == "POST":
        brochure_file_base64 = request.form.get(
            "brochure-file-base64"
        )
        brochure_type = request.form.get("brochure-type")

        new_listing = {
            "brochure_type": brochure_type,
            "pdf_file_base64": brochure_file_base64,
        }
        result = listings.insert_one(new_listing)
        if result.inserted_id:
            return redirect(url_for('marketing'))
    else:
        return "Error Occured While Submitting The Listing"
    return redirect(url_for("marketing"))

@app.route("/submit_listing", methods=["POST"])
@login_required
def submit_listing():
    if request.method == "POST":
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
            listing_state == "Pennsylvania"

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
                sender="nathanwolf100@gmail.com",
                recipients=["nathanwolf100@gmail.com", "jason.wolf@wolfcre.com"]
            )
            email_content = render_template('email_new_listing.html', listing=new_listing)
            msg.html = transform(email_content)
            mail.send(msg)
    else:
        return "Error Occured While Submitting The Listing"
    return redirect(url_for("view_listings"))

@app.route("/delete_listing/<listing_id>", methods=["GET"])
@login_required
def delete_listing(listing_id):
    try:
        result = listings.delete_one({"_id": ObjectId(listing_id)})
    except:
        return {"success": False, "message": "Listing Not Found or Couldn't Be Deleted"}, 404
    else:
        if result.deleted_count > 0:
            return {"success": True}, 200
        else:
            return {"success": False, "message": "Listing Not Found or Couldn't Be Deleted"}, 404

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

if __name__ == "__main__":
    app.run(debug=True)