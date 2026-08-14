import re
filepath = r'c:\Users\Aman Mishra\Downloads\career\includes\dashboard-sidebar.php'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For admin, add after Dashboard
content = content.replace(
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/admin/', 'page' => 'index'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/admin/', 'page' => 'index'],\n            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],"
)

dash_patterns = [
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/campus-saarthi.php', 'page' => 'campus-saarthi'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/employee.php', 'page' => 'employee'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/intern.php', 'page' => 'intern'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/dashboard.php', 'page' => 'dashboard'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/teaching-expert.php', 'page' => 'teaching-expert'],",
    "['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/', 'page' => 'index'],"
]

for p in dash_patterns:
    content = content.replace(p, p + "\n            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],")

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('DONE')
