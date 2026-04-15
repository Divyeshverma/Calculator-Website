const boot = document.getElementById("bootScreen");
const loginScreen = document.getElementById("loginScreen");
const terminal = document.getElementById("terminal");
const output = document.getElementById("output");
const input = document.getElementById("commandInput");

let history = [];
let historyIndex = 0;

// ---------- BOOT ----------
setTimeout(() => {
    boot.classList.add("hidden");
    loginScreen.classList.remove("hidden");
}, 2000);

// ---------- LOGIN ----------
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "guest" && pass === "1234") {
        loginScreen.classList.add("hidden");
        terminal.classList.remove("hidden");
        print("Welcome to MiniOS");
        print("Type help to begin");
    } else {
        alert("Invalid login");
    }
}

// ---------- PRINT ----------
function print(text) {
    output.innerHTML += text + "<br>";
    window.scrollTo(0, document.body.scrollHeight);
}

// ---------- FILE SYSTEM ----------
let currentDir = "~";
let files = { "~": ["projects", "notes.txt"] };
let processes = [];

// ---------- COMMAND FUNCTIONS ----------
function help() {
    print("Commands: help ls mkdir touch rm pwd ps run kill cowsay fortune figlet neofetch matrix hack sudo clear shutdown");
}

function cowsay(msg) {
    let cow = `
<pre>
 ---------
< ${msg} >
 ---------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>`;
    print(cow);
}

function fortune() {
    let f = [
        "You will master Linux.",
        "Great code is coming.",
        "Debugging builds patience."
    ];
    print(f[Math.floor(Math.random() * f.length)]);
}

function figlet(text) {
    print("<pre>### " + text.toUpperCase() + " ###</pre>");
}

function neofetch() {
    print(`
<pre>
MiniOS Web Edition
User: guest
Kernel: JavaScript
CPU: Virtual CPU
RAM: Unlimited
</pre>`);
}

function matrix() {
    let chars = "01";
    let i = 0;
    let interval = setInterval(() => {
        let line = "";
        for (let j = 0; j < 60; j++)
            line += chars[Math.floor(Math.random() * chars.length)];
        print(line);
        if (++i > 30) clearInterval(interval);
    }, 50);
}

function hack() {
    let steps = [
        "Initializing hack...",
        "Accessing secure server...",
        "Bypassing firewall...",
        "Downloading data...",
        "Hack complete."
    ];
    let i = 0;
    let interval = setInterval(() => {
        print(steps[i]);
        if (++i >= steps.length) clearInterval(interval);
    }, 700);
}

function sudo() {
    print("[sudo] password for guest:");
    setTimeout(() => print("Permission denied."), 1000);
}

// ---------- COMMAND HANDLER ----------
function runCommand(cmd) {

    let parts = cmd.split(" ");
    let c = parts[0];

    switch (c) {

        case "help": help(); break;
        case "ls": print(files[currentDir].join(" ")); break;
        case "pwd": print(currentDir); break;

        case "mkdir":
            if (parts[1]) files[currentDir].push(parts[1]);
            break;

        case "touch":
            if (parts[1]) files[currentDir].push(parts[1]);
            break;

        case "rm":
            if (parts[1])
                files[currentDir] =
                    files[currentDir].filter(f => f !== parts[1]);
            break;

        case "ps":
            print(processes.join(", "));
            break;

        case "run":
            let pid = Math.floor(Math.random() * 1000);
            processes.push(pid);
            print("Process started: " + pid);
            break;

        case "kill":
            processes =
                processes.filter(p => p != parts[1]);
            print("Process killed");
            break;

        case "cowsay": cowsay(parts.slice(1).join(" ") || "Moo"); break;
        case "fortune": fortune(); break;
        case "figlet": figlet(parts.slice(1).join(" ") || "MiniOS"); break;
        case "neofetch": neofetch(); break;
        case "matrix": matrix(); break;
        case "hack": hack(); break;
        case "sudo": sudo(); break;

        case "clear":
            output.innerHTML = "";
            break;

        case "shutdown":
            print("System halted.");
            input.disabled = true;
            break;

        default:
            print("Command not found");
    }
}

// ---------- INPUT ----------
input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        let cmd = input.value;

        history.push(cmd);
        historyIndex = history.length;

        print("guest@MiniOS:~$ " + cmd);
        runCommand(cmd);

        input.value = "";
    }

    // HISTORY UP
    if (e.key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = history[historyIndex];
        }
    }

    // HISTORY DOWN
    if (e.key === "ArrowDown") {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            input.value = history[historyIndex];
        }
    }
});