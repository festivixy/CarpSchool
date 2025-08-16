import subprocess
import os

def get_npm_package_path(package_name, global_install=True):
    try:
        cmd = ['npm', 'root', '-g'] if global_install else ['npm', 'root']
        npm_root = subprocess.check_output(cmd, text=True).strip()
        package_path = os.path.join(npm_root, package_name)
        
        # Optionally check if the package actually exists
        if os.path.exists(package_path):
            return package_path
        else:
            return None
    except subprocess.CalledProcessError:
        return None

# Usage
builder_path = get_npm_package_path('builder.io')
if builder_path:
    print(f"Package found at: {builder_path}")
else:
    print("Package not found")
    exit(1)

replaceFrom = "m?JSON.parse(m):{}"
replaceTo = "(!m||m==='_REDACTED_'?{}:JSON.parse(m))"

if os.path.exists(os.path.join(builder_path,"cli","index.cjs")):
    print("File exists, proceeding with replacement.")
else:
    print("File does not exist, aborting.")
    exit(1)

with open(os.path.join(builder_path,"cli","index.cjs")) as f:
    content = f.read()

with open(os.path.join(builder_path,"cli","index.cjs.bak"), "w") as f:
    print("Creating backup copy of original file.")
    f.write(content)

print("replaceFrom",replaceFrom)
print("replaceTo",replaceTo)

timesFound = 0

for i, line in enumerate(content.splitlines()):
    if replaceFrom in line:
        print(f"Found replaceFrom in line {i}: {line}")
        timesFound += 1

if timesFound == 1:
    print("Found exactly one instance of replaceFrom, proceeding with replacement.")
    content = content.replace(replaceFrom, replaceTo)
    with open(os.path.join(builder_path,"cli","index.cjs"), "w") as f:
        f.write(content)
else:
    print("Found multiple, or no instances of replaceFrom, aborting replacement.")
    print("Found:", timesFound)
    exit(1)