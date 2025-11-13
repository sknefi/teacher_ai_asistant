from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi

uri = "mongodb+srv://filipkarika1_db_user:4WVtDSFb4IBTyDru@cluster0.am8dmjy.mongodb.net/?appName=Cluster0"

client = MongoClient(
    uri,
    server_api=ServerApi("1"),
    tlsCAFile=certifi.where()
)

try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")

    db = client["sample_app"]
    collection = db["submissions"]

    submission = {
        "name": "Codex Demo",
        "email": "codex@example.com",
        "tags": ["demo", "pymongo"],
    }

    result = collection.insert_one(submission)
    print(f"Inserted document with _id={result.inserted_id}")
except Exception as e:
    print(f"MongoDB operation failed: {e}")
