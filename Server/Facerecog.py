import face_recognition
import os
import sys
import json
import pymongo
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://aaryansatyam4:Asatyam2604@user.ycc6w.mongodb.net/")
db = client["test"]  # Database name
collection = db["missingchildren"]  # Collection name where the data is stored

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

def compare_faces(folder_a, folder_b):
    images_a = load_images_from_folder_or_file(folder_a)
    images_b = load_images_from_folder_or_file(folder_b)

    matches = []
    for file_a, image_a in images_a:
        for file_b, image_b in images_b:
            face_locations_a = face_recognition.face_locations(image_a)
            face_locations_b = face_recognition.face_locations(image_b)

            if len(face_locations_a) > 0 and len(face_locations_b) > 0:
                face_encoding_a = face_recognition.face_encodings(image_a, face_locations_a)[0]
                face_encoding_b = face_recognition.face_encodings(image_b, face_locations_b)[0]
                
                # Calculate the face distance
                face_distance = face_recognition.face_distance([face_encoding_a], face_encoding_b)[0]
                
                # If the face distance is below a threshold (e.g., 0.6), consider them as a match
                if face_distance < 0.5:  # Adjust the threshold for your needs
                    matched_child = collection.find_one({"childPhoto": file_b})  # Assuming `childPhoto` is stored as filename

                    # If the match is found in the database, add its details
                    if matched_child:
                        matched_child_details = {
                            'filename': file_b,
                            'childName': matched_child['childName'],
                            'age': matched_child['age'],
                            'gender': matched_child['gender'],
                            'lastSeenLocation': matched_child['lastSeen'],
                            'description': matched_child['description'],
                            'parentName': matched_child['parentName'],
                            'contactNumber': matched_child['contactNumber'],
                            'email': matched_child['email'],
                            'childPhoto': matched_child['childPhoto'],
                        }
                        matches.append(matched_child_details)
    return matches

if __name__ == "__main__":
    folder_a = sys.argv[1]  # Path to missing folder or single image file
    folder_b = sys.argv[2]  # Path to reported folder
    results = compare_faces(folder_a, folder_b)
    # Output the results as JSON
    print(json.dumps(results))
