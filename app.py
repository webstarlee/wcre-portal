from datetime import timedelta
import os
from flask import Flask, make_response, render_template, redirect, url_for, request
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
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


ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

try:
    app = Flask(__name__)
    load_dotenv()
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    login_manager = LoginManager(app)
    login_manager.login_view = 'login'
    bcrypt = Bcrypt(app)
    mongodb_uri = os.environ.get('MONGODB_URI')
except Exception as e:
    print(f"Error Starting Flask App: {str(e)}")

try:
    client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    db = client['wcre_panel']
    users = db['users']
    listings = db['listings']
    fs = GridFS(db)
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")

@app.route('/')
def login_page():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = load_user(request.form['username'])
        if user and bcrypt.check_password_hash(user.password, request.form['password']):
            login_user(user)
            return redirect(url_for('view_listings'))
        else:
            return render_template('login.html', error='Invalid Username or Password')
    return render_template('login.html')

@login_manager.user_loader
def load_user(username):
    u = users.find_one({"username": username})
    return User(u['username'], u['password'], u['role'], u['fullname'], u.get('profile_picture_url')) if u else None

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/listings/download/<listing_id>')
@login_required
def download_listing_pdf(listing_id):
    if current_user.is_authenticated:
        try:
            listing = listings.find_one({"_id": ObjectId(listing_id)})
            if listing and "pdf_file" in listing:
                response = make_response(listing["pdf_file"])
                response.headers.set('Content-Type', 'application/pdf')
                response.headers.set('Content-Disposition', 'attachment', filename=f"{listing_id}.pdf")
                return response
            return 'Listing or PDF file not found'
        except InvalidId:
            return 'Invalid listing ID'
    return redirect(url_for('login'))

@app.route('/listings')
@login_required
def view_listings():
    if current_user.is_authenticated:
        page, per_page, _ = get_page_args(page_parameter='page', per_page_parameter='per_page')
        per_page = 12
        total, listings_data = (listings.count_documents({}),
                                listings.find().skip((page-1)*per_page).limit(per_page)) if current_user.role == 'Admin' else (
                                    listings.count_documents({"brokers": {"$in": [current_user.fullname]}}),
                                    listings.find({"brokers": {"$in": [current_user.fullname]}}).skip((page-1)*per_page).limit(per_page)
                                )
        pagination = Pagination(page=page, per_page=per_page, total=total, css_framework='bootstrap4')
        return render_template('listings.html', listings=listings_data, pagination=pagination)
    return redirect(url_for('login'))

@app.route('/upload_pdf', methods=['POST'])
@login_required
def upload_pdf():
    if 'file' not in request.files:
        return {"success": False, "error": "No File Part"}
    file = request.files['file']
    if file.filename == '':
        return {"success": False, "error": "No Selected File"}
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_binary_data = file.read()
        fs = GridFS(db)
        file_id = fs.put(file_binary_data, filename=filename)
        return {"success": True, "fileId": str(file_id)}
    else:
        return {"success": False, "error": "Allowed file types are .pdf"}

@app.route('/submit_listing', methods=['POST'])
@login_required
def submit_listing():
    print("in here")
    if request.method == 'POST':
        listing_street = request.form.get('listing-street')
        listing_city = request.form.get('listing-city')
        listing_state = request.form.get('listing-state')
        listing_property_type = request.form.get('listing-property-type')
        listing_owner = request.form.get('listing-owner-name')
        listing_email = request.form.get('listing-owner-email')
        listing_phone = request.form.get('listing-owner-phone')
        listing_brokers = request.form.getlist('broker-checkbox')
        listing_agreement_file_id = request.form.get('listing-agreement-file-id')
        listing_start_date = request.form.get('listing-start-date')
        listing_end_date = request.form.get('listing-end-date')
        
        new_listing = {
            "listing_street": listing_street,
            "listing_city": listing_city,
            "listing_state": listing_state,
            "listing_owner": listing_owner,
            "listing_email": listing_email,
            "listing_phone": listing_phone,    
            "brokers": listing_brokers,
            "pdf_file": {
                "$binary": {
                    "base64": listing_agreement_file_id,
                    "subType": "00"
                }
            },
            "listing_end_date": listing_end_date,
            "listing_start_date": listing_start_date
        }
        
        result = listings.insert_one(new_listing)
        
        if result.inserted_id:
            return redirect(url_for('view_listings'))
        else:
            return 'Error occurred while submitting the listing'

    return redirect(url_for('view_listings'))

@app.route('/create_ics/<listing_id>')
@login_required
def create_ics(listing_id):
    listing = listings.find_one({"_id": ObjectId(listing_id)})

    c = Calendar()
    e = Event()
    e.name = "Listing End Date: " + listing['listing_street']
    e.begin = arrow.get(listing['listing_end_date'], 'MM/DD/YYYY').format('YYYY-MM-DD')
    e.make_all_day()
    c.events.add(e)
    response = Response(c.serialize(), mimetype="text/calendar")
    response.headers['Content-Disposition'] = 'attachment; filename=event.ics'
    return response

if __name__ == "__main__":
    app.run(debug=True)