import os
import shutil
import hashlib

def file_hash(file_path):
    """Returns md5 hash of a file"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

dataset_combined = "dataset_combined"
dataset_augmented = "dataset_augmented"

blood_groups = os.listdir(dataset_augmented)

for group in blood_groups:
    src_folder = os.path.join(dataset_augmented, group)
    dst_folder = os.path.join(dataset_combined, group)
    os.makedirs(dst_folder, exist_ok=True)

    # List .bmp files in source folder
    bmp_files = [f for f in os.listdir(src_folder) if f.lower().endswith(".bmp")]

    if not bmp_files:
        print(f"No images found in {src_folder}, skipping...")
        continue

    # Compute hashes of existing files in combined dataset
    existing_hashes = set()
    for f in os.listdir(dst_folder):
        if f.lower().endswith(".bmp"):
            existing_hashes.add(file_hash(os.path.join(dst_folder, f)))

    # Copy files if hash is not already present
    for filename in bmp_files:
        src_file = os.path.join(src_folder, filename)
        file_md5 = file_hash(src_file)

        if file_md5 not in existing_hashes:
            shutil.copy2(src_file, os.path.join(dst_folder, filename))
            print(f"Copied {filename} to {dst_folder}")
            existing_hashes.add(file_md5)
        else:
            print(f"Skipped duplicate {filename}")