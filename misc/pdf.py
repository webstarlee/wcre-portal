from tkinter import Tk, filedialog
from pymongo import MongoClient
from bson.objectid import ObjectId

# Connect to MongoDB
connection_string = 'mongodb+srv://nathanwolf100:s2UHWRzrxdSM8v6C@admin-panel.dvrgnkx.mongodb.net/'
client = MongoClient(connection_string, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
db = client['wcre_panel']
listings = db['listings']

# Function to store the PDF file in the associated listing document
def store_pdf_in_listing(file_path, listing_id):
    with open(file_path, 'rb') as file:
        file_content = file.read()

        # Update the associated listing with the PDF file content
        listings.update_one(
            {'_id': ObjectId(listing_id)},
            {'$set': {'pdf_file': file_content}}
        )

        print(f"PDF file uploaded to the associated listing: {listing_id}")

root = Tk()
root.withdraw()
pdf_file_path = filedialog.askopenfilename(title='Select PDF File', filetypes=[('PDF Files', '*.pdf')])
listing_id = input("Enter the listing ID: ")
store_pdf_in_listing(pdf_file_path, listing_id)