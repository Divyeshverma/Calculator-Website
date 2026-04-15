import psutil
import tkinter as tk
from tkinter import ttk
import os
import signal
# Main window
root = tk.Tk()
root.title("Linux System Monitor")
root.geometry("700x500")


# Labels for CPU and Memory
cpu_label = tk.Label(root, text="CPU Usage: ", font=("Arial", 12))
cpu_label.pack()
memory_label = tk.Label(root, text="Memory Usage: ", font=("Arial", 12))
memory_label.pack()

# Process Table
columns = ("PID", "Name", "CPU %", "Memory %")
tree = ttk.Treeview(root, columns=columns, show="headings")
for col in columns:
    tree.heading(col, text=col)

tree.pack(fill=tk.BOTH, expand=True)

# Function to update system info
def update_info():
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory().percent

    cpu_label.config(text=f"CPU Usage: {cpu}%")
    memory_label.config(text=f"Memory Usage: {memory}%")

    # Clear table
    for item in tree.get_children():
        tree.delete(item)

    # Add processes
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            tree.insert("", "end", values=(
                proc.info['pid'],
                proc.info['name'],
                proc.info['cpu_percent'],
                round(proc.info['memory_percent'], 2)
            ))
        except:
            pass

    root.after(2000, update_info)


# Kill process function
def kill_process():
    selected = tree.selection()
    if selected:
        pid = tree.item(selected[0])['values'][0]
        try:
            os.kill(pid, signal.SIGTERM)
        except:
            pass


kill_btn = tk.Button(root, text="Kill Process", command=kill_process)
kill_btn.pack(pady=10)

update_info()

root.mainloop()