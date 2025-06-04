# 🔄 FiveM Resource Auto-Restarter

This Node.js-based script is designed for FiveM servers to automatically monitor and restart resources whenever a `.lua` file within them changes. It’s a developer-friendly utility that eliminates the need for manual restarts during development.

---

## ✨ Features

- Automatically scans all running resources and records the SHA1 hash of `.lua` files.
- Checks every 60 seconds for:
  - Changed `.lua` files.
  - Newly started resources.
  - Stopped or removed resources.
- Automatically restarts resources if any file change is detected.
- Ignores files in the `stream/` directory (usually models or assets).
- Toggleable via in-game or server console command.

---

## 🚀 How It Works

1. On script start, all active resources are scanned.
2. For each `.lua` file (excluding `stream/`), a hash is generated.
3. Every 60 seconds:
   - New resources are added to the watch list.
   - Stopped resources are removed from the list.
   - File hashes are rechecked and compared.
   - If a change is detected, the resource is restarted using `StopResource` and `StartResource`.

---

## 🛠️ Installation

Before starting, make sure to install required dependencies using npm:

```bash
npm install
```

1. Place the script in your server resource folder.
2. Add the following line to your `server.cfg`:

   ```ini
   ensure autorestart
   ```

3. Start the server.
4. Use the following command to toggle auto-restart:

   ```bash
   /autorestart
   ```

---

## 📌 Notes

- Only `.lua` files are monitored.
- Files inside the `stream/` directory are excluded.
- Only resources in the `started` state are tracked.
- This tool is intended for development purposes.

---

## 👤 Author & Contributions

This tool is open source and created for the FiveM developer community.

Feel free to submit issues or pull requests to contribute.

For contact [daglarefe.com](https://daglarefe.com)
