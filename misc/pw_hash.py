from flask_bcrypt import Bcrypt
bcrypt = Bcrypt()
password = 'Snackdad1865$$$'
hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
print(hashed_password)