import face_recognition
import os
import sys
import json
import pymongo
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://aaryansatyam4:Asatyam2604@user.ycc6w.mongodb.net/")
db = client["test"]  # Database name
collection = db["lostchildren"]  # Collection name where the data is stored

def compare_faces(found_image_path, missing_folder_path, input_age, input_gender):
    found_image = face_recognition.load_image_file(found_image_path)
    found_face_locations = face_recognition.face_locations(found_image)

    if len(found_face_locations) == 0:
        return []

    found_face_encoding = face_recognition.face_encodings(found_image, found_face_locations)[0]

    # Query only filtered children
    filtered_children = collection.find({
        "age": { "$gte": input_age - 4, "$lte": input_age + 4 },
        "gender": input_gender
    })

    matches = []
    for child in filtered_children:
        filename = child.get("childPhoto")
        image_path = os.path.join(missing_folder_path, filename)

        if not os.path.exists(image_path):
            continue

        image = face_recognition.load_image_file(image_path)
        face_locations = face_recognition.face_locations(image)
        if face_locations:
            encoding = face_recognition.face_encodings(image, face_locations)[0]
            face_distance = face_recognition.face_distance([found_face_encoding], encoding)[0]

            if face_distance < 0.5:
                matched_child_details = {
                    'childId': str(child['_id']),
                    'childName': child.get('childName', 'N/A'),
                    'age': child.get('age', 'N/A'),
                    'gender': child.get('gender', 'N/A'),
                    'lastSeenLocation': child.get('lastSeenLocation', 'N/A'),
                    'description': child.get('description', 'N/A'),
                    'parentName': child.get('guardianName', 'N/A'),
                    'contactNumber': child.get('contactInfo', 'N/A'),
                    'email': child.get('email', 'N/A'),
                    'childPhoto': child.get('childPhoto', 'N/A'),
                }
                matches.append(matched_child_details)

    return matches

if __name__ == "__main__":
    found_image_path = sys.argv[1]        # Path to uploaded photo
    missing_folder_path = sys.argv[2]     # Path to lost children's images
    input_age = int(sys.argv[3])          # Age of reported child
    input_gender = sys.argv[4]            # Gender of reported child

    results = compare_faces(found_image_path, missing_folder_path, input_age, input_gender)
    print(json.dumps(results))
