from flask import Flask, render_template, redirect, request, url_for
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from models import User

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

login_manager = LoginManager(app)
login_manager.login_view = 'login'

connection_string = 'mongodb+srv://nathanwolf100:s2UHWRzrxdSM8v6C@admin-panel.dvrgnkx.mongodb.net/'

client = MongoClient(connection_string, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)

try:
    client.server_info()
    print("Connected to MongoDB successfully!")
except ServerSelectionTimeoutError:
    print("Failed to connect to MongoDB.")

db = client['wcre_panel']
users = db['users']
listings = db['listings']

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
    error = None
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

@app.route('/home')
@login_required
def home():
    return render_template('home.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/listings')
@login_required
def view_listings():
    if current_user.role == 'Admin':
        listings_data = listings.find()
    else:
        username = current_user.fullname
        listings_data = listings.find({
            "brokers": {"$in": [username]}
        })
    return render_template('listings.html', listings=listings_data)

if __name__ == "__main__":
    app.run(debug=True)