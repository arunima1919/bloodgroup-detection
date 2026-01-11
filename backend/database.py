import psycopg2

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="blood_gemini_db",
        user="postgres",
        password="2004",
        port="5432"
    )
