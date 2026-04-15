import psutil
import tkinter as tk
from tkinter import ttk
import os
import signal
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

# Main Window
root = tk.Tk()
root.title("Advanced Linux System Monitor")
root.geometry("900x600")

# ---------- Top Info Frame ----------
info_frame = tk.Frame(root)
info_frame.pack()

cpu_label = tk.Label(info_frame, text="CPU: 0%", font=("Arial", 12))
cpu_label.grid(row=0, column=0, padx=20)

ram_label = tk.Label(info_frame, text="RAM: 0%", font=("Arial", 12))
ram_label.grid(row=0, column=1, padx=20)

disk_label = tk.Label(info_frame, text="Disk: 0%", font=("Arial", 12))
disk_label.grid(row=0, column=2, padx=20)

net_label = tk.Label(info_frame, text="Net: 0 KB/s", font=("Arial", 12))
net_label.grid(row=0, column=3, padx=20)

# ---------- Graph ----------
fig = Figure(figsize=(5, 2), dpi=100)
ax = fig.add_subplot(111)
cpu_data = []

canvas = FigureCanvasTkAgg(fig, master=root)
canvas.get_tk_widget().pack()

# ---------- Process Table ----------
columns = ("PID", "Name", "CPU %", "Memory %")

tree = ttk.Treeview(root, columns=columns, show="headings")

for col in columns:
    tree.heading(col, text=col)

tree.pack(fill=tk.BOTH, expand=True)

# ---------- Kill Process ----------
def kill_process():
    selected = tree.selection()
    if selected:
        pid = tree.item(selected[0])['values'][0]
        try:
            os.kill(pid, signal.SIGTERM)
        except:
            pass

kill_btn = tk.Button(root, text="Kill Process", command=kill_process)
kill_btn.pack(pady=5)

# ---------- Network ----------
old_net = psutil.net_io_counters()

# ---------- Update Function ----------
def update_info():
    global old_net

    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent

    new_net = psutil.net_io_counters()
    net_speed = (new_net.bytes_sent - old_net.bytes_sent) / 1024
    old_net = new_net

    cpu_label.config(text=f"CPU: {cpu}%")
    ram_label.config(text=f"RAM: {ram}%")
    disk_label.config(text=f"Disk: {disk}%")
    net_label.config(text=f"Net: {net_speed:.2f} KB/s")

    # Update Graph
    cpu_data.append(cpu)
    if len(cpu_data) > 30:
        cpu_data.pop(0)

    ax.clear()
    ax.plot(cpu_data)
    ax.set_title("CPU Usage Live")
    canvas.draw()

    # Update Process Table
    for item in tree.get_children():
        tree.delete(item)

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

update_info()
root.mainloop()