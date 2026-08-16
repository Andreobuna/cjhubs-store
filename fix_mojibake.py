
import os

replacements = {
    'â€”': '—',
    'âž•': '➕',
    'â Œ': '❌',
    'Â·': '·',
    'â‚¦': '₦',
    'ðŸ“¦': '📦'
}

files = ['assets/js/admin.js', 'assets/js/app.js', 'assets/js/data.js']

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Processed {file_path}')
