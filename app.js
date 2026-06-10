/**
 * DDL Explorer - Application Controller
 */

class DDLExplorer {
    constructor() {
        // App State
        this.config = {
            pat: '',
            owner: '',
            repo: '',
            branch: 'main',
            apiUrl: 'https://api.github.com'
        };
        
        this.catalog = []; // Flat list of parsed SQL files
        this.treeData = {}; // Hierarchical tree model
        this.selectedFile = null;
        
        // Initialize DOM Elements
        this.initDOMElements();
        // Bind Event Handlers
        this.bindEvents();
        // Load Saved Configuration
        this.loadConfig();
        
        // Initialize Lucide icons
        lucide.createIcons();
    }

    initDOMElements() {
        // Navigation & Views
        this.appContainer = document.getElementById('app');
        this.viewSetup = document.getElementById('view-setup');
        this.viewCode = document.getElementById('view-code');
        
        // Sidebar Tree States
        this.treeLoading = document.getElementById('tree-loading');
        this.treeEmpty = document.getElementById('tree-empty');
        this.catalogTree = document.getElementById('catalog-tree');
        
        // Search & Filters
        this.searchInput = document.getElementById('search-input');
        this.btnClearSearch = document.getElementById('btn-clear-search');
        this.filterEnv = document.getElementById('filter-env');
        this.filterType = document.getElementById('filter-type');
        
        // Code Viewer
        this.codeTitle = document.getElementById('code-title');
        this.codeBreadcrumbs = document.getElementById('code-breadcrumbs');
        this.sqlCode = document.getElementById('sql-code');
        this.codeLoading = document.getElementById('code-loading');
        this.codeError = document.getElementById('code-error');
        this.codeErrorMsg = document.getElementById('code-error-msg');
        
        // Buttons
        this.btnSettings = document.getElementById('btn-settings');
        this.btnSetupGithub = document.getElementById('btn-setup-github');
        this.btnLoadConfig = document.getElementById('btn-load-config');
        this.btnCopyCode = document.getElementById('btn-copy-code');
        this.btnRetryCode = document.getElementById('btn-retry-code');
        this.linkGithub = document.getElementById('link-github');
        
        // Settings Modal
        this.settingsModal = document.getElementById('settings-modal');
        this.settingsForm = document.getElementById('settings-form');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.btnCancelSettings = document.getElementById('btn-cancel-settings');
        this.btnSaveSettings = document.getElementById('btn-save-settings');
        this.settingsError = document.getElementById('settings-error');
        this.settingsSuccess = document.getElementById('settings-success');
        
        // Form Inputs
        this.inputPat = document.getElementById('input-pat');
        this.inputOwner = document.getElementById('input-owner');
        this.inputRepo = document.getElementById('input-repo');
        this.inputBranch = document.getElementById('input-branch');
        this.inputApiUrl = document.getElementById('input-api-url');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toast-message');
    }

    bindEvents() {
        // Settings Modal Events
        const openModal = () => {
            this.inputPat.value = this.config.pat || '';
            this.inputOwner.value = this.config.owner || '';
            this.inputRepo.value = this.config.repo || '';
            this.inputBranch.value = this.config.branch || 'main';
            this.inputApiUrl.value = this.config.apiUrl || 'https://api.github.com';
            
            this.settingsError.style.display = 'none';
            this.settingsSuccess.style.display = 'none';
            this.settingsModal.classList.add('show');
        };

        const closeModal = () => {
            this.settingsModal.classList.remove('show');
        };

        this.btnSettings.addEventListener('click', openModal);
        this.btnSetupGithub.addEventListener('click', openModal);
        this.btnLoadConfig.addEventListener('click', openModal);
        this.btnCloseModal.addEventListener('click', closeModal);
        this.btnCancelSettings.addEventListener('click', closeModal);
        
        this.settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.testAndSaveSettings();
        });

        // Search & Filter Events
        this.searchInput.addEventListener('input', () => this.handleSearchAndFilter());
        this.btnClearSearch.addEventListener('click', () => {
            this.searchInput.value = '';
            this.btnClearSearch.style.display = 'none';
            this.handleSearchAndFilter();
            this.searchInput.focus();
        });
        
        this.filterEnv.addEventListener('change', () => this.handleSearchAndFilter());
        this.filterType.addEventListener('change', () => this.handleSearchAndFilter());

        // Code Action Events
        this.btnCopyCode.addEventListener('click', () => this.copyCodeToClipboard());
        this.btnRetryCode.addEventListener('click', () => {
            if (this.selectedFile) this.loadFileContent(this.selectedFile);
        });
    }

    loadConfig() {
        this.config.pat = localStorage.getItem('ddl_explorer_pat') || '';
        this.config.owner = localStorage.getItem('ddl_explorer_owner') || '';
        this.config.repo = localStorage.getItem('ddl_explorer_repo') || '';
        this.config.branch = localStorage.getItem('ddl_explorer_branch') || 'main';
        this.config.apiUrl = localStorage.getItem('ddl_explorer_apiUrl') || 'https://api.github.com';

        if (this.config.pat && this.config.owner && this.config.repo) {
            // Already configured, load the repository tree
            this.fetchRepositoryCatalog();
        } else {
            this.showSetupScreen();
        }
    }

    showSetupScreen() {
        this.treeEmpty.style.display = 'flex';
        this.treeLoading.style.display = 'none';
        this.catalogTree.style.display = 'none';
        this.viewSetup.classList.add('active');
        this.viewCode.classList.remove('active');
    }

    async testAndSaveSettings() {
        // Toggle spinner
        const btnText = this.btnSaveSettings.querySelector('.btn-text');
        const btnSpinner = this.btnSaveSettings.querySelector('.btn-spinner');
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        this.settingsError.style.display = 'none';
        this.settingsSuccess.style.display = 'none';

        const pat = this.inputPat.value.trim();
        const owner = this.inputOwner.value.trim();
        const repo = this.inputRepo.value.trim();
        const branch = this.inputBranch.value.trim() || 'main';
        const apiUrl = this.inputApiUrl.value.trim() || 'https://api.github.com';

        try {
            // Test GitHub API by fetching the tree
            const tree = await this.fetchGitTree(owner, repo, branch, pat, apiUrl);
            
            // If successful, save to localStorage
            localStorage.setItem('ddl_explorer_pat', pat);
            localStorage.setItem('ddl_explorer_owner', owner);
            localStorage.setItem('ddl_explorer_repo', repo);
            localStorage.setItem('ddl_explorer_branch', branch);
            localStorage.setItem('ddl_explorer_apiUrl', apiUrl);

            // Update local state config
            this.config = { pat, owner, repo, branch, apiUrl };

            this.settingsSuccess.style.display = 'block';
            
            setTimeout(() => {
                this.settingsModal.classList.remove('show');
                this.parseAndLoadTree(tree);
            }, 1000);

        } catch (error) {
            this.settingsError.textContent = `Connection failed: ${error.message}`;
            this.settingsError.style.display = 'block';
        } finally {
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }

    async fetchGitTree(owner, repo, branch, pat, apiUrl) {
        // Clean URL trailing slash
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const url = `${baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (pat) {
            headers['Authorization'] = `token ${pat}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Check if your Personal Access Token (PAT) is correct.');
            } else if (response.status === 404) {
                throw new Error('Repository or Branch not found. Make sure the owner, repository name, and branch are exact.');
            } else {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        if (!data.tree || !Array.isArray(data.tree)) {
            throw new Error('Could not read file tree from GitHub API response.');
        }
        return data.tree;
    }

    async fetchRepositoryCatalog() {
        this.treeEmpty.style.display = 'none';
        this.catalogTree.style.display = 'none';
        this.treeLoading.style.display = 'flex';

        try {
            const tree = await this.fetchGitTree(
                this.config.owner,
                this.config.repo,
                this.config.branch,
                this.config.pat,
                this.config.apiUrl
            );
            this.parseAndLoadTree(tree);
        } catch (error) {
            console.error('Error fetching catalog:', error);
            this.treeLoading.style.display = 'none';
            this.treeEmpty.style.display = 'flex';
            
            // Show error toast
            this.showToast(`Error loading repo: ${error.message}`, 'error');
        }
    }

    parseAndLoadTree(tree) {
        this.catalog = [];
        const envs = new Set();
        
        // Parse paths from right to left
        // Expected layout: ROOT/.../[DATABASE]/[SCHEMA]/[TYPE]/[OBJECT_NAME].sql
        // e.g. DEV_DB/SALES/TABLES/CUSTOMERS.sql
        // e.g. UAT_DB/MARKETING/VIEWS/CAMPAIGN_SUMMARY.sql
        
        tree.forEach(item => {
            // We only care about SQL files
            if (item.type === 'blob' && item.path.toLowerCase().endsWith('.sql')) {
                const parts = item.path.split('/');
                if (parts.length >= 4) {
                    const fileIndex = parts.length - 1;
                    const typeIndex = parts.length - 2;
                    const schemaIndex = parts.length - 3;
                    const dbIndex = parts.length - 4;
                    
                    const dbName = parts[dbIndex];
                    const schemaName = parts[schemaIndex];
                    let typeName = parts[typeIndex].toUpperCase();
                    
                    // Normalize standard folders
                    if (typeName === 'SPS' || typeName === 'STORED_PROCEDURES' || typeName === 'PROCEDURES') {
                        typeName = 'SPs';
                    } else if (typeName === 'TABLE') {
                        typeName = 'TABLES';
                    } else if (typeName === 'VIEW') {
                        typeName = 'VIEWS';
                    }
                    
                    const fileName = parts[fileIndex];
                    const objectName = fileName.substring(0, fileName.lastIndexOf('.'));
                    
                    envs.add(dbName);
                    
                    this.catalog.push({
                        db: dbName,
                        schema: schemaName,
                        type: typeName,
                        name: objectName,
                        path: item.path,
                        sha: item.sha
                    });
                }
            }
        });

        // Sort catalog alphabetically by Database, Schema, Type, Object Name
        this.catalog.sort((a, b) => {
            return a.db.localeCompare(b.db) || 
                   a.schema.localeCompare(b.schema) || 
                   a.type.localeCompare(b.type) || 
                   a.name.localeCompare(b.name);
        });

        // Populating Environment Select filter
        this.populateEnvFilter(envs);
        
        // Build Tree structure from catalog
        this.buildHierarchy();
        
        // Render Tree in Sidebar
        this.renderTree(this.treeData);
        
        this.treeLoading.style.display = 'none';
        this.catalogTree.style.display = 'block';
        
        if (this.catalog.length === 0) {
            this.showToast('Connected, but no SQL files matching DATABASE/SCHEMA/TYPE structure were found.', 'warning');
        } else {
            this.showToast(`Catalog loaded: found ${this.catalog.length} objects.`);
        }
    }

    populateEnvFilter(envsSet) {
        // Keep "All Env/DBs" as first option
        this.filterEnv.innerHTML = '<option value="">All Env/DBs</option>';
        
        const sortedEnvs = Array.from(envsSet).sort();
        sortedEnvs.forEach(env => {
            const opt = document.createElement('option');
            opt.value = env;
            opt.textContent = env;
            this.filterEnv.appendChild(opt);
        });
    }

    buildHierarchy() {
        this.treeData = {};
        
        this.catalog.forEach(item => {
            const { db, schema, type, name } = item;
            
            if (!this.treeData[db]) {
                this.treeData[db] = {};
            }
            if (!this.treeData[db][schema]) {
                this.treeData[db][schema] = {};
            }
            if (!this.treeData[db][schema][type]) {
                this.treeData[db][schema][type] = [];
            }
            
            this.treeData[db][schema][type].push(item);
        });
    }

    renderTree(treeModel) {
        this.catalogTree.innerHTML = '';
        
        const dbList = document.createElement('ul');
        dbList.className = 'tree-children';
        dbList.style.display = 'block'; // Top level is always open
        
        Object.keys(treeModel).forEach(dbName => {
            const dbNode = this.createFolderNode(dbName, 'database', 'database');
            const schemaList = document.createElement('ul');
            schemaList.className = 'tree-children';
            
            Object.keys(treeModel[dbName]).forEach(schemaName => {
                const schemaNode = this.createFolderNode(schemaName, 'folder', 'folder');
                const typeList = document.createElement('ul');
                typeList.className = 'tree-children';
                
                Object.keys(treeModel[dbName][schemaName]).forEach(typeName => {
                    let typeIcon = 'table';
                    let typeClass = 'icon-table';
                    if (typeName === 'VIEWS') {
                        typeIcon = 'eye';
                        typeClass = 'icon-view';
                    } else if (typeName === 'SPs') {
                        typeIcon = 'terminal';
                        typeClass = 'icon-sp';
                    }
                    
                    const typeNode = this.createFolderNode(typeName, typeIcon, typeClass);
                    const fileList = document.createElement('ul');
                    fileList.className = 'tree-children';
                    
                    treeModel[dbName][schemaName][typeName].forEach(fileItem => {
                        const fileNode = this.createFileNode(fileItem);
                        fileList.appendChild(fileNode);
                    });
                    
                    typeNode.appendChild(fileList);
                    typeList.appendChild(typeNode);
                });
                
                schemaNode.appendChild(typeList);
                schemaList.appendChild(schemaNode);
            });
            
            dbNode.appendChild(schemaList);
            dbList.appendChild(dbNode);
        });
        
        this.catalogTree.appendChild(dbList);
        lucide.createIcons();
    }

    createFolderNode(label, iconName, iconClass = '') {
        const li = document.createElement('li');
        li.className = 'tree-node';
        
        const header = document.createElement('div');
        header.className = 'tree-header';
        
        const toggle = document.createElement('i');
        toggle.setAttribute('data-lucide', 'chevron-right');
        toggle.className = 'tree-toggle-icon';
        
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', iconName);
        icon.className = `tree-node-icon ${iconClass}`;
        
        const span = document.createElement('span');
        span.className = 'tree-label';
        span.textContent = label;
        
        header.appendChild(toggle);
        header.appendChild(icon);
        header.appendChild(span);
        li.appendChild(header);
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            li.classList.toggle('expanded');
        });
        
        return li;
    }

    createFileNode(fileItem) {
        const li = document.createElement('li');
        li.className = 'tree-node tree-file';
        li.dataset.path = fileItem.path;
        
        const header = document.createElement('div');
        header.className = 'tree-header';
        
        const icon = document.createElement('i');
        let iconName = 'file-text';
        let iconClass = 'icon-table';
        if (fileItem.type === 'VIEWS') {
            iconName = 'eye';
            iconClass = 'icon-view';
        } else if (fileItem.type === 'SPs') {
            iconName = 'terminal';
            iconClass = 'icon-sp';
        }
        icon.setAttribute('data-lucide', iconName);
        icon.className = `tree-node-icon ${iconClass}`;
        
        const span = document.createElement('span');
        span.className = 'tree-label';
        span.textContent = fileItem.name;
        
        header.appendChild(icon);
        header.appendChild(span);
        li.appendChild(header);
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectFile(fileItem, li);
        });
        
        return li;
    }

    selectFile(fileItem, element) {
        // Deselect previous active nodes
        document.querySelectorAll('.tree-file.active').forEach(node => {
            node.classList.remove('active');
        });
        
        // Mark current node active
        if (element) {
            element.classList.add('active');
        } else {
            // If selected from search list, find and highlight in tree
            const treeNode = document.querySelector(`.tree-file[data-path="${fileItem.path}"]`);
            if (treeNode) {
                treeNode.classList.add('active');
                // Expand all parent nodes in the tree
                let parent = treeNode.parentElement;
                while (parent && parent !== this.catalogTree) {
                    if (parent.tagName === 'LI' && parent.classList.contains('tree-node')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
                // Scroll into view gently
                treeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        this.selectedFile = fileItem;
        
        // Update view title & breadcrumbs
        this.codeTitle.textContent = fileItem.name;
        
        this.codeBreadcrumbs.innerHTML = `
            <span class="crumb">${fileItem.db}</span>
            <span class="separator">/</span>
            <span class="crumb">${fileItem.schema}</span>
            <span class="separator">/</span>
            <span class="crumb-type icon-${fileItem.type.toLowerCase() === 'sps' ? 'sp' : fileItem.type.toLowerCase().slice(0, -1)}">${fileItem.type}</span>
            <span class="separator">/</span>
            <span class="crumb-active">${fileItem.name}.sql</span>
        `;
        
        // Update GitHub link
        const repoUrl = this.config.apiUrl.replace('/api/v3', '').replace('api.github.com', 'github.com');
        this.linkGithub.href = `${repoUrl}/${this.config.owner}/${this.config.repo}/blob/${this.config.branch}/${fileItem.path}`;

        // Load content
        this.loadFileContent(fileItem);
    }

    async loadFileContent(fileItem) {
        this.viewSetup.classList.remove('active');
        this.viewCode.classList.add('active');
        
        this.codeLoading.style.display = 'flex';
        this.codeError.style.display = 'none';
        this.sqlCode.textContent = '';

        try {
            const content = await this.fetchFileContentFromGitHub(fileItem.path);
            this.sqlCode.textContent = content;
            
            // Trigger PrismJS syntax highlighting
            Prism.highlightElement(this.sqlCode);
            
            // Scroll code container back to top
            this.sqlCode.parentElement.scrollTop = 0;
            this.sqlCode.parentElement.scrollLeft = 0;
        } catch (error) {
            console.error('Error fetching file content:', error);
            this.codeErrorMsg.textContent = `Could not fetch DDL content: ${error.message}`;
            this.codeError.style.display = 'flex';
        } finally {
            this.codeLoading.style.display = 'none';
        }
    }

    async fetchFileContentFromGitHub(path) {
        const baseUrl = this.config.apiUrl.endsWith('/') ? this.config.apiUrl.slice(0, -1) : this.config.apiUrl;
        const url = `${baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3.raw' // Returns raw text instead of JSON
        };
        if (this.config.pat) {
            headers['Authorization'] = `token ${this.config.pat}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        return await response.text();
    }

    handleSearchAndFilter() {
        const query = this.searchInput.value.trim().toLowerCase();
        const selectedEnv = this.filterEnv.value;
        const selectedType = this.filterType.value;

        // Show/hide clear search button
        this.btnClearSearch.style.display = query ? 'flex' : 'none';

        // Filter flat index
        const filtered = this.catalog.filter(item => {
            const matchesQuery = !query || 
                item.name.toLowerCase().includes(query) ||
                item.schema.toLowerCase().includes(query) ||
                item.db.toLowerCase().includes(query);
            
            const matchesEnv = !selectedEnv || item.db === selectedEnv;
            const matchesType = !selectedType || item.type === selectedType;

            return matchesQuery && matchesEnv && matchesType;
        });

        // Render Sidebar
        if (query) {
            // Render Flat Search List instead of tree for easier browsing during search
            this.renderFlatSearchResults(filtered);
        } else {
            // Re-render tree structure filtered by env/type dropdowns
            this.renderFilteredTree(selectedEnv, selectedType);
        }
    }

    renderFlatSearchResults(results) {
        this.catalogTree.innerHTML = '';
        
        if (results.length === 0) {
            const div = document.createElement('div');
            div.className = 'empty-state';
            div.innerHTML = `
                <i data-lucide="search-code"></i>
                <p>No matching SQL objects found.</p>
            `;
            this.catalogTree.appendChild(div);
            lucide.createIcons();
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'tree-children';
        ul.style.display = 'block';
        ul.style.paddingLeft = '0';

        results.forEach(item => {
            const li = document.createElement('li');
            li.className = 'tree-node tree-file';
            if (this.selectedFile && this.selectedFile.path === item.path) {
                li.classList.add('active');
            }
            li.dataset.path = item.path;

            const header = document.createElement('div');
            header.className = 'tree-header';
            header.style.paddingLeft = '0.5rem';
            header.style.flexDirection = 'column';
            header.style.alignItems = 'flex-start';
            header.style.gap = '2px';

            const nameWrapper = document.createElement('div');
            nameWrapper.style.display = 'flex';
            nameWrapper.style.alignItems = 'center';
            nameWrapper.style.gap = '0.5rem';
            nameWrapper.style.width = '100%';

            const icon = document.createElement('i');
            let iconName = 'file-text';
            let iconClass = 'icon-table';
            if (item.type === 'VIEWS') {
                iconName = 'eye';
                iconClass = 'icon-view';
            } else if (item.type === 'SPs') {
                iconName = 'terminal';
                iconClass = 'icon-sp';
            }
            icon.setAttribute('data-lucide', iconName);
            icon.className = `tree-node-icon ${iconClass}`;

            const spanName = document.createElement('span');
            spanName.className = 'tree-label';
            spanName.textContent = item.name;
            spanName.style.fontWeight = '500';

            nameWrapper.appendChild(icon);
            nameWrapper.appendChild(spanName);

            const pathDetails = document.createElement('span');
            pathDetails.style.fontSize = '0.75rem';
            pathDetails.style.color = 'var(--text-muted)';
            pathDetails.style.paddingLeft = '1.5rem';
            pathDetails.textContent = `${item.db} > ${item.schema} > ${item.type}`;

            header.appendChild(nameWrapper);
            header.appendChild(pathDetails);
            li.appendChild(header);

            header.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectFile(item, li);
            });

            ul.appendChild(li);
        });

        this.catalogTree.appendChild(ul);
        lucide.createIcons();
    }

    renderFilteredTree(envFilter, typeFilter) {
        if (!envFilter && !typeFilter) {
            // Normal full tree
            this.renderTree(this.treeData);
            return;
        }

        // Build filtered tree model
        const filteredTree = {};
        
        this.catalog.forEach(item => {
            const { db, schema, type } = item;
            
            const matchesEnv = !envFilter || db === envFilter;
            const matchesType = !typeFilter || type === typeFilter;
            
            if (matchesEnv && matchesType) {
                if (!filteredTree[db]) {
                    filteredTree[db] = {};
                }
                if (!filteredTree[db][schema]) {
                    filteredTree[db][schema] = {};
                }
                if (!filteredTree[db][schema][type]) {
                    filteredTree[db][schema][type] = [];
                }
                filteredTree[db][schema][type].push(item);
            }
        });

        this.renderTree(filteredTree);
        
        // Auto expand nodes when filter is active to save user clicks
        document.querySelectorAll('#catalog-tree .tree-node').forEach(node => {
            node.classList.add('expanded');
        });
    }

    copyCodeToClipboard() {
        if (!this.selectedFile) return;
        
        const codeText = this.sqlCode.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            this.showToast('SQL DDL copied to clipboard!');
            
            // Visual feedback on button
            const icon = this.btnCopyCode.querySelector('i');
            const label = this.btnCopyCode.querySelector('span');
            
            icon.setAttribute('data-lucide', 'check');
            label.textContent = 'Copied!';
            this.btnCopyCode.style.borderColor = 'var(--color-success)';
            this.btnCopyCode.style.color = 'var(--color-success)';
            lucide.createIcons();

            setTimeout(() => {
                icon.setAttribute('data-lucide', 'copy');
                label.textContent = 'Copy SQL';
                this.btnCopyCode.style.borderColor = '';
                this.btnCopyCode.style.color = '';
                lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        this.toast.className = 'toast show';
        
        if (type === 'error') {
            this.toast.style.borderLeftColor = 'var(--color-error)';
        } else if (type === 'warning') {
            this.toast.style.borderLeftColor = 'var(--color-warning)';
        } else {
            this.toast.style.borderLeftColor = 'var(--color-success)';
        }

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Instantiate App on Load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new DDLExplorer();
});
