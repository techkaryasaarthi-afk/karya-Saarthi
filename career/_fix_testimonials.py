import re

filepath = r'c:\Users\Aman Mishra\Downloads\career\admin\testimonials.php'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize line endings
content = content.replace('\r\n', '\n')

# Fix: Remove broken redirect code from ALTER TABLE migration blocks
# Pattern: Match from "// Ensure 'designation'" to the last "catch (Exception $e) {}" of sort_order
pattern = r"// Ensure 'designation' column exists.*?// Ensure 'sort_order' column exists.*?catch \(Exception \$e\) \{\}"
replacement = """// Ensure columns exist (migration for older schema)
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN designation VARCHAR(200) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN photo_url VARCHAR(500) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN sort_order INT DEFAULT 0"); } catch (Exception $e) {}"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('DONE - testimonials.php migration blocks fixed')
