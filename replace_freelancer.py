import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if modifications are needed
    if 'freelancer' not in content.lower():
        return False

    # Perform case-sensitive replacements
    new_content = content.replace('freelancer', 'photographer')
    new_content = new_content.replace('Freelancer', 'Photographer')
    new_content = new_content.replace('FREELANCER', 'PHOTOGRAPHER')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated {filepath}")
    return True

def main():
    target_dir = os.path.join('frontend', 'src')
    count = 0
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                if replace_in_file(filepath):
                    count += 1
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    main()
