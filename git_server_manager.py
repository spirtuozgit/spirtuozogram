import subprocess
import tkinter as tk
from tkinter import messagebox, simpledialog, scrolledtext
import os, datetime, shutil, zipfile, threading, re, webbrowser

try:
    import psutil
except ImportError:
    psutil = None

# === НАСТРОЙКИ ===
PROJECT_PATH = os.getcwd()
ARCHIVE_DIR = r"D:\Archive Spirtuozogram"
NEXT_DIR = os.path.join(PROJECT_PATH, ".next")
LOG_FILE = os.path.join(PROJECT_PATH, "manager_log.txt")

# === ЛОГ ===
def write_log(msg):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}\n")

# === ОБЩИЕ УТИЛИТЫ ===
def run_cmd(cmd, cwd=PROJECT_PATH):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8", cwd=cwd)
    return r.stdout or r.stderr

def show_output(title, text):
    w = tk.Toplevel(root)
    w.title(title); w.geometry("700x420")
    t = scrolledtext.ScrolledText(w, wrap=tk.WORD, bg="#111", fg="#0f0", font=("Consolas",10))
    t.insert("1.0", text); t.pack(expand=1, fill="both"); t.config(state="disabled")

# === GIT ===
def git_pull(): show_output("Git Pull", run_cmd("git pull"))
def git_commit_push():
    msg = simpledialog.askstring("Commit", "Комментарий:") or "update"
    show_output("Commit+Push", run_cmd(f'git add -A && git commit -m "{msg}" && git push'))
def git_force_push():
    if messagebox.askyesno("⚠", "Перезаписать удалённый репозиторий?"):
        show_output("Force Push", run_cmd("git push origin main --force"))
def git_log(): show_output("История", run_cmd("git log --oneline -n 15"))

# === SERVER ===
server_proc = None
stop_flag = False
SERVER_URL = None
log_window = None
log_text = None

def stream_output(proc):
    global SERVER_URL
    url_pattern = re.compile(r'(https?://[^\s]+)')
    while True:
        if stop_flag or proc.poll() is not None: break
        line = proc.stdout.readline()
        if not line: continue
        log_text.insert(tk.END, line)
        log_text.see(tk.END)
        log_text.update()
        m = url_pattern.search(line)
        if m:
            url = m.group(1)
            if any(x in url for x in ["localhost","127.","192.","http://","https://"]):
                SERVER_URL = url

def show_link_popup():
    url = SERVER_URL or "http://localhost:3000"
    popup = tk.Toplevel(root)
    popup.title("Сервер"); popup.geometry("320x150"); popup.config(bg="#111")
    tk.Label(popup, text="🚀 Сервер запущен!", fg="#6eff8c", bg="#111",
             font=("Arial",11,"bold")).pack(pady=(20,5))
    link = tk.Label(popup, text=url, fg="#00bbff", cursor="hand2",
                    bg="#111", font=("Consolas",10,"underline"))
    link.pack()
    link.bind("<Button-1>", lambda e: webbrowser.open(url))
    tk.Button(popup, text="OK", command=popup.destroy,
              bg="#222", fg="#fff", width=10, relief="groove").pack(pady=15)

def start_server():
    global server_proc, stop_flag, log_window, log_text
    if server_proc and server_proc.poll() is None:
        messagebox.showinfo("Сервер", "Уже запущен 🟢"); return
    try:
        log_window = tk.Toplevel(root)
        log_window.title("🖥️ Логи сервера — npm run dev")
        log_window.geometry("800x500")
        log_text = scrolledtext.ScrolledText(log_window, wrap=tk.WORD,
                    bg="#111", fg="#0f0", font=("Consolas",10))
        log_text.pack(expand=True, fill="both")
        stop_flag = False
        server_proc = subprocess.Popen(
            "npm run dev", cwd=PROJECT_PATH, shell=True,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, encoding="utf-8"
        )
        threading.Thread(target=stream_output, args=(server_proc,), daemon=True).start()
        write_log("Сервер запущен")
        root.after(3000, show_link_popup)
    except Exception as e:
        messagebox.showerror("Ошибка запуска", str(e))
        write_log(f"Ошибка запуска: {e}")

def stop_server():
    global stop_flag
    stop_flag = True
    run_cmd("taskkill /f /im node.exe")
    if os.path.exists(NEXT_DIR):
        shutil.rmtree(NEXT_DIR, ignore_errors=True)
    write_log("Сервер остановлен и .next удалён")
    messagebox.showinfo("Сервер", "🛑 Остановлен и .next удалён")

def restart_server(): stop_server(); start_server()
def update_server(): stop_server(); run_cmd("git pull"); start_server()

# === BACKUP ===
def backup():
    try:
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        name = datetime.datetime.now().strftime("Spirtuozogram_%Y-%m-%d_%H-%M-%S.zip")
        path = os.path.join(ARCHIVE_DIR, name)
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            for r,_,f in os.walk(PROJECT_PATH):
                if ".git" in r or "node_modules" in r: continue
                for file in f:
                    z.write(os.path.join(r,file), os.path.relpath(os.path.join(r,file),PROJECT_PATH))
        write_log(f"Создан архив {path}")
        messagebox.showinfo("Архив", f"✅ Архив создан:\n{path}")
    except Exception as e:
        write_log(f"Ошибка архивации: {e}")
        messagebox.showerror("Ошибка", str(e))

# === ПРОВЕРКА СЕРВЕРА ===
def is_node_running():
    if not psutil: return False
    for p in psutil.process_iter(attrs=["name"]):
        if "node" in p.info["name"].lower(): return True
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

tk.Label(root,text="🌀 Spirtuozogram Manager",bg="#111",fg="#6eff8c",
         font=("Arial",14,"bold")).pack(pady=10)
status_label = tk.Label(root,text="🔴 Проверка статуса...",bg="#111",fg="#aaa",
                        font=("Arial",10,"bold")); status_label.pack(pady=(0,15))

btn = dict(width=35,height=2,font=("Arial",10,"bold"),bg="#222",fg="#fff",
           relief="groove",activebackground="#333")
exit_btn = dict(width=35,height=2,font=("Arial",10,"bold"),
                bg="#333",fg="#ccc",relief="groove",activebackground="#555")

tk.Label(root,text="⚙️ GIT УПРАВЛЕНИЕ",bg="#111",fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(10,5))
tk.Button(root,text="🔄 Pull",command=git_pull,**btn).pack(pady=3)
tk.Button(root,text="🪶 Commit + Push",command=git_commit_push,**btn).pack(pady=3)
tk.Button(root,text="⚠ Force Update",command=git_force_push,
          bg="#550000",fg="#fff",activebackground="#770000",
          relief="groove",width=35,height=2,font=("Arial",10,"bold")).pack(pady=3)
tk.Button(root,text="📜 Log",command=git_log,**btn).pack(pady=3)

tk.Label(root,text="🖥️ SERVER УПРАВЛЕНИЕ",bg="#111",fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(15,5))
tk.Button(root,text="🚀 Запустить сервер",command=start_server,**btn).pack(pady=3)
tk.Button(root,text="🔁 Перезапустить",command=restart_server,**btn).pack(pady=3)
tk.Button(root,text="🧩 Обновить (pull + rebuild)",command=update_server,**btn).pack(pady=3)
tk.Button(root,text="🛑 Остановить и удалить .next",command=stop_server,
          bg="#440000",fg="#fff",activebackground="#660000",
          relief="groove",width=35,height=2,font=("Arial",10,"bold")).pack(pady=3)

tk.Label(root,text="💾 BACKUP",bg="#111",fg="#6eff8c",
         font=("Arial",11,"bold")).pack(pady=(15,5))
tk.Button(root,text="📦 Создать архив проекта",command=backup,**btn).pack(pady=5)
tk.Button(root,text="🚪 Выход",command=root.destroy,**exit_btn).pack(pady=15)

tk.Label(root,text="Spirtuozogram Dev Tools",font=("Arial",8),
         bg="#111",fg="#555").pack(side="bottom",pady=10)

update_status()
root.mainloop()
