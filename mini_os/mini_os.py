import os
import time
import random

# ---------------- LOGIN SYSTEM ----------------

USERNAME = "admin"
PASSWORD = "1234"

def login():
    print("===== Mini Operating System =====")

    while True:
        user = input("Username: ")
        pwd = input("Password: ")

        if user == USERNAME and pwd == PASSWORD:
            print("\nLogin Successful!\n")
            break
        else:
            print("Invalid credentials\n")


# ---------------- FILE SYSTEM ----------------

current_dir = os.getcwd()

def ls():
    files = os.listdir(current_dir)
    for f in files:
        print(f)

def mkdir(name):
    try:
        os.mkdir(os.path.join(current_dir, name))
    except:
        print("Folder already exists")

def cd(path):
    global current_dir
    try:
        new_path = os.path.join(current_dir, path)
        if os.path.isdir(new_path):
            current_dir = new_path
        else:
            print("Directory not found")
    except:
        print("Error changing directory")

def pwd():
    print(current_dir)

def touch(name):
    open(os.path.join(current_dir, name), 'w').close()

def rm(name):
    try:
        os.remove(os.path.join(current_dir, name))
    except:
        print("File not found")


# ---------------- PROCESS MANAGEMENT ----------------

processes = []

def create_process():
    pid = random.randint(1000, 9999)
    processes.append(pid)
    print(f"Process {pid} created")

def show_processes():
    print("Running Processes:")
    for p in processes:
        print(f"PID: {p}")

def kill_process(pid):
    try:
        processes.remove(int(pid))
        print("Process killed")
    except:
        print("PID not found")


# ---------------- HELP ----------------

def help_menu():
    print("""
Available Commands:

help        - Show commands
ls          - List files
mkdir       - Create directory
cd          - Change directory
pwd         - Show path
touch       - Create file
rm          - Remove file
ps          - Show processes
run         - Create process
kill        - Kill process
clear       - Clear screen
shutdown    - Exit OS
""")


# ---------------- SHELL ----------------

def shell():
    while True:
        cmd = input("MiniOS > ").strip().split()

        if not cmd:
            continue

        command = cmd[0]

        if command == "help":
            help_menu()

        elif command == "ls":
            ls()

        elif command == "mkdir" and len(cmd) > 1:
            mkdir(cmd[1])

        elif command == "cd" and len(cmd) > 1:
            cd(cmd[1])

        elif command == "pwd":
            pwd()

        elif command == "touch" and len(cmd) > 1:
            touch(cmd[1])

        elif command == "rm" and len(cmd) > 1:
            rm(cmd[1])

        elif command == "ps":
            show_processes()

        elif command == "run":
            create_process()

        elif command == "kill" and len(cmd) > 1:
            kill_process(cmd[1])

        elif command == "clear":
            os.system("clear")

        elif command == "shutdown":
            print("Shutting down MiniOS...")
            time.sleep(1)
            break

        else:
            print("Command not found. Type 'help'")


# ---------------- MAIN ----------------

login()
shell()