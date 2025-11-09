# VSCode AI Web Explorer

A customized fork of Visual Studio Code featuring an integrated AI assistant and embedded web browser. The default editor area has been replaced by the **AI Web Explorer** app.

---

## 🚀 Features

* **Embedded Browser:** Load any website directly inside VSCode from an input box.
* **AI Chatbox:** Ask questions about the website using Gemini LLM.
* **Two-Panel Layout:**

  * Left (80%): Website viewer.
  * Right (20%): AI chatbox.
* Tested successfully with `https://wikipedia.org` (no proxy required).

---

## 🧩 Project Structure

```
src/vs/workbench/contrib/aiWebBrowser/
 ├── browser/
 │   ├── aiWebBrowserEditor.ts        # Main React-based view (browser + chatbox)
 │   ├── aiWebBrowserInput.ts         # Editor Input
 │   ├── aiWebBrowser.contribution.ts # Entry point registration
```

---

## ⚙️ Prerequisites (Windows)

In order to clone the repository and install dependencies via npm, you need network access.

> ⚠️ **Important:** Clone the repository into a path **without spaces** to avoid errors while compiling native modules.

### Required Tools

* **Git**
* **Node.js** (x64 or ARM64) version **≥ 20.x** (check `.nvmrc` for the recommended version)

  * If using `nvm`, set the default version using:

    ```bash
    nvm alias default <VERSION>
    ```
  * **Windows (ARM64):** Add `arm64` postfix, e.g. `nvm install 22 arm64`.
* **Python** (for `node-gyp`)

  * Ensure Python runs correctly from the command prompt.
  * Install setuptools if missing:

    ```bash
    pip install setuptools
    ```
* **C/C++ Build Tools**

  * Install **Visual Studio Build Tools** or **Visual Studio Community Edition**.
  * Minimum workload: **Desktop Development with C++**.
  * Required components (for Spectre-mitigated builds):

    * `MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs (Latest)`
    * `C++ ATL for latest build tools with Spectre Mitigations`
    * `C++ MFC for latest build tools with Spectre Mitigations`
  * **Windows on ARM only:** install `Windows 10 (Or 11) SDK (10.0.20348.0)`.
  * After installation, run:

    ```bash
    npm config edit
    ```

    and add:

    ```
    msvs_version=2022
    ```

> ⚠️ Ensure your user profile path only contains ASCII characters (e.g., `C:\Users\John`). Non-ASCII paths can cause `node-gyp` issues.

## ⚙️ Setup Instructions

### 1. Clone and install dependencies

```bash
git clone https://github.com/phambaophuc/vscode.git
cd vscode
git checkout feat/ai-web-browser
npm install
```

### 2. Build and run

For web build:

```bash
npm run watch
./scripts/code-web.sh
```

For desktop build:

```bash
npm run watch
./scripts/code.bat
```

---

## 🧠 How It Works

1. The **embedded browser** loads the given website URL entered by the user.
2. The **chatbox** accepts user queries about the website’s content.
3. On submit, it sends the prompt to the **Gemini API** and displays the AI’s answer above the chat input.
4. The user can repeatedly ask questions, summarize, or extract details from the loaded webpage.

---

## 🔑 Configuration

You do **not** need a `.env` file.
The **Gemini API key** is entered directly via the input box in the chat UI.

Example usage:

1. Enter a website URL (e.g. `https://wikipedia.org`) and click **Load**.
2. Enter your Gemini API key in the input field (You can get API key from https://aistudio.google.com/api-keys).
3. Type a question (e.g. *"Summarize this page"*) and press Enter.
4. The AI response will appear above the chat input box.

---

## 🖥️ Launching the AI Web Browser

After starting VSCode from your build, open the **Command Palette** using:

```
Ctrl + Shift + P
```

Then search for and select:

```
AI Web Browser: Open
```

This will open the custom AI Web Browser view inside the main editor area.

| Command Palette Search                                    | Result                                               |
| --------------------------------------------------------- | ---------------------------------------------------- |
| ![Command Palette Search](https://github.com/user-attachments/assets/ba4dd8dd-af74-442d-b66e-462a732477fb) | ![AI Web Browser Open](https://github.com/user-attachments/assets/cc456cec-3e0e-4253-bf3b-2b1f0cf75c0b) |

---

## 🖼️ Screenshots

| Embedded Browser                               | AI Chatbox                                  |
| ---------------------------------------------- | ------------------------------------------- |
| ![Browser Screenshot](https://github.com/user-attachments/assets/b3f5c10b-3909-45c5-b287-2dc11ad8f80d) | ![Chatbox Screenshot](https://github.com/user-attachments/assets/3b511dd5-c847-4498-96a7-27f963b7cd32) |

**Full Interface:**

![Full UI](https://github.com/user-attachments/assets/e215b601-7e8e-4837-a0e3-aad14b92b50e)

## 🧑‍💻 Author

Developed by **Pham Bao Phuc**
