from app import app, db, User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

admins = [
    {"name": "Admin One", "email": "admin1@gmail.com", "password": "admin123"},
]

with app.app_context():
    for admin in admins:
        existing = User.query.filter_by(email=admin["email"]).first()
        if not existing:
            hashed = bcrypt.generate_password_hash(admin["password"]).decode("utf-8")
            new_admin = User(
                name=admin["name"],
                email=admin["email"],
                password=hashed,
                role="admin",
                is_verified=True
            )
            db.session.add(new_admin)
            print(f"Created {admin['email']}")
        else:
            print(f"{admin['email']} already exists")

    db.session.commit()
