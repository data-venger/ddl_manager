# Snowflake DDL Explorer

A modern, high-fidelity developer dashboard to instantly browse, search, and inspect Snowflake SQL DDL scripts. The app connects dynamically to your version control repositories (both GitHub and Azure DevOps), parses your database files into structured catalog trees, and displays them with syntax-highlighting.

---

## 🚀 Key Features
* **Modern Cyber-Dark Theme**: Premium UI with glassmorphic cards, harmonized accent states, custom scrollbars, and seamless transitions.
* **Smart Catalog Tree**: Parses raw SQL file structures into database hierarchy trees (`Database` ➔ `Schema` ➔ `Type` ➔ `Objects`).
* **Fast Multi-Filter Search**: Search objects by name, schema, or database while filtering by Object Type (Tables, Views, Stored Procedures) and Environment.
* **One-Click Actions**: Fast copy-to-clipboard actions and direct code view links back to your origin repository files.
* **Dual Integration**: Native endpoints supporting both **GitHub** and **Azure DevOps Services**.

---

## 📁 Expected Repository Layout
To render files in the catalog tree correctly, files should be structured in your repository matching this layout:
```text
[DATABASE_NAME]/[SCHEMA_NAME]/[TYPE]/[OBJECT_NAME].sql
```
* **DATABASE_NAME**: e.g., `DEV_DB`, `PROD_DB`
* **SCHEMA_NAME**: e.g., `SALES`, `MARKETING`, `CORE`
* **TYPE**: `table`, `view`, or `procedures` / `sps` (automatically normalized)
* **OBJECT_NAME**: e.g., `TBL_CUSTOMER.sql`, `VW_ORDERS.sql`, `SP_LOAD_DELTA.sql`

Example paths:
* `DEV_DB/AAA/table/TBL_CUSTOMER.sql`
* `PROD_DB/CCC/view/VW_ACTIVITIES.sql`
* `DEV_DB/BBB/procedures/SP_CDC_LOAD.sql`

---

## 💻 Running the App Locally

Since the application uses standard ES6 JavaScript modules and asynchronous fetch APIs, it must be hosted on a local web server (opening raw `index.html` via double-click will block external API requests due to browser CORS security rules).

### Quick Start with Python
1. Open terminal inside the project directory:
   ```bash
   python -m http.server 8080
   ```
2. Open your browser to: `http://localhost:8080`

### Quick Start with Node.js
If you have Node.js installed, you can launch a dev server using `npx`:
```bash
npx live-server
```

---

## 🔌 Repository Integration Setup Guides

Click the **Connect GitHub Repo** button in the welcome screen or click the **Settings** gear icon in the sidebar header to open the connection dialog.

### 🐙 Option A: Connecting to GitHub (Public & Private)

#### Step 1: Create a Personal Access Token (PAT)
1. Go to **GitHub** ➔ Click your profile icon ➔ **Settings**.
2. Scroll to the bottom and click **Developer Settings**.
3. Under **Personal access tokens**, select:
   * **Fine-grained tokens (Recommended)**: Click **Generate new token**. Under *Repository access*, select your repo. Under *Permissions*, select **Repository permissions** ➔ **Contents** ➔ Set to **Read-only**.
   * **Tokens (classic)**: Click **Generate new token (classic)**. Check the **`repo`** scope checkbox.
4. Generate the token and copy the key (e.g. `ghp_...`).

#### Step 2: Configure the DDL Explorer Connection Modal
* **GitHub Personal Access Token (PAT)**: Paste your generated token (`ghp_...`). *(Optional for public repositories)*
* **Repo Owner / Username**: Enter the username or organization owning the repo (e.g., `data-venger`).
* **Repository Name**: Enter the repository name (e.g., `ddl_manager`).
* **Branch**: Target branch to read (e.g., `main`).
* **API Base URL**: Use the default `https://api.github.com` (leave as-is for public/standard GitHub).
* Click **Test & Save Connection**.

---

### 🏛️ Option B: Connecting to Azure DevOps Git Repositories

The DDL Explorer has built-in support to interact with Azure DevOps Services git repositories using the DevOps REST API.

#### Step 1: Create an Azure DevOps Personal Access Token (PAT)
1. Log into your **Azure DevOps Organization** (e.g. `https://dev.azure.com/your-org`).
2. In the top-right corner, click the **User Settings** (gear/user icon) ➔ select **Personal Access Tokens**.
3. Click **New Token**.
4. Configure the token details:
   * **Name**: `DDL Explorer Read Token`
   * **Organization**: Select your organization.
   * **Scopes**: Select **Custom defined** ➔ scroll to **Code** ➔ Check **Read** access.
5. Click **Create** and copy the PAT value immediately (e.g. `6oq...`).

#### Step 2: Configure the DDL Explorer Connection Modal
* **GitHub Personal Access Token (PAT)**: Paste your **Azure DevOps PAT** here. *(The app detects the Azure URL and automatically encodes it using DevOps Basic Authentication)*
* **Repo Owner / Username**: Enter your Organization or Project name (e.g., `myorg` or `myproject`).
* **Repository Name**: Enter the exact Azure DevOps Git Repository name (e.g., `ddl_manager`).
* **Branch**: Target branch name (e.g., `main`).
* **API Base URL**: Use your project's Azure DevOps API base URL. It must be formatted as:
  ```text
  https://dev.azure.com/{organization}/{project}
  ```
  *(Example: `https://dev.azure.com/data-venger/ddl-project`)*
* Click **Test & Save Connection**.
