import tkinter as tk
from tkinter import ttk

# ---------- DATA ----------
commands = {
    "File Management": {
        "ls": "List directory contents\nExample: ls -l",
        "cd": "Change directory\nExample: cd /home",
        "mkdir": "Create directory\nExample: mkdir test",
        "rm": "Remove file\nExample: rm file.txt"
    },
    "Process Management": {
        "ps": "Show running processes\nExample: ps aux",
        "top": "Real-time process viewer\nExample: top",
        "kill": "Terminate process\nExample: kill 1234"
    },
    "System Info": {
        "df": "Disk usage\nExample: df -h",
        "free": "Memory usage\nExample: free -m",
        "uname": "System info\nExample: uname -a"
    },
    "Permissions": {
        "chmod": "Change permissions\nExample: chmod 777 file",
        "chown": "Change ownership\nExample: chown user file"
    }
}

# ---------- COLORS ----------
BG = "#0f172a"
CARD = "#1e293b"
TEXT = "#e2e8f0"
ACCENT = "#38bdf8"

# ---------- WINDOW ----------
root = tk.Tk()
root.title("Linux Learning Hub")
root.geometry("900x550")
root.configure(bg=BG)

# ---------- HEADER ----------
header = tk.Label(root, text="Linux Learning Platform",
                  bg=BG, fg=TEXT, font=("Arial", 18, "bold"))
header.pack(pady=10)

# ---------- MAIN FRAME ----------
main = tk.Frame(root, bg=BG)
main.pack(fill="both", expand=True)

# ---------- LEFT CATEGORY ----------
left = tk.Frame(main, bg="#020617", width=200)
left.pack(side="left", fill="y")

tk.Label(left, text="Categories", bg="#020617",
         fg=ACCENT, font=("Arial", 14)).pack(pady=10)

category_list = tk.Listbox(left, bg="#020617",
                           fg="white", font=("Arial", 11),
                           selectbackground=ACCENT)

category_list.pack(fill="y", expand=True)

for cat in commands:
    category_list.insert(tk.END, cat)

# ---------- RIGHT CONTENT ----------
right = tk.Frame(main, bg=BG)
right.pack(side="right", fill="both", expand=True)

# Search
search_var = tk.StringVar()

search_entry = tk.Entry(right, textvariable=search_var,
                        font=("Arial", 12))
search_entry.pack(pady=5)

# Command list
command_list = tk.Listbox(right, font=("Arial", 12))
command_list.pack(fill="both", expand=True, pady=5)

# Explanation box
output = tk.Text(right, height=8, font=("Arial", 11))
output.pack(fill="both", expand=True)

# ---------- FUNCTIONS ----------
def show_commands(event):
    command_list.delete(0, tk.END)

    if not category_list.curselection():
        return

    selected = category_list.get(category_list.curselection()[0])

    for cmd in commands[selected]:
        command_list.insert(tk.END, cmd)


def show_description(event):
    output.delete("1.0", tk.END)

    # Check category selection
    if not category_list.curselection():
        return

    # Check command selection
    if not command_list.curselection():
        return

    cat = category_list.get(category_list.curselection()[0])
    cmd = command_list.get(command_list.curselection()[0])

    desc = commands[cat][cmd]
    output.insert(tk.END, desc)


def search_command():
    query = search_var.get().lower()
    command_list.delete(0, tk.END)

    for cat in commands:
        for cmd in commands[cat]:
            if query in cmd:
                command_list.insert(tk.END, cmd)


# ---------- EVENTS ----------
category_list.bind("<<ListboxSelect>>", show_commands)
command_list.bind("<<ListboxSelect>>", show_description)

search_entry.bind("<KeyRelease>", lambda e: search_command())

root.mainloop()