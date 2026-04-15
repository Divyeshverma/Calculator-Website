import psutil
import tkinter as tk
from tkinter import ttk
import os
import signal
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

BG = "#0f172a"
CARD = "#1e293b"
TEXT = "#e2e8f0"
ACCENT = "#38bdf8"

root = tk.Tk()
root.title("Professional Linux System Monitor")
root.geometry("1100x650")
root.configure(bg=BG)


header = tk.Label(root, text="Linux System Monitor Dashboard",
                  bg=BG, fg=TEXT, font=("Arial", 18, "bold"))
header.pack(pady=10)

# Main frame
main_frame = tk.Frame(root, bg=BG)
main_frame.pack(fill="both", expand=True)

# Left sidebar
sidebar = tk.Frame(main_frame, bg="#020617", width=200)
sidebar.pack(side="left", fill="y")

tk.Label(sidebar, text="MENU", bg="#020617",
         fg=ACCENT, font=("Arial", 14, "bold")).pack(pady=20)

# Right content
content = tk.Frame(main_frame, bg=BG)
content.pack(side="right", fill="both", expand=True)

# Cards
card_frame = tk.Frame(content, bg=BG)
card_frame.pack(pady=10)

def create_card(title):
    frame = tk.Frame(card_frame, bg=CARD, width=200, height=100)
    frame.pack_propagate(False)
    label_title = tk.Label(frame, text=title, bg=CARD,
                           fg=TEXT, font=("Arial", 12))
    label_title.pack()

    value = tk.Label(frame, text="0%", bg=CARD,
                     fg=ACCENT, font=("Arial", 16, "bold"))
    value.pack()

    return frame, value


cpu_card, cpu_val = create_card("CPU Usage")
ram_card, ram_val = create_card("RAM Usage")
disk_card, disk_val = create_card("Disk Usage")
net_card, net_val = create_card("Network")

cpu_card.grid(row=0, column=0, padx=10)
ram_card.grid(row=0, column=1, padx=10)
disk_card.grid(row=0, column=2, padx=10)
net_card.grid(row=0, column=3, padx=10)

#for making graphs
fig = Figure(figsize=(6, 2), dpi=100)
ax = fig.add_subplot(111)

cpu_data = []

canvas = FigureCanvasTkAgg(fig, master=content)
canvas.get_tk_widget().pack(pady=10)

# For table
table_frame = tk.Frame(content, bg=BG)
table_frame.pack(fill="both", expand=True)

columns = ("PID", "Name", "CPU %", "Memory %")

tree = ttk.Treeview(table_frame, columns=columns, show="headings")

for col in columns:
    tree.heading(col, text=col)

tree.pack(fill="both", expand=True)

# Process killing function
def kill_process():
    selected = tree.selection()
    if selected:
        pid = tree.item(selected[0])['values'][0]
        try:
            os.kill(pid, signal.SIGTERM)
        except:
            pass

kill_btn = tk.Button(content, text="Kill Selected Process",
                     bg=ACCENT, fg="black", command=kill_process)
kill_btn.pack(pady=5)

# Network Monitoring
old_net = psutil.net_io_counters()

# Update function
def update():
    global old_net

    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent

    new_net = psutil.net_io_counters()
    net_speed = (new_net.bytes_sent - old_net.bytes_sent) / 1024
    old_net = new_net

    cpu_val.config(text=f"{cpu}%")
    ram_val.config(text=f"{ram}%")
    disk_val.config(text=f"{disk}%")
    net_val.config(text=f"{net_speed:.1f} KB/s")

    # Graph
    cpu_data.append(cpu)
    if len(cpu_data) > 40:
        cpu_data.pop(0)

    ax.clear()
    ax.plot(cpu_data)
    ax.set_title("CPU Usage")
    canvas.draw()

    # Process Table
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

    root.after(2000, update)


update()
root.mainloop()