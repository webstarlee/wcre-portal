import os
import logging
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
            log_message = f"User {user.username} logged in successfully"
            logging.info(log_message)
            return redirect(url_for('view_listings'))
        logging.info("Invalid username or password")
        return render_template('login.html', error='Invalid username or password')
    return render_template('login.html')

@login_manager.user_loader
def load_user(username):
    u = users.find_one({"username": username})
    return User(u['username'], u['password'], u['role'], u['fullname'], u.get('profile_picture_url')) if u else None

@app.route('/home')
@login_required
def home():
    return redirect(url_for('view_listings')) if current_user.is_authenticated else redirect(url_for('login'))

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

if __name__ == "__main__":
    app.run(debug=True)