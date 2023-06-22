from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username, password, role, fullname, profile_picture_url):
        self.username = username
        self.password = password
        self.role = role
        self.fullname = fullname
        self.profile_picture_url = profile_picture_url

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.username
