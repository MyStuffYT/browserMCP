import os
import subprocess
import pathlib
import sys
import shutil

git_available = False
claude_available = False
opencode_available = False
agenta = False

def installpackage(package: str): # only execute in posix
    kernel = sys.platform
    if kernel == "darwin": # macos
        if shutil.which("brew"):
            bi = subprocess.run(["brew", "install", package])
            if bi.returncode != 0:
                print(f"Failed to install package {package}")
                return False
        elif os.path.exists("/opt/homebrew/bin/brew"):
            print("Helpful warning: brew (/opt/homebrew/bin/brew) is not in your PATH")
            bi = subprocess.run(["/opt/homebrew/bin/brew", "install", package])
            if bi.returncode != 0:
                print(f"Failed to install package {package}")
                return False
        elif os.path.exists("/usr/local/bin/brew"):
            print("Helpful warning: brew (/usr/local/bin/brew) is not in your PATH")
            bi = subprocess.run(["/usr/local/bin/brew", "install", package])
            if bi.returncode != 0:
                print(f"Failed to install package {package}")
                return False
        else:
            print("Could not find brew! Is it in your PATH?")
            print(f"Failed to install package {package}")
            return False
        return True
    elif kernel == "linux":
        oid = subprocess.check_output(["bash", "-c", "source /etc/os-release && echo $ID"]).decode().strip()
        print(f"Installing {package} through OS package manager..")
        aptf = ["debian", "ubuntu", "linuxmint", "pop", "kali", "raspbian", "elementary"]
        pacf = ["arch", "manjaro", "endeavouros", "steamos"]
        if oid in pacf:
            pi = subprocess.run(["sudo", "pacman", "-S", package, "--noconfirm"])
            if pi.returncode != 0:
                print(f"Failed to install package {package}")
                return False
        elif oid in aptf:
            pi = subprocess.run(["sudo", "apt", "install", package, "--noconfirm"])
            if pi.returncode != 0:
                print(f"Failed to install package {package}")
                return False
        else:
            print(f"Your OS ({oid}) is not supported with this install script. Please install the package {package} yourself.")
            return False
        return True
    else:
        print(f"Unsupported kernel: {kernel}")
#if os.name == "posix":

    #oid = subprocess.check_output(["bash", "-c", "source /etc/os-release && echo $ID"]).decode().strip()#

    #if oid == "arch":
    #    packages = subprocess.check_output(["pacman", "-Qs"]).decode()
    #    if "npm" in packages and "nodejs" in packages:
    #        installed = True
    #elif oid == "ubuntu" or oid=="debian":
    #    packages = subprocess.check_output(["apt", "list", "--installed"]).decode()
    #    if "npm" in packages and "nodejs" in packages:
    #        installed = True
#elif os.name == "nt":

print("Checking for node.js..")

if shutil.which("node") and shutil.which("npm"):
    print("Found node.js!")
else:
    print("Node.js is not installed. Please install it from https://nodejs.org/en/download.")
    sys.exit(1)

print("Checking for known AI coding agents..")

if shutil.which("claude"):
    claude_available = True
    print("Found Claude Code!")

if shutil.which("opencode"):
    opencode_available = True
    print("Found OpenCode!")

if not claude_available and not opencode_available:
    print("No coding agents found. You will have to input the configuration manually to your coding agent or MCP client.")
else:
    agenta = True

if os.name == "posix":
    print("Checking for git...")
    if shutil.which("git"):
        print("git found!")
        git_available = True
    else:
        print("git not found. Installing..")
        if installpackage("git"):
            print("Installed git successfully!")
        else:
            print("Failed to install git")
            sys.exit(1)

    
if os.name == "nt":
    p = pathlib.Path(os.environ.get("USERPROFILE", ""))
    fullzip = p / "browserMCP.zip"
    expath = p / "browserMCP"
    fullpath = p / "browserMCP" / "browserMCP-main" 
    c = subprocess.run(["curl", "-L", "-o", fullzip, f"https://github.com/MyStuffYT/browserMCP/archive/refs/heads/main.zip"])
    if c.returncode != 0:
        print("Failed to download zip.")
        sys.exit(1)
    c1 = subprocess.run(["powershell", "-Command", f"Expand-Archive -Path '{fullzip}' -DestinationPath '{expath}' -Force"])
    if c1.returncode != 0:
        print("Failed to unzip file.")
        sys.exit(1)
    c2 = subprocess.run(["npm", "install", "--prefix", fullpath])
    if c2.returncode != 0:
        print("Failed to install dependencies.")
        sys.exit(1)
    if not agenta:
        print(f"browserMCP installed! Setup your MCP client to use the command: node {fullpath / 'index.js'}")
    else:
        if opencode_available:
            os.system(f"opencode mcp add browserMCP -- node '{fullpath / 'index.js'}'")
        if claude_available:
            os.system(f"claude mcp add browserMCP -- node '{fullpath / 'index.js'}'")
        print(f"If you still want to use an external MCP client, configure it with this command: node {fullpath / 'index.js'}")
elif os.name == "posix":
    p = pathlib.Path(os.environ.get("HOME", f"/home/{os.getlogin()}"))
    fullpath = p / "browserMCPb"
    c = subprocess.run(["git", "clone", "https://github.com/MyStuffYT/browserMCP", fullpath])
    if c.returncode != 0:
        print("Failed to clone w/ git")
        sys.exit(1)
    c1 = subprocess.run(["npm", "install", "--prefix", fullpath])
    if c1.returncode != 0:
        print("Failed to install dependencies")
        sys.exit(1)
    if not agenta:
        print(f"browserMCP installed! Setup your MCP client to use the command: node {fullpath / 'index.js'}")
    else:
        if opencode_available:
            os.system(f"opencode mcp add browserMCP -- node '{fullpath / 'index.js'}'")
        if claude_available:
            os.system(f"claude mcp add browserMCP -- node '{fullpath / 'index.js'}'")
        print(f"If you still want to use an external MCP client, configure it with this command: node {fullpath / 'index.js'}")