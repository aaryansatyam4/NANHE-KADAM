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

def load_images_from_folder_or_file(path):
    images = []
    if os.path.isfile(path):
        image = face_recognition.load_image_file(path)
        images.append((os.path.basename(path), image))
    elif os.path.isdir(path):
        for filename in os.listdir(path):
            img_path = os.path.join(path, filename)
            if os.path.isfile(img_path):
                image = face_recognition.load_image_file(img_path)
                images.append((filename, image))
    return images

def compare_faces(found_image_path, missing_folder_path):
    # Load the found image
    found_image = face_recognition.load_image_file(found_image_path)
    found_face_locations = face_recognition.face_locations(found_image)

    # If no faces are found in the image, return an empty list
    if len(found_face_locations) == 0:
        return []

    found_face_encoding = face_recognition.face_encodings(found_image, found_face_locations)[0]

    # Load all images from the missing folder
    images_missing = load_images_from_folder_or_file(missing_folder_path)

    matches = []
    for filename, image in images_missing:
        face_locations_missing = face_recognition.face_locations(image)
        if len(face_locations_missing) > 0:
            face_encoding_missing = face_recognition.face_encodings(image, face_locations_missing)[0]
            face_distance = face_recognition.face_distance([found_face_encoding], face_encoding_missing)[0]

            if face_distance < 0.5:  # Match threshold
                matched_child = collection.find_one({"childPhoto": filename})

                if matched_child:
                    matched_child_details = {
                        'childId': str(matched_child['_id']),  # Include the MongoDB ID
                        'childName': matched_child.get('childName', 'N/A'),
                        'age': matched_child.get('age', 'N/A'),
                        'gender': matched_child.get('gender', 'N/A'),
                        'lastSeenLocation': matched_child.get('lastSeenLocation', 'N/A'),
                        'description': matched_child.get('description', 'N/A'),
                        'parentName': matched_child.get('guardianName', 'N/A'),
                        'contactNumber': matched_child.get('contactInfo', 'N/A'),
                        'email': matched_child.get('email', 'N/A'),
                        'childPhoto': matched_child.get('childPhoto', 'N/A'),
                    }
                    matches.append(matched_child_details)

    return matches

if __name__ == "__main__":
    found_image_path = sys.argv[1]  # Path to found child's photo
    missing_folder_path = sys.argv[2]  # Folder path for missing children's photos
    results = compare_faces(found_image_path, missing_folder_path)

    # Output the results as JSON (only the results, not the debug log)
    print(json.dumps(results))
