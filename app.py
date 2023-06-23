from flask import Flask, render_template, redirect, request, url_for, send_file, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from models import User
from flask_paginate import Pagination, get_page_args
from bson.objectid import ObjectId
from bson.errors import InvalidId
from gridfs import GridFS
from io import BytesIO
import os


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
login_manager = LoginManager(app)
login_manager.login_view = 'login'

connection_string = os.getenv('MONGODB_URI') 
client = MongoClient(connection_string, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)

try:
    client.server_info()
    print("Connected to MongoDB successfully!")
except ServerSelectionTimeoutError:
    print("Failed to connect to MongoDB.")

db = client['wcre_panel']
users = db['users']
listings = db['listings']
fs = GridFS(db)

bcrypt = Bcrypt(app)

@login_manager.user_loader
def load_user(username):
    u = users.find_one({"username": username})
    if not u:
        return None
    return User(u['username'], u['password'], u['role'], u['fullname'], u.get('profile_picture_url'))

@app.route('/')
def login_page():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = load_user(username)
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            error = 'Invalid username or password'
            return render_template('login.html', error=error)
    return render_template('login.html')


@app.route('/home')
@login_required
def home():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('home.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/listings/download/<listing_id>')
@login_required
def download_listing_pdf(listing_id):
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    try:
        listing = listings.find_one({"_id": ObjectId(listing_id)})
        if listing:
            pdf_file = listing.get("pdf_file")
            if pdf_file:
                response = make_response(pdf_file)
                response.headers.set('Content-Type', 'application/pdf')
                response.headers.set('Content-Disposition', 'attachment', filename=f"{listing_id}.pdf")
                return response
            return 'PDF file not found'
        return 'Listing not found'
    except InvalidId:
        return 'Invalid listing ID'

@app.route('/listings')
@login_required
def view_listings():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    page, per_page, _ = get_page_args(page_parameter='page', per_page_parameter='per_page')
    per_page = 14
    if current_user.role == 'Admin':
        total = listings.count_documents({})
        listings_data = listings.find().skip((page-1)*per_page).limit(per_page)
    else:
        username = current_user.fullname
        total = listings.count_documents({"brokers": {"$in": [username]}})
        listings_data = listings.find({"brokers": {"$in": [username]}}).skip((page-1)*per_page).limit(per_page)
    pagination = Pagination(page=page, per_page=per_page, total=total, css_framework='bootstrap4')
    return render_template('listings.html', listings=listings_data, pagination=pagination)


if __name__ == "__main__":
    app.run(debug=True)