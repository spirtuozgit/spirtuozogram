import subprocess
import tkinter as tk
from tkinter import messagebox, simpledialog, scrolledtext
import os
import datetime
import shutil
import zipfile
import threading

try:
    import psutil
except ImportError:
    psutil = None  # если нет psutil, просто пропускаем проверку

# === НАСТРОЙКИ ===
PROJECT_PATH = os.getcwd()
ARCHIVE_DIR = r"D:\Archive Spirtuozogram"
NEXT_DIR = os.path.join(PROJECT_PATH, ".next")
LOG_FILE = os.path.join(PROJECT_PATH, "manager_log.txt")

# === ЛОГ ===
def write_log(action):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {action}\n")

# === УТИЛИТЫ ===
def run_command(command, cwd=PROJECT_PATH):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding="utf-8", cwd=cwd)
        return result.stdout or result.stderr
    except Exception as e:
        return str(e)

def show_output(title, text):
    w = tk.Toplevel(root)
    w.title(title)
    w.geometry("680x420")
    t = scrolledtext.ScrolledText(w, wrap=tk.WORD, bg="#111", fg="#0f0", font=("Consolas",10))
    t.insert(tk.END, text)
    t.pack(expand=True, fill="both")
    t.config(state="disabled")

# === GIT ===
def git_pull(): show_output("Git Pull", run_command("git pull"))
def git_commit_push():
    msg = simpledialog.askstring("Комментарий", "Введите комментарий для коммита:") or "update"
    show_output("Commit + Push", run_command(f'git add -A && git commit -m "{msg}" && git push'))
def git_force_push():
    if messagebox.askyesno("⚠ Внимание", "Это перезапишет удалённый репозиторий! Продолжить?"):
        show_output("Force Push", run_command("git push origin main --force"))
def git_log(): show_output("История коммитов", run_command("git log --oneline -n 15"))

# === SERVER ===
server_process = None
log_window = None
log_text = None
stop_flag = False

def stream_server_output(proc):
    """Поток чтения stdout npm run dev"""
    global stop_flag
    while True:
        if stop_flag or proc.poll() is not None:
            break
        line = proc.stdout.readline()
        if not line:
            continue
        log_text.insert(tk.END, line)
        log_text.see(tk.END)
        log_text.update()

def start_server():
    """Запускает npm run dev в фоне"""
    global server_process, log_window, log_text, stop_flag

    if server_process and server_process.poll() is None:
        messagebox.showinfo("Сервер", "Сервер уже запущен 🟢")
        return

    try:
        log_window = tk.Toplevel(root)
        log_window.title("🖥️ Логи сервера — npm run dev")
        log_window.geometry("800x500")

        log_text = scrolledtext.ScrolledText(log_window, wrap=tk.WORD, bg="#111", fg="#0f0", font=("Consolas",10))
        log_text.pack(expand=True, fill="both")

        stop_flag = False
        server_process = subprocess.Popen(
            "npm run dev",
            cwd=PROJECT_PATH,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8"
        )

        threading.Thread(target=stream_server_output, args=(server_process,), daemon=True).start()
        write_log("Сервер запущен (npm run dev)")
        messagebox.showinfo("Сервер", "🚀 Сервер запущен! Перейди на http://localhost:3000")
    except Exception as e:
        messagebox.showerror("Ошибка запуска", str(e))
        write_log(f"Ошибка запуска сервера: {e}")

def stop_server():
    """Останавливает все процессы node и очищает .next"""
    global stop_flag
    stop_flag = True
    run_command("taskkill /f /im node.exe")
    if os.path.exists(NEXT_DIR):
        shutil.rmtree(NEXT_DIR, ignore_errors=True)
    write_log("Сервер остановлен и .next удалён")
    messagebox.showinfo("Сервер", "🛑 Сервер остановлен и .next удалён")

def restart_server():
    stop_server()
    start_server()

def update_server():
    stop_server()
    run_command("git pull")
    start_server()

# === BACKUP ===
def backup_project():
    try:
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        d = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        zip_path = os.path.join(ARCHIVE_DIR, f"Spirtuozogram_{d}.zip")

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
            for r, _, f in os.walk(PROJECT_PATH):
                if ".git" in r or "node_modules" in r: continue
                for file in f:
                    p = os.path.join(r, file)
                    z.write(p, os.path.relpath(p, PROJECT_PATH))
        write_log(f"Создан архив: {zip_path}")
        messagebox.showinfo("Архив", f"✅ Архив создан:\n{zip_path}")
    except Exception as e:
        write_log(f"Ошибка архивации: {e}")
        messagebox.showerror("Ошибка", str(e))

# === Проверка сервера ===
def is_node_running():
    if not psutil:
        return False
    for p in psutil.process_iter(attrs=["name"]):
        if "node" in p.info["name"].lower():
            return True
    return False

def update_status():
    if is_node_running():
        status_label.config(text="🟢 Сервер запущен", fg="#00ff7f")
    else:
        status_label.config(text="🔴 Сервер остановлен", fg="#ff5555")
    root.after(2000, update_status)

# === GUI ===
root = tk.Tk()
root.title("Spirtuozogram Git & Server Control")
root.geometry("470x670")
root.config(bg="#111")

tk.Label(root, text="🌀 Spirtuozogram Manager", bg="#111", fg="#6eff8c",
         font=("Arial",14,"bold")).pack(pady=10)

status_label = tk.Label(root, text="🔴 Проверка статуса...", bg="#111", fg="#aaa",
                        font=("Arial",10,"bold"))
status_label.pack(pady=(0,15))

btn_style = dict(width=35, height=2, font=("Arial",10,"bold"),
                 bg="#222", fg="#fff", relief="groove", activebackground="#333")

exit_style = dict(width=35, height=2, font=("Arial",10,"bold"),
                  bg="#333", fg="#ccc", relief="groove", activebackground="#555")

# --- GIT ---
tk.Label(root, text="⚙️ GIT УПРАВЛЕНИЕ", bg="#111", fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(10,5))
tk.Button(root, text="🔄 Pull", command=git_pull, **btn_style).pack(pady=3)
tk.Button(root, text="🪶 Commit + Push", command=git_commit_push, **btn_style).pack(pady=3)
tk.Button(root, text="⚠ Force Update", command=git_force_push,
          bg="#550000", fg="#fff", activebackground="#770000",
          relief="groove", width=35, height=2, font=("Arial",10,"bold")).pack(pady=3)
tk.Button(root, text="📜 Log", command=git_log, **btn_style).pack(pady=3)

# --- SERVER ---
tk.Label(root, text="🖥️ SERVER УПРАВЛЕНИЕ", bg="#111", fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(15,5))
tk.Button(root, text="🚀 Запустить сервер", command=start_server, **btn_style).pack(pady=3)
tk.Button(root, text="🔁 Перезапустить", command=restart_server, **btn_style).pack(pady=3)
tk.Button(root, text="🧩 Обновить (pull + rebuild)", command=update_server, **btn_style).pack(pady=3)
tk.Button(root, text="🛑 Остановить и удалить .next", command=stop_server,
          bg="#440000", fg="#fff", activebackground="#660000",
          relief="groove", width=35, height=2, font=("Arial",10,"bold")).pack(pady=3)

# --- BACKUP ---
tk.Label(root, text="💾 BACKUP", bg="#111", fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(15,5))
tk.Button(root, text="📦 Создать архив проекта", command=backup_project, **btn_style).pack(pady=5)

# --- EXIT ---
tk.Button(root, text="🚪 Выход", command=root.destroy, **exit_style).pack(pady=15)

tk.Label(root, text="Spirtuozogram Dev Tools", font=("Arial",8),
         bg="#111", fg="#555").pack(side="bottom", pady=10)

update_status()
root.mainloop()
