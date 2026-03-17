from app import app, db, User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

users = [
    {"name": "User One", "email": "user1@gmail.com", "password": "user123"},
    {"name": "User Two", "email": "user2@gmail.com", "password": "user456"}
]

with app.app_context():
    for user in users:
        existing = User.query.filter_by(email=user["email"]).first()

        if not existing:
            hashed = bcrypt.generate_password_hash(user["password"]).decode("utf-8")

            new_user = User(
                name=user["name"],
                email=user["email"],
                password=hashed,
                role="user",
                is_verified=True
            )

            db.session.add(new_user)
            print(f"Created {user['email']}")

        else:
            print(f"{user['email']} already exists")

    db.session.commit()