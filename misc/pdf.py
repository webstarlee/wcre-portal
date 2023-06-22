from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId

def mongo_file_upload(db_name, collection_name, file_path, connection_string, listing_id):
    client = MongoClient(connection_string)
    db = client[db_name]

    # GridFS collection
    fs = GridFS(db, collection_name)

    # Open the file in read-binary mode
    with open(file_path, "rb") as f:
        # Convert to bytes
        file_data = f.read()

    # Now store the data in MongoDB
    file_id = fs.put(file_data)

    # Now, add the file_id to the relevant document in the listings collection
    listings = db['listings']  # access the 'listings' collection
    listings.update_one({"_id": ObjectId(listing_id)}, {"$set": {"pdf_file_id": file_id}})
    
    return file_id

if __name__ == "__main__":
    connection_string = 'mongodb+srv://nathanwolf100:s2UHWRzrxdSM8v6C@admin-panel.dvrgnkx.mongodb.net/'  # Replace this with your MongoDB connection string.
    db_name = 'wcre_panel'
    collection_name = 'listings'
    file_path = '/Users/natewolf/Desktop/listing1.pdf'
    listing_id = '6493668783d118f89f8dbf3b'  # Replace with your listing id in MongoDB
    file_id = mongo_file_upload(db_name, collection_name, file_path, connection_string, listing_id)
    print(f"File uploaded with ID: {file_id}")
