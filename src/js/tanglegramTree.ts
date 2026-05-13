// @ts-nocheck

import { applyPdfExportFixesToSvg } from "../core/export/pdfFixes.ts";
import { cloneSvgWithComputedStyles } from "../core/export/inlineComputedStyles.ts";
import { computeTanglegramCombinedLayout } from "../core/export/tanglegramLayout.ts";
import { createTanglegramStore } from "../core/tanglegram/store.ts";

console.log("Tanglegram iframe comparison module loaded.");

const selectedTrees = { 1: null, 2: null };
const localBlobUrls = { 1: null, 2: null };
let pendingSelection = null;
let overlayTimer = null;
let manualConnectMode = false;
let boxDeleteMode = false;
let canvasPanLocked = false;
let combinedZoomInitialized = false;
let combinedZoomBehavior = null;
let combinedZoomTransform = d3.zoomIdentity.translate(20, 20).scale(1);
const layoutState = {
    rightX: -1000,
    rightY: 0
};
const tgStore = createTanglegramStore({ defaultStyle: { color: '#2563eb', width: 2, opacity: 0.7 } });
let autoMatchWorker = null;
let autoMatchRequestSeq = 0;
let exportPrepWorker = null;
let exportPrepRequestSeq = 0;
const workspaceBrowserState = {
    loaded: false,
    loading: false,
    treeList: [],
    projectList: [],
    sortBy: 'mtime',
    sortDir: 'desc',
    search: '',
    targetType: '1' // '1', '2', or 'comparison'
};
const UI_TEXT = {
    en: {
        leftTree: 'Left Tree',
        rightTree: 'Right Tree',
        leaf: 'leaf',
        foldedClade: 'folded clade',
        styleHintDefault: 'These act as default styles for new connections if none is selected.',
        styleHintSelected: (n) => `Editing style for connection ${n}.`,
        manualModeOn: 'Disable Manual Connection',
        manualModeOff: 'Enable Manual Connection',
        boxDeleteOn: 'Disable Box Deletion',
        boxDeleteOff: 'Enable Box Deletion',
        panLocked: 'Unlock Canvas Panning',
        panUnlocked: 'Lock Canvas Panning',
        notLoaded: 'Not Loaded',
        workspaceSource: (p) => `Workspace / ${p}`,
        localSource: 'Local JSON',
        selectedTree: (side, name) => `Selected ${side}: ${name}`,
        removedConnection: (l, r) => `Removed connection: ${l} ↔ ${r}`,
        exportLoadFirst: 'Please load both trees before exporting.',
        exportedSvg: 'Exported the current comparison as SVG.',
        exportedPdf: 'Exported the current comparison as PDF.',
        pdfError: (msg) => `PDF export failed: ${msg}`,
        selectedConnection: (l, r) => `Selected connection: ${l} ↔ ${r}. Double-click it to delete.`,
        boxDeleteRemoved: (n) => `Box deletion completed: removed ${n} connections.`,
        boxDeleteNone: 'No connections were hit inside the selected area.',
        noConnections: 'No connections yet',
        pickFirst: (side, kind, name) => `Selected ${side} ${kind}: ${name}. Click the target on the other tree to create a connection.`,
        pickSwitch: (side, kind, name) => `Changed selection to ${side} ${kind}: ${name}. Click the target on the other tree to create a connection.`,
        connected: (l, r) => `Connected: ${l} ↔ ${r}`,
        chooseTreesFirst: (missing) => `Please select both trees first. Missing: ${missing.join(', ')}`,
        loadingTrees: 'Loading both trees...',
        treesLoaded: 'Both trees are loaded on the same canvas. The right tree is mirrored; use mouse wheel to zoom, drag to pan, or the sliders to adjust the right tree position.',
        treeLoadFailed: (msg) => `Tree rendering failed: ${msg}`,
        treeLoadAlert: (msg) => `The dual-tree canvas did not finish rendering: ${msg}`,
        loadDualFirst: 'Please load both trees first.',
        autoConnected: (n) => `Automatically added ${n} same-name connections.`,
        autoConnectedNone: 'No matching leaf IDs or folded clade names were found.',
        workspaceNoProjects: 'No projects found in Workspace.',
        workspaceEmptyProject: 'No tree files in this project',
        workspaceLoadFailed: (msg) => `Failed to load workspace data: ${msg}`,
        workspaceSelectFailed: (msg) => `Failed to load tree from Workspace: ${msg}`,
        leftJsonReadFailed: (msg) => `Failed to read the left JSON file: ${msg}`,
        rightJsonReadFailed: (msg) => `Failed to read the right JSON file: ${msg}`,
        manualStatusOn: 'Manual connection mode is enabled. Click a leaf or folded clade label on one tree, then click its target on the other tree.',
        manualStatusOff: 'Manual connection mode is disabled. The unified canvas still supports panning, zooming, and connection editing.',
        boxDeleteStatusOn: 'Box deletion mode is enabled. Drag a rectangle with the left mouse button to remove multiple connections.',
        boxDeleteStatusOff: 'Box deletion mode is disabled.',
        panStatusLocked: 'Canvas panning is locked. You can still edit connections, use box deletion, and export.',
        panStatusUnlocked: 'Canvas panning is unlocked. Drag to pan and use the mouse wheel to zoom.',
        clearedConnections: 'Cleared all connections.',
        layoutUpdated: 'Updated the dual-tree layout. You can keep adjusting the right tree position to bring leaf-to-leaf connections closer.',
        initialStatus: 'Select Workspace JSON files for the left and right trees, then load them. The unified canvas supports panning, zooming, and visible connection endpoints.',
        saveLoadBoth: 'Please load both trees first.',
        saveNoLocal: 'Cannot save local files. Please import trees from Workspace.',
        saveFolderPrompt: 'Enter the Workspace folder name:',
        saveFolderInvalid: 'Invalid folder name. Please avoid /, \\, .., and hidden folder names.',
        savePrompt: 'Enter a file name to save this comparison:',
        saveOk: 'Saved successfully!',
        saveError: (msg) => `Error: ${msg}`,
        saveFailed: (msg) => `Failed to save: ${msg}`,
        loadedNotTanglegram: 'Loaded JSON is not a tanglegramTree',
        workspaceLoading: 'Loading workspace files...',
        workspaceSummary: (visible, total) => `${visible} shown / ${total} total`,
        workspaceSummaryLoading: 'Loading...',
        sortDesc: 'Descending',
        sortAsc: 'Ascending',
        name: 'Name',
        modified: 'Modified',
        layout: 'Layout',
        comparison: 'Comparison'
    },
    zh: {
        leftTree: '左侧树',
        rightTree: '右侧树',
        leaf: '叶节点',
        foldedClade: '折叠 clade',
        styleHintDefault: '未选中具体连线时，这些参数会作为新连线默认样式。',
        styleHintSelected: (n) => `当前正在编辑第 ${n} 条连线样式。`,
        manualModeOn: '关闭手动连线模式',
        manualModeOff: '开启手动连线模式',
        boxDeleteOn: '关闭框选删线',
        boxDeleteOff: '开启框选删线',
        panLocked: '解锁画布移动',
        panUnlocked: '锁定画布移动',
        notLoaded: '尚未加载',
        workspaceSource: (p) => `Workspace / ${p}`,
        localSource: '本地 JSON',
        selectedTree: (side, name) => `已选择${side}：${name}`,
        removedConnection: (l, r) => `已删除连线：${l} ↔ ${r}`,
        exportLoadFirst: '请先加载双树后再导出。',
        exportedSvg: '已导出当前双树比较图为 SVG。',
        exportedPdf: '已导出当前双树比较图为 PDF。',
        pdfError: (msg) => `PDF 导出失败：${msg}`,
        selectedConnection: (l, r) => `已选中连线：${l} ↔ ${r}。双击该连线可直接删除。`,
        boxDeleteRemoved: (n) => `框选删除完成：已删除 ${n} 条连线。`,
        boxDeleteNone: '框选区域内没有命中连线。',
        noConnections: '暂无连线',
        pickFirst: (side, kind, name) => `已选中 ${side}${kind}：${name}，请点击另一侧树的目标完成连线。`,
        pickSwitch: (side, kind, name) => `已改为选中 ${side}${kind}：${name}，请点击另一侧树的目标完成连线。`,
        connected: (l, r) => `已连线：${l} ↔ ${r}`,
        chooseTreesFirst: (missing) => `请先选择两棵树。缺少：${missing.join('、')}`,
        loadingTrees: '正在加载左右树图...',
        treesLoaded: '双树已加载到同一张画布。右侧树已镜像，可用鼠标滚轮缩放、拖动画布平移；也可用左侧滑杆调节右树位置。',
        treeLoadFailed: (msg) => `树图加载失败：${msg}`,
        treeLoadAlert: (msg) => `双树画布没有完成渲染：${msg}`,
        loadDualFirst: '请先加载左右双树。',
        autoConnected: (n) => `已自动添加 ${n} 条同名目标连线。`,
        autoConnectedNone: '没有找到可自动匹配的同名叶节点或折叠 clade。',
        workspaceNoProjects: 'Workspace 中没有项目。',
        workspaceEmptyProject: '该项目中暂无树文件',
        workspaceLoadFailed: (msg) => `加载 Workspace 数据失败：${msg}`,
        workspaceSelectFailed: (msg) => `从 Workspace 载入树失败：${msg}`,
        leftJsonReadFailed: (msg) => `左侧 JSON 读取失败：${msg}`,
        rightJsonReadFailed: (msg) => `右侧 JSON 读取失败：${msg}`,
        manualStatusOn: '手动连线模式已开启。请先点左侧或右侧树上的 leaf / folded clade 标签，再点另一侧对应标签完成连线。',
        manualStatusOff: '手动连线模式已关闭。当前统一画布支持平移/缩放和连线；单击连线可选中，双击连线可删除。',
        boxDeleteStatusOn: '框选删线模式已开启。按住鼠标左键在画布中拖出矩形，可批量删除命中的连线。',
        boxDeleteStatusOff: '框选删线模式已关闭。',
        panStatusLocked: '画布移动已锁定。你仍可进行连线、框选删线和导出操作。',
        panStatusUnlocked: '画布移动已解锁。可继续拖动画布与滚轮缩放。',
        clearedConnections: '已清空所有连线。',
        layoutUpdated: '已更新双树布局。你可以继续调节右树的左右/上下偏移，让 leaf-to-leaf 连线更贴近。',
        initialStatus: '先分别选择左侧和右侧的 Workspace JSON 文件，再加载双树。当前是同一张合成画布；需要手动连线时，请先开启“手动连线模式”。',
        saveLoadBoth: '请先加载双树。',
        saveNoLocal: '包含本地文件，无法保存到 Workspace。请从 Workspace 导入树。',
        saveFolderPrompt: '请输入要保存到的 Workspace 文件夹名：',
        saveFolderInvalid: '文件夹名不合法，请不要包含 /、\\、.. 或以 . 开头。',
        savePrompt: '请输入保存的文件名：',
        saveOk: '保存成功！',
        saveError: (msg) => `错误：${msg}`,
        saveFailed: (msg) => `保存失败：${msg}`,
        loadedNotTanglegram: '载入的 JSON 不是 tanglegramTree',
        workspaceLoading: '正在加载 Workspace 文件...',
        workspaceSummary: (visible, total) => `显示 ${visible} / 共 ${total}`,
        workspaceSummaryLoading: '加载中...',
        sortDesc: '降序',
        sortAsc: '升序',
        name: '名称',
        modified: '修改时间',
        layout: '布局',
        comparison: '双树比较'
    }
};

function getCurrentLangSafe() {
    return document.documentElement.lang || localStorage.getItem('tvbot_lang') || 'en';
}

function t(key, ...args) {
    const lang = getCurrentLangSafe();
    const value = (UI_TEXT[lang] && UI_TEXT[lang][key]) || UI_TEXT.en[key] || key;
    return typeof value === 'function' ? value(...args) : value;
}

function getWorkspaceModal() {
    return document.getElementById('workspaceModal');
}

function getSaveModal() {
    return document.getElementById('saveComparisonModal');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function normalizePlotType(plotType) {
    const type = String(plotType || 'normalTree');
    if (type === 'circleTree' || type === 'unrootedTree' || type === 'normalTree' || type === 'tanglegramTree') return type;
    return 'normalTree';
}

function getTreeFrame(treeNum) {
    return document.getElementById(`tree-frame-${treeNum}`);
}

function getTitleText(treeNum) {
    if (treeNum === 'comparison') return t('comparison');
    return treeNum === 1 ? t('leftTree') : t('rightTree');
}

function setStatus(message) {
    const el = document.getElementById('selection-status');
    if (el) el.textContent = message;
}

function getStyleInputs() {
    return {
        color: document.getElementById('line-color'),
        width: document.getElementById('line-width'),
        opacity: document.getElementById('line-opacity'),
        widthValue: document.getElementById('line-width-value'),
        opacityValue: document.getElementById('line-opacity-value'),
        hint: document.getElementById('style-hint')
    };
}

function getLayoutInputs() {
    return {
        rightX: document.getElementById('layout-right-x'),
        rightY: document.getElementById('layout-right-y'),
        rightXValue: document.getElementById('layout-right-x-value'),
        rightYValue: document.getElementById('layout-right-y-value')
    };
}

function updateStyleHint() {
    const inputs = getStyleInputs();
    if (tgStore.state.selectedConnectionIndex === null) {
        inputs.hint.textContent = t('styleHintDefault');
    } else {
        inputs.hint.textContent = t('styleHintSelected', tgStore.state.selectedConnectionIndex + 1);
    }
}

function updateManualModeButton() {
    const button = document.getElementById('btn-manual-mode');
    button.className = manualConnectMode ? 'btn btn-success' : 'btn btn-outline-success';
    button.textContent = manualConnectMode ? t('manualModeOn') : t('manualModeOff');
}

function updateBoxDeleteModeButton() {
    const button = document.getElementById('btn-box-delete-mode');
    button.className = boxDeleteMode ? 'btn btn-danger' : 'btn btn-outline-danger';
    button.textContent = boxDeleteMode ? t('boxDeleteOn') : t('boxDeleteOff');
}

function updatePanLockButton() {
    const button = document.getElementById('btn-toggle-pan');
    button.className = canvasPanLocked ? 'btn btn-info' : 'btn btn-outline-info';
    button.textContent = canvasPanLocked ? t('panLocked') : t('panUnlocked');
}

function refreshStyleControlLabels() {
    const inputs = getStyleInputs();
    inputs.widthValue.textContent = String(inputs.width.value);
    inputs.opacityValue.textContent = String(inputs.opacity.value);
}

function refreshLayoutControlLabels() {
    const inputs = getLayoutInputs();
    inputs.rightXValue.textContent = String(layoutState.rightX);
    inputs.rightYValue.textContent = String(layoutState.rightY);
}

function syncLayoutInputsFromState() {
    const inputs = getLayoutInputs();
    inputs.rightX.value = String(layoutState.rightX);
    inputs.rightY.value = String(layoutState.rightY);
    refreshLayoutControlLabels();
}

function syncStyleControlsFromSelection() {
    const inputs = getStyleInputs();
    const style = tgStore.state.selectedConnectionIndex !== null && tgStore.state.connections[tgStore.state.selectedConnectionIndex]
        ? tgStore.state.connections[tgStore.state.selectedConnectionIndex].style
        : tgStore.state.defaultStyle;

    inputs.color.value = style.color;
    inputs.width.value = style.width;
    inputs.opacity.value = style.opacity;
    refreshStyleControlLabels();
    updateStyleHint();
}

function readCurrentStyleInputs() {
    const inputs = getStyleInputs();
    return {
        color: inputs.color.value,
        width: Number(inputs.width.value),
        opacity: Number(inputs.opacity.value)
    };
}

function revokeLocalBlob(treeNum) {
    if (localBlobUrls[treeNum]) {
        URL.revokeObjectURL(localBlobUrls[treeNum]);
        localBlobUrls[treeNum] = null;
    }
}

function updateTreeSummary(treeNum) {
    const tree = selectedTrees[treeNum];
    const labelEl = document.getElementById(`label-tree${treeNum}`);
    const titleEl = document.getElementById(`tree-title-${treeNum}`);
    const sourceEl = document.getElementById(`tree-source-${treeNum}`);
    const openBtn = document.getElementById(`open-tree-${treeNum}`);

    if (labelEl) labelEl.textContent = tree ? `[${tree.treeName}]` : '';
    if (titleEl) titleEl.textContent = tree ? tree.treeName : getTitleText(treeNum);
    if (sourceEl) sourceEl.textContent = tree ? `${tree.sourceLabel} | ${tree.plotType}` : t('notLoaded');
    if (openBtn) openBtn.disabled = !tree;
}

function buildRenderUrl(config) {
    const params = new URLSearchParams({
        originalJsonDataUri: config.dataUrl,
        projectId: config.projectId || 'default',
        treeTitle: config.treeName,
        embed: '1'
    });
    return `/${config.plotType}.html?${params.toString()}`;
}

function setSelectedTree(treeNum, config) {
    revokeLocalBlob(treeNum);
    if (config.localBlobUrl) localBlobUrls[treeNum] = config.localBlobUrl;
    selectedTrees[treeNum] = {
        ...config,
        renderUrl: buildRenderUrl(config)
    };
    updateTreeSummary(treeNum);
    setStatus(t('selectedTree', getTitleText(treeNum), config.treeName));
}

async function fetchTreePayload(projectId, treeName) {
    const dataUrl = `/api/get_tree/${encodeURIComponent(projectId)}/${encodeURIComponent(treeName)}.json`;
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const payload = await res.json();
    return { payload, dataUrl };
}

function attachFrameChrome(treeNum) {
    const tree = selectedTrees[treeNum];
    const openBtn = document.getElementById(`open-tree-${treeNum}`);
    if (openBtn) {
        openBtn.onclick = function() {
            if (tree && tree.renderUrl) window.open(tree.renderUrl, '_blank');
        };
    }
}

function prepareEmbeddedFrame(frame) {
    try {
        const doc = frame.contentDocument;
        if (!doc) return;

        if (!doc.getElementById('tanglegram-embed-style')) {
            const style = doc.createElement('style');
            style.id = 'tanglegram-embed-style';
            style.textContent = `
                html, body { margin: 0 !important; height: 100% !important; overflow: auto !important; background: #f8fbff !important; }
                #project-manager-app, #qrcode-app { display: none !important; }
                #svg-div { position: relative !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; min-height: 100% !important; overflow: auto !important; background: transparent !important; padding: 12px !important; box-sizing: border-box !important; }
                #svg { margin: 0 auto !important; display: block !important; box-shadow: none !important; border-radius: 0 !important; }
                .tanglegram-clickable { cursor: pointer !important; }
            `;
            doc.head.appendChild(style);
        }
    } catch (err) {
        console.error('Failed to prepare embedded frame:', err);
    }
}

function waitForTreeRender(treeNum, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const frame = getTreeFrame(treeNum);
        const startedAt = Date.now();

        const poll = () => {
            try {
                const doc = frame.contentDocument;
                if (!doc) {
                    if (Date.now() - startedAt > timeoutMs) {
                        reject(new Error('iframe document is not accessible.'));
                        return;
                    }
                    window.setTimeout(poll, 200);
                    return;
                }

                const maingroup = doc.getElementById('maingroup');
                const hasTreeNodes = !!maingroup && maingroup.querySelectorAll('*').length > 0;

                if (hasTreeNodes) {
                    const loadingBox = doc.getElementById('page-loading-box');
                    if (loadingBox) loadingBox.style.display = 'none';
                    resolve();
                    return;
                }

                if (Date.now() - startedAt > timeoutMs) {
                    reject(new Error('tree render timed out.'));
                    return;
                }
            } catch (err) {
                if (Date.now() - startedAt > timeoutMs) {
                    reject(err);
                    return;
                }
            }

            window.setTimeout(poll, 200);
        };

        poll();
    });
}

function waitForEmbeddedStyleApply(treeNum, timeoutMs = 4000) {
    return new Promise((resolve) => {
        const frame = getTreeFrame(treeNum);
        const startedAt = Date.now();

        const poll = () => {
            try {
                const win = frame && frame.contentWindow;
                const app = win && (win.normalTree || win.circleTree || win.unrootedTree);
                const api = win && win.__tvbot_node_style_api;
                const branchStyles = Array.isArray(app?.styleData?.tvbotBranchStyles) ? app.styleData.tvbotBranchStyles : [];
                const leafStyles = Array.isArray(app?.styleData?.tvbotLeafStyles) ? app.styleData.tvbotLeafStyles : [];
                const hasCustomStyles = branchStyles.length > 0 || leafStyles.length > 0;

                if (api && typeof api.apply === 'function') {
                    api.apply();
                    if (!hasCustomStyles) {
                        resolve();
                        return;
                    }

                    const svg = frame.contentDocument && frame.contentDocument.getElementById('svg');
                    const hasStyledLeaf = !!(svg && svg.querySelector('[data-tvbot-leaf-styled="1"]'));
                    const hasStyledBranch = !!(svg && svg.querySelector('[data-tvbot-branch-styled="1"]'));
                    if (hasStyledLeaf || hasStyledBranch) {
                        resolve();
                        return;
                    }
                }
            } catch (err) {
            }

            if (Date.now() - startedAt > timeoutMs) {
                resolve();
                return;
            }
            window.setTimeout(poll, 120);
        };

        poll();
    });
}

function resizeFrameToContent(treeNum) {
    try {
        const frame = getTreeFrame(treeNum);
        const doc = frame.contentDocument;
        if (!doc) return;

        const svg = doc.getElementById('svg');
        const svgHeight = svg ? Math.max(svg.getBoundingClientRect().height, Number(svg.getAttribute('height')) || 0) : 0;
        const bodyHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, svgHeight);
        frame.style.height = `${Math.max(780, Math.ceil(bodyHeight) + 24)}px`;
    } catch (err) {
        console.error('Failed to resize frame:', err);
    }
}

function isValidTargetName(name) {
    if (!name) return false;
    const trimmed = String(name).trim();
    if (!trimmed) return false;
    return true;
}

function normalizeFoldedCladeName(name) {
    return String(name || '').trim().replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function getAutoMatchKey(record) {
    const raw = String(record.name || '').trim();
    if (record.kind === 'folded-clade') return normalizeFoldedCladeName(raw);
    return raw;
}

function makeExportBaseName() {
    const left = selectedTrees[1]?.treeName || 'left';
    const right = selectedTrees[2]?.treeName || 'right';
    return `${left}_vs_${right}`.replace(/[\\/:*?"<>|]+/g, '_');
}

function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === '1') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = '1';
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

async function ensurePdfLibraries() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        await loadScriptOnce('/static/js/jspdf.umd.min.js');
    }
    const probe = new window.jspdf.jsPDF();
    if (typeof probe.svg !== 'function') {
        await loadScriptOnce('/static/js/svg2pdf.umd.min.js');
    }
}

function getTargetTypeLabel(record) {
    if (record.kind === 'folded-clade') return t('foldedClade');
    return t('leaf');
}

function isValidWorkspaceName(name) {
    const value = String(name || '').trim();
    if (!value) return false;
    if (value === '.' || value === '..') return false;
    if (value.startsWith('.')) return false;
    if (value.includes('/') || value.includes('\\')) return false;
    if (value.includes('..')) return false;
    return true;
}

function getDefaultSaveProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlProject = (urlParams.get('projectId') || '').trim();
    if (isValidWorkspaceName(urlProject) && urlProject !== 'local') return urlProject;

    const leftProject = selectedTrees[1]?.projectId;
    const rightProject = selectedTrees[2]?.projectId;
    if (leftProject && leftProject === rightProject && isValidWorkspaceName(leftProject) && leftProject !== 'local') {
        return leftProject;
    }
    if (leftProject && isValidWorkspaceName(leftProject) && leftProject !== 'local') return leftProject;
    if (rightProject && isValidWorkspaceName(rightProject) && rightProject !== 'local') return rightProject;
    return 'comparisons';
}

function buildTargetRecord(treeNum, datum, element, kindHint) {
    if (!datum) return null;

    if (datum.data) {
        const data = datum.data;
        const name = data.name || data.nodeIndex || data.uniformNodeId;
        if (!isValidTargetName(name)) return null;
        const inferredKind = data.collapsedLeavesCount || data.isCollapse
            ? 'folded-clade'
            : (!data.children || data.children.length === 0 ? 'leaf' : 'node');
        const kind = kindHint === 'leaf' && inferredKind === 'folded-clade'
            ? 'folded-clade'
            : (kindHint || inferredKind);
        return {
            treeNum,
            kind,
            key: `${kind}:${data.nodeIndex || data.uniformNodeId || name}`,
            name: String(name),
            nodeId: data.nodeIndex || data.uniformNodeId || name,
            explicitName: Boolean(data.name && String(data.name).trim()),
            elementTag: element.tagName,
            element
        };
    }

    return null;
}

function getCombinedSvg() {
    return document.getElementById('combined-svg');
}

function getCombinedLayer(layerId) {
    return document.getElementById(layerId);
}

function ensureCombinedZoom() {
    const svg = d3.select(getCombinedSvg());
    const viewport = d3.select('#tg-viewport-layer');
    if (svg.empty() || viewport.empty()) return;

    if (!combinedZoomBehavior) {
        combinedZoomBehavior = d3.zoom()
            .scaleExtent([0.4, 4])
            .filter((event) => {
                if (canvasPanLocked) return false;
                if (event.type === 'wheel') return true;
                return !event.ctrlKey && !event.button;
            })
            .on('zoom', (event) => {
                combinedZoomTransform = event.transform;
                d3.select('#tg-viewport-layer').attr('transform', event.transform);
            });
    }

    svg.call(combinedZoomBehavior);
    viewport.attr('transform', combinedZoomTransform);
    svg.call(combinedZoomBehavior.transform, combinedZoomTransform);
    combinedZoomInitialized = true;
}

function annotateSourceTargets(treeNum) {
    const frame = getTreeFrame(treeNum);
    const doc = frame.contentDocument;
    if (!doc) return;

    Array.from(doc.querySelectorAll('#maingroup g')).forEach((element) => {
        const record = buildTargetRecord(treeNum, element.__data__, element);
        if (!record || !record.explicitName) return;
        if (record.kind !== 'leaf' && record.kind !== 'folded-clade') return;

        Array.from(element.querySelectorAll('text')).forEach((textEl) => {
            textEl.setAttribute('data-tg-role', 'label');
            textEl.setAttribute('data-tg-tree', String(treeNum));
            textEl.setAttribute('data-tg-kind', record.kind);
            textEl.setAttribute('data-tg-key', record.key);
            textEl.setAttribute('data-tg-name', record.name);
            textEl.setAttribute('data-tg-node-id', String(record.nodeId));
        });
    });
}

function getCombinedTargets(treeNum) {
    const svg = getCombinedSvg();
    if (!svg) return [];
    return Array.from(svg.querySelectorAll(`[data-tg-role="label"][data-tg-tree="${treeNum}"]`)).map((element) => ({
        treeNum,
        kind: element.getAttribute('data-tg-kind'),
        key: element.getAttribute('data-tg-key'),
        name: element.getAttribute('data-tg-name'),
        nodeId: element.getAttribute('data-tg-node-id'),
        explicitName: true,
        element
    }));
}

function findTargetElement(treeNum, key) {
    return getCombinedTargets(treeNum).find((record) => record.key === key)?.element || null;
}

function getAnchorElement(treeNum, key) {
    return findTargetElement(treeNum, key);
}

function getOverlayRect() {
    return getCombinedSvg().getBoundingClientRect();
}

function getViewportLocalPointFromElement(element, treeNum) {
    const svg = getCombinedSvg();
    const viewport = getCombinedLayer('tg-viewport-layer');
    if (!svg || !viewport || !element || typeof element.getBBox !== 'function' || typeof element.getCTM !== 'function') return null;

    const bbox = element.getBBox();
    const elementMatrix = element.getCTM();
    const viewportMatrix = viewport.getCTM();
    if (!bbox || !elementMatrix || !viewportMatrix) return null;

    const point = svg.createSVGPoint();
    point.x = treeNum === 1 ? bbox.x + bbox.width : bbox.x;
    point.y = bbox.y + bbox.height / 2;

    const rootPoint = point.matrixTransform(elementMatrix);
    const localPoint = rootPoint.matrixTransform(viewportMatrix.inverse());
    return { x: localPoint.x, y: localPoint.y };
}

function getTargetPoint(treeNum, key) {
    const element = getAnchorElement(treeNum, key);
    if (!element) return null;

    const svgPoint = getViewportLocalPointFromElement(element, treeNum);
    if (svgPoint) return svgPoint;

    const overlayRect = getOverlayRect();
    if (!overlayRect) return null;
    const rect = element.getBoundingClientRect();
    return {
        x: treeNum === 1 ? rect.right - overlayRect.left : rect.left - overlayRect.left,
        y: rect.top + rect.height / 2 - overlayRect.top
    };
}

function syncOverlaySize() {
    const overlay = getCombinedSvg();
    const shell = document.getElementById('stage-shell');
    if (!overlay || !shell) return;
    const width = Math.max(shell.clientWidth - 40, 1200);
    const height = Math.max(shell.clientHeight - 80, 800);
    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    overlay.setAttribute('width', width);
    overlay.setAttribute('height', height);
}

function removeConnectionAt(index) {
    const removed = tgStore.removeAt(index);
    if (!removed) return;
    updateConnectionList();
    drawConnections();
    syncStyleControlsFromSelection();
    setStatus(t('removedConnection', removed.left.name, removed.right.name));
}

function getExportPrepWorker() {
    if (!exportPrepWorker) {
        exportPrepWorker = new Worker(new URL('../core/export/exportPrep.worker.ts', import.meta.url), { type: 'module' });
    }
    return exportPrepWorker;
}

function runExportPrepInWorker(svgString, pdfFixes) {
    const worker = getExportPrepWorker();
    const requestId = `${Date.now()}-${++exportPrepRequestSeq}`;
    return new Promise((resolve, reject) => {
        const handler = (event) => {
            if (!event || !event.data || event.data.id !== requestId) return;
            worker.removeEventListener('message', handler);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve(event.data.svgString || svgString);
        };
        worker.addEventListener('message', handler);
        worker.postMessage({ id: requestId, svgString, pdfFixes });
    });
}

function exportCombinedSvg() {
    const svgElement = getCombinedSvg();
    if (!svgElement || !svgElement.querySelector('*')) {
        alert(t('exportLoadFirst'));
        return;
    }
    const exportSvg = cloneSvgWithComputedStyles(svgElement);
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(exportSvg)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${makeExportBaseName()}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(t('exportedSvg'));
}

async function exportCombinedPdf() {
    const svgElement = getCombinedSvg();
    if (!svgElement || !svgElement.querySelector('*')) {
        alert(t('exportLoadFirst'));
        return;
    }
    try {
        await ensurePdfLibraries();
        const { jsPDF } = window.jspdf;
        const width = Number(svgElement.getAttribute('width')) || 1600;
        const height = Number(svgElement.getAttribute('height')) || 900;
        const doc = new jsPDF(width > height ? 'l' : 'p', 'pt', [width, height]);
        const exportSvg = cloneSvgWithComputedStyles(svgElement, { includeDisplayVisibility: true });

        let svgForPdf = exportSvg;
        try {
            const raw = new XMLSerializer().serializeToString(exportSvg);
            const fixed = await runExportPrepInWorker(raw, { labelParenthesisNbspCount: 2, rightTreeDxNudge: 6 });
            const parsed = new DOMParser().parseFromString(fixed, 'image/svg+xml');
            svgForPdf = parsed.documentElement;
        } catch (e) {
            applyPdfExportFixesToSvg(exportSvg, { labelParenthesisNbspCount: 2, rightTreeDxNudge: 6 });
            svgForPdf = exportSvg;
        }

        await doc.svg(svgForPdf, { width, height });
        doc.save(`${makeExportBaseName()}.pdf`);
        setStatus(t('exportedPdf'));
    } catch (err) {
        console.error(err);
        alert(t('pdfError', err.message));
    }
}

function drawConnections() {
    const lineLayer = d3.select(getCombinedLayer('tg-connection-layer'));
    const endpointLayer = d3.select(getCombinedLayer('tg-endpoint-layer'));
    if (lineLayer.empty() || endpointLayer.empty()) return;

    lineLayer.selectAll('*').remove();
    endpointLayer.selectAll('*').remove();

    tgStore.state.connections.forEach((connection, index) => {
        const source = getTargetPoint(1, connection.left.key);
        const target = getTargetPoint(2, connection.right.key);
        if (!source || !target) return;

        const sourceDotX = source.x + 12;
        const targetDotX = target.x - 12;
        const midX = (sourceDotX + targetDotX) / 2;
        const path = `M${sourceDotX},${source.y} C${midX},${source.y} ${midX},${target.y} ${targetDotX},${target.y}`;

        const bindLineEvents = (selection) => selection
            .attr('data-connection-index', index)
            .attr('cursor', 'pointer')
            .on('click', function() {
                tgStore.select(index);
                updateConnectionList();
                syncStyleControlsFromSelection();
                setStatus(t('selectedConnection', connection.left.name, connection.right.name));
            })
            .on('dblclick', function(event) {
                event.preventDefault();
                removeConnectionAt(index);
            });

        bindLineEvents(lineLayer.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'transparent')
            .attr('stroke-width', Math.max(connection.style.width + 10, 14))
            .attr('stroke-linecap', 'round'));

        bindLineEvents(lineLayer.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', connection.style.color)
            .attr('stroke-width', connection.style.width)
            .attr('stroke-opacity', connection.style.opacity)
            .attr('stroke-linecap', 'round'));

        endpointLayer.append('circle')
            .attr('cx', sourceDotX)
            .attr('cy', source.y)
            .attr('r', 5.2)
            .attr('fill', '#2563eb')
            .attr('fill-opacity', Math.min(connection.style.opacity + 0.18, 1))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.4);

        endpointLayer.append('circle')
            .attr('cx', targetDotX)
            .attr('cy', target.y)
            .attr('r', 5.2)
            .attr('fill', '#ef4444')
            .attr('fill-opacity', Math.min(connection.style.opacity + 0.18, 1))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.4);
    });
}

function getSourceSvgMetrics(treeNum) {
    const frame = getTreeFrame(treeNum);
    const doc = frame.contentDocument;
    const svg = doc ? doc.getElementById('svg') : null;
    if (!svg) return { width: 1000, height: 800 };
    return {
        width: Math.max(Number(svg.getAttribute('width')) || 0, svg.getBoundingClientRect().width || 0, 1000),
        height: Math.max(Number(svg.getAttribute('height')) || 0, svg.getBoundingClientRect().height || 0, 800)
    };
}

function prefixCloneIds(node, prefix) {
    if (!(node instanceof Element)) return;
    if (node.id) node.id = `${prefix}${node.id}`;
    node.querySelectorAll('[id]').forEach((el) => {
        el.id = `${prefix}${el.id}`;
    });
}

function getNumericSvgAttr(element, attrName, fallbackValue = 0) {
    const raw = element.getAttribute(attrName);
    if (!raw) return fallbackValue;
    const first = String(raw).trim().split(/[\s,]+/)[0];
    const value = Number(first);
    return Number.isFinite(value) ? value : fallbackValue;
}

function normalizeMirroredRightTreeLabels(wrapper) {
    wrapper.querySelectorAll('text').forEach((textEl) => {
        const x = getNumericSvgAttr(textEl, 'x', 0);
        const existingTransform = textEl.getAttribute('transform');
        const mirrorTransform = `translate(${2 * x},0) scale(-1,1)`;
        textEl.setAttribute('transform', existingTransform ? `${mirrorTransform} ${existingTransform}` : mirrorTransform);

        const anchor = textEl.getAttribute('text-anchor') || '';
        if (anchor === 'start') {
            textEl.setAttribute('text-anchor', 'end');
        } else if (anchor === 'end') {
            textEl.setAttribute('text-anchor', 'start');
        }

        const dx = getNumericSvgAttr(textEl, 'dx', 0);
        textEl.setAttribute('dx', String(-dx - 2));
        textEl.style.transform = '';
        textEl.style.transformOrigin = '';
        textEl.style.transformBox = '';
    });
}

function renderSingleCanvas() {
    const svg = d3.select(getCombinedSvg());
    svg.selectAll('*').remove();

    [1, 2].forEach((treeNum) => annotateSourceTargets(treeNum));

    const leftMetrics = getSourceSvgMetrics(1);
    const rightMetrics = getSourceSvgMetrics(2);
    const layout = computeTanglegramCombinedLayout({
        left: leftMetrics,
        right: rightMetrics,
        layout: layoutState,
        padding: { x: 40, y: 58 },
        baseGap: 20
    });

    svg.attr('viewBox', layout.viewBox)
        .attr('width', layout.totalWidth)
        .attr('height', layout.totalHeight);

    const viewport = svg.append('g').attr('id', 'tg-viewport-layer');
    viewport.append('g').attr('id', 'tg-title-layer');
    viewport.append('g').attr('id', 'tg-tree-layer');
    viewport.append('g').attr('id', 'tg-connection-layer');
    viewport.append('g').attr('id', 'tg-endpoint-layer');
    viewport.append('g').attr('id', 'tg-interaction-layer');

    const positions = layout.positions;

    const titleLayer = d3.select(getCombinedLayer('tg-title-layer'));
    titleLayer.selectAll('*').remove();

    [1, 2].forEach((treeNum) => {
        const tree = selectedTrees[treeNum];
        const titleX = layout.title[treeNum].x;
        const titleAnchor = layout.title[treeNum].anchor;
        const titleY = layout.title[treeNum].y;
        const subtitleY = layout.subtitle[treeNum].y;

        titleLayer.append('text')
            .attr('x', titleX)
            .attr('y', titleY)
            .attr('text-anchor', titleAnchor)
            .attr('font-size', 16)
            .attr('font-weight', 700)
            .attr('fill', '#1f2937')
            .text(tree?.treeName || (treeNum === 1 ? t('leftTree') : t('rightTree')));

        titleLayer.append('text')
            .attr('x', titleX)
            .attr('y', subtitleY)
            .attr('text-anchor', titleAnchor)
            .attr('font-size', 11)
            .attr('fill', '#64748b')
            .text(tree?.sourceLabel || '');
    });

    [1, 2].forEach((treeNum) => {
        const frame = getTreeFrame(treeNum);
        const doc = frame.contentDocument;
        const sourceSvg = doc ? doc.getElementById('svg') : null;
        if (!sourceSvg) return;

        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.setAttribute('id', `tg-tree-${treeNum}`);
        wrapper.setAttribute('transform', layout.transforms[treeNum]);

        Array.from(sourceSvg.childNodes).forEach((node) => {
            const cloned = node.cloneNode(true);
            prefixCloneIds(cloned, `tg${treeNum}-`);
            wrapper.appendChild(cloned);
        });

        getCombinedLayer('tg-tree-layer').appendChild(wrapper);

        if (treeNum === 2) {
            normalizeMirroredRightTreeLabels(wrapper);
        }
    });

    ensureCombinedZoom();
}

function redrawCombinedCanvas() {
    if (!ensureFramesReady()) return;
    renderSingleCanvas();
    attachInteractiveHandlers(1);
    attachInteractiveHandlers(2);
    setupBoxDeleteInteraction();
    drawConnections();
}

function getViewportPointFromClient(clientX, clientY) {
    const svg = getCombinedSvg();
    const viewport = getCombinedLayer('tg-viewport-layer');
    if (!svg || !viewport) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const screenToSvg = pt.matrixTransform(svg.getScreenCTM().inverse());
    const local = screenToSvg.matrixTransform(viewport.getCTM().inverse());
    return { x: local.x, y: local.y };
}

function getConnectionBounds(connection) {
    const source = getTargetPoint(1, connection.left.key);
    const target = getTargetPoint(2, connection.right.key);
    if (!source || !target) return null;
    const midX = (source.x + target.x) / 2;
    return {
        minX: Math.min(source.x, target.x, midX),
        maxX: Math.max(source.x, target.x, midX),
        minY: Math.min(source.y, target.y),
        maxY: Math.max(source.y, target.y)
    };
}

function removeConnectionsInBox(box) {
    const before = tgStore.state.connections.length;
    const next = tgStore.state.connections.filter((connection) => {
        const bounds = getConnectionBounds(connection);
        if (!bounds) return false;
        const intersects = !(bounds.maxX < box.minX || bounds.minX > box.maxX || bounds.maxY < box.minY || bounds.minY > box.maxY);
        return !intersects;
    });
    tgStore.setConnections(next);
    const removed = before - next.length;
    updateConnectionList();
    drawConnections();
    syncStyleControlsFromSelection();
    setStatus(removed > 0 ? t('boxDeleteRemoved', removed) : t('boxDeleteNone'));
}

function setupBoxDeleteInteraction() {
    const svg = d3.select(getCombinedSvg());
    const layer = d3.select(getCombinedLayer('tg-interaction-layer'));
    if (svg.empty() || layer.empty()) return;

    svg.on('.boxdelete', null);
    svg.style('cursor', boxDeleteMode ? 'crosshair' : null);
    layer.selectAll('*').remove();
    if (!boxDeleteMode) return;

    let startPoint = null;
    let rect = null;

    const updateRect = (start, curr) => {
        const x = Math.min(start.x, curr.x);
        const y = Math.min(start.y, curr.y);
        const w = Math.abs(curr.x - start.x);
        const h = Math.abs(curr.y - start.y);
        rect.attr('x', x).attr('y', y).attr('width', w).attr('height', h);
    };

    svg.on('mousedown.boxdelete', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        startPoint = getViewportPointFromClient(event.clientX, event.clientY);
        if (!startPoint) return;
        rect = layer.append('rect')
            .attr('fill', 'rgba(239, 68, 68, 0.12)')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 1.2)
            .attr('stroke-dasharray', '4,3');
        updateRect(startPoint, startPoint);
    });

    svg.on('mousemove.boxdelete', (event) => {
        if (!startPoint || !rect) return;
        const curr = getViewportPointFromClient(event.clientX, event.clientY);
        if (!curr) return;
        updateRect(startPoint, curr);
    });

    const finishSelection = (event) => {
        if (!startPoint || !rect) return;
        const endPoint = getViewportPointFromClient(event.clientX, event.clientY) || startPoint;
        const box = {
            minX: Math.min(startPoint.x, endPoint.x),
            maxX: Math.max(startPoint.x, endPoint.x),
            minY: Math.min(startPoint.y, endPoint.y),
            maxY: Math.max(startPoint.y, endPoint.y)
        };
        rect.remove();
        rect = null;
        startPoint = null;
        if (box.maxX - box.minX < 6 || box.maxY - box.minY < 6) return;
        removeConnectionsInBox(box);
    };

    svg.on('mouseup.boxdelete', finishSelection);
    svg.on('mouseleave.boxdelete', finishSelection);
}

function updateConnectionList() {
    const list = document.getElementById('connection-list');
    if (!list) return;
    if (tgStore.state.connections.length === 0) {
        list.innerHTML = `<div class="text-muted small">${escapeHtml(t('noConnections'))}</div>`;
        return;
    }

    list.innerHTML = '';
    tgStore.state.connections.forEach((connection, index) => {
        const row = document.createElement('div');
        row.className = `connection-item d-flex justify-content-between align-items-center border-bottom py-1 gap-2 ${tgStore.state.selectedConnectionIndex === index ? 'bg-light' : ''}`;
        row.innerHTML = `
            <span class="text-truncate" title="${escapeHtml(connection.left.name)} ↔ ${escapeHtml(connection.right.name)}">
                ${escapeHtml(connection.left.name)} ↔ ${escapeHtml(connection.right.name)}
                <span class="text-muted">(${getTargetTypeLabel(connection.left)} / ${getTargetTypeLabel(connection.right)})</span>
            </span>
            <div class="d-flex align-items-center gap-2">
                <span style="width: 16px; height: 16px; border-radius: 999px; background: ${escapeHtml(connection.style.color)}; opacity: ${connection.style.opacity}; display: inline-block;"></span>
            </div>
        `;
        row.dataset.idx = String(index);
        row.dataset.role = 'connection-row';
        list.appendChild(row);
    });
}

function connectionExists(leftKey, rightKey) {
    return tgStore.connectionExists(leftKey, rightKey);
}

function toStoreTarget(record) {
    return {
        treeNum: record.treeNum,
        kind: record.kind,
        key: record.key,
        name: record.name,
        nodeId: record.nodeId
    };
}

function handleLeafClick(treeNum, record) {
    if (!pendingSelection) {
        pendingSelection = record;
        setStatus(t('pickFirst', getTitleText(treeNum), getTargetTypeLabel(record), record.name));
        return;
    }

    if (pendingSelection.treeNum === treeNum) {
        pendingSelection = record;
        setStatus(t('pickSwitch', getTitleText(treeNum), getTargetTypeLabel(record), record.name));
        return;
    }

    const left = pendingSelection.treeNum === 1 ? pendingSelection : record;
    const right = pendingSelection.treeNum === 2 ? pendingSelection : record;

    if (!connectionExists(left.key, right.key)) {
        tgStore.addConnection(toStoreTarget(left), toStoreTarget(right));
        updateConnectionList();
        drawConnections();
        syncStyleControlsFromSelection();
    }

    setStatus(t('connected', left.name, right.name));
    pendingSelection = null;
}

function attachInteractiveHandlers(treeNum) {
    getCombinedTargets(treeNum).forEach((record) => {
        const element = record.element;
        element.style.cursor = 'pointer';
        if (element.dataset.tanglegramBound === '1') return;
        element.dataset.tanglegramBound = '1';
        element.addEventListener('click', function(event) {
            if (!manualConnectMode) return;
            event.preventDefault();
            event.stopPropagation();
            handleLeafClick(treeNum, {
                treeNum,
                kind: record.kind,
                key: record.key,
                name: record.name,
                nodeId: record.nodeId,
                explicitName: true,
                element
            });
        }, true);
    });
}

function startOverlaySync() {
    if (overlayTimer) return;
    overlayTimer = window.setInterval(drawConnections, 400);
}

function ensureFramesReady() {
    return selectedTrees[1] && selectedTrees[2];
}

function loadTreeIntoFrame(treeNum) {
    return new Promise((resolve, reject) => {
        const frame = getTreeFrame(treeNum);
        const tree = selectedTrees[treeNum];
        if (!frame || !tree) {
            resolve();
            return;
        }

        frame.onload = async function() {
            try {
                prepareEmbeddedFrame(frame);
                await waitForTreeRender(treeNum);
                await waitForEmbeddedStyleApply(treeNum);
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        frame.src = tree.renderUrl;
        attachFrameChrome(treeNum);
    });
}

async function loadSelectedTrees() {
    if (!selectedTrees[1] || !selectedTrees[2]) {
        const missing = [];
        if (!selectedTrees[1]) missing.push(t('leftTree'));
        if (!selectedTrees[2]) missing.push(t('rightTree'));
        alert(t('chooseTreesFirst', missing));
        return;
    }

    tgStore.clear();
    pendingSelection = null;
    tgStore.select(null);
    updateConnectionList();
    drawConnections();
    syncStyleControlsFromSelection();
    setStatus(t('loadingTrees'));

    try {
        await Promise.all([loadTreeIntoFrame(1), loadTreeIntoFrame(2)]);
        redrawCombinedCanvas();
        startOverlaySync();
        setStatus(t('treesLoaded'));
    } catch (err) {
        console.error(err);
        setStatus(t('treeLoadFailed', err.message));
        alert(t('treeLoadAlert', err.message));
    }
}

function getTargetsByName(treeNum) {
    const map = new Map();
    getCombinedTargets(treeNum).forEach((record) => {
        if (!record || !isValidTargetName(record.name)) return;
        if (!record.explicitName) return;
        if (record.kind !== 'leaf' && record.kind !== 'folded-clade') return;
        const matchKey = getAutoMatchKey(record);
        if (!matchKey) return;
        if (!map.has(matchKey)) map.set(matchKey, []);
        map.get(matchKey).push(record);
    });
    return map;
}

function getAutoMatchWorker() {
    if (!autoMatchWorker) {
        autoMatchWorker = new Worker(new URL('../core/tanglegram/autoMatch.worker.ts', import.meta.url), { type: 'module' });
    }
    return autoMatchWorker;
}

function runAutoMatchInWorker(left, right) {
    const worker = getAutoMatchWorker();
    const requestId = `${Date.now()}-${++autoMatchRequestSeq}`;
    return new Promise((resolve) => {
        const handler = (event) => {
            if (!event || !event.data || event.data.id !== requestId) return;
            worker.removeEventListener('message', handler);
            resolve(event.data.pairs || []);
        };
        worker.addEventListener('message', handler);
        worker.postMessage({
            id: requestId,
            left,
            right,
            options: { ignoreParenSuffixForFoldedClade: true }
        });
    });
}

async function autoConnectByName() {
    if (!ensureFramesReady()) {
        alert(t('loadDualFirst'));
        return;
    }

    const leftRecords = getCombinedTargets(1).filter((record) => {
        if (!record || !isValidTargetName(record.name)) return false;
        if (!record.explicitName) return false;
        return record.kind === 'leaf' || record.kind === 'folded-clade';
    });
    const rightRecords = getCombinedTargets(2).filter((record) => {
        if (!record || !isValidTargetName(record.name)) return false;
        if (!record.explicitName) return false;
        return record.kind === 'leaf' || record.kind === 'folded-clade';
    });

    const leftLite = leftRecords.map((r) => ({ key: r.key, name: r.name, kind: r.kind }));
    const rightLite = rightRecords.map((r) => ({ key: r.key, name: r.name, kind: r.kind }));

    const leftByKey = new Map(leftRecords.map((r) => [r.key, toStoreTarget(r)]));
    const rightByKey = new Map(rightRecords.map((r) => [r.key, toStoreTarget(r)]));

    const pairs = await runAutoMatchInWorker(leftLite, rightLite);
    let added = 0;
    pairs.forEach((pair) => {
        const left = leftByKey.get(pair.leftKey);
        const right = rightByKey.get(pair.rightKey);
        if (!left || !right) return;
        if (tgStore.addConnection(left, right)) added++;
    });

    if (tgStore.state.connections.length > 0 && tgStore.state.selectedConnectionIndex === null) {
        tgStore.select(0);
    }
    updateConnectionList();
    drawConnections();
    syncStyleControlsFromSelection();
    setStatus(added > 0 ? t('autoConnected', added) : t('autoConnectedNone'));
}

function parseLocalJsonFile(fileText) {
    const payload = JSON.parse(fileText);
    return normalizePlotType(payload && payload.plotType);
}

function setWorkspaceSelection(treeNum, projectId, treeName, payload) {
    const plotType = normalizePlotType(payload && payload.plotType);
    const dataUrl = `/api/get_tree/${encodeURIComponent(projectId)}/${encodeURIComponent(treeName)}.json`;

    setSelectedTree(treeNum, {
        treeName,
        projectId,
        plotType,
        dataUrl,
        sourceLabel: t('workspaceSource', projectId)
    });
}

function getWorkspaceControls() {
    return {
        container: document.getElementById('workspaceAccordion'),
        summary: document.getElementById('workspace-summary'),
        search: document.getElementById('workspace-search'),
        sortBy: document.getElementById('workspace-sort-by'),
        sortDir: document.getElementById('workspace-sort-dir')
    };
}

function updateWorkspaceSortDirButton() {
    const button = document.getElementById('workspace-sort-dir');
    if (!button) return;
    const icon = workspaceBrowserState.sortDir === 'desc' ? 'bi-sort-down' : 'bi-sort-up';
    button.innerHTML = `<i class="bi ${icon}"></i> <span>${escapeHtml(t(workspaceBrowserState.sortDir === 'desc' ? 'sortDesc' : 'sortAsc'))}</span>`;
}

function updateWorkspaceSummary(visibleCount, totalCount) {
    const summary = document.getElementById('workspace-summary');
    if (!summary) return;
    summary.textContent = workspaceBrowserState.loading
        ? t('workspaceSummaryLoading')
        : t('workspaceSummary', visibleCount, totalCount);
}

function renderWorkspaceLoading() {
    const { container } = getWorkspaceControls();
    if (!container) return;
    updateWorkspaceSummary(0, 0);
    container.innerHTML = `
        <div class="workspace-empty-state">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>${escapeHtml(t('workspaceLoading'))}</div>
        </div>
    `;
}

function sortWorkspaceTrees(trees) {
    const items = trees.slice();
    const dir = workspaceBrowserState.sortDir === 'asc' ? 1 : -1;
    items.sort((a, b) => {
        if (workspaceBrowserState.sortBy === 'name') {
            return dir * String(a.treeName || '').localeCompare(String(b.treeName || ''), undefined, { numeric: true, sensitivity: 'base' });
        }
        if (workspaceBrowserState.sortBy === 'plotType') {
            return dir * String(a.plotType || '').localeCompare(String(b.plotType || ''), undefined, { sensitivity: 'base' });
        }
        return dir * ((Number(a.mtime) || 0) - (Number(b.mtime) || 0));
    });
    return items;
}

function renderWorkspaceBrowser() {
    const { container, sortBy } = getWorkspaceControls();
    if (!container) return;
    if (sortBy) sortBy.value = workspaceBrowserState.sortBy;
    updateWorkspaceSortDirButton();

    const allTrees = Array.isArray(workspaceBrowserState.treeList) ? workspaceBrowserState.treeList : [];
    const projects = Array.isArray(workspaceBrowserState.projectList) ? workspaceBrowserState.projectList : [];
    const query = String(workspaceBrowserState.search || '').trim().toLowerCase();
    const targetType = workspaceBrowserState.targetType;

    if (projects.length === 0) {
        updateWorkspaceSummary(0, 0);
        container.innerHTML = `<div class="workspace-empty-state">${escapeHtml(t('workspaceNoProjects'))}</div>`;
        return;
    }

    let visibleCount = 0;
    const cards = projects.map((project) => {
        const projectName = project.projectId;
        const projectLabel = project.projectName || projectName;
        const projectMatch = query && String(projectLabel).toLowerCase().includes(query);
        let trees = allTrees.filter((item) => item.projectId === projectName);
        
        // Filter by target type
        if (targetType === 'comparison') {
            trees = trees.filter(item => item.plotType === 'tanglegramTree');
        } else {
            // normal tree loading
            trees = trees.filter(item => item.plotType !== 'tanglegramTree');
        }

        if (query) {
            const q = query;
            trees = trees.filter((item) => {
                const name = String(item.treeName || '').toLowerCase();
                const layout = String(item.plotType || '').toLowerCase();
                return name.includes(q) || layout.includes(q) || projectMatch;
            });
        }
        if (query && trees.length === 0 && !projectMatch) return '';
        trees = sortWorkspaceTrees(trees);
        visibleCount += trees.length;

        const bodyHtml = trees.length === 0
            ? `<div class="workspace-empty-state">${escapeHtml(t('workspaceEmptyProject'))}</div>`
            : `
                <div class="workspace-file-head">
                    <div>${escapeHtml(t('name'))}</div>
                    <div>${escapeHtml(t('modified'))}</div>
                    <div>${escapeHtml(t('layout'))}</div>
                </div>
                <div class="workspace-file-list">
                    ${trees.map((tree) => `
                        <button type="button" class="workspace-file-row"
                            data-project-id="${escapeHtml(projectName)}"
                            data-tree-name="${escapeHtml(tree.treeName)}">
                            <div class="workspace-file-name text-truncate" title="${escapeHtml(tree.treeName)}">
                                ${escapeHtml(tree.treeName)}
                                <div class="workspace-file-subtitle">${escapeHtml(projectLabel)}</div>
                            </div>
                            <div class="small text-muted">${escapeHtml(tree.time_str || '')}</div>
                            <div><span class="badge bg-primary-subtle text-primary border">${escapeHtml((tree.plotType || 'normalTree').replace('Tree', ''))}</span></div>
                        </button>
                    `).join('')}
                </div>
            `;

        return `
            <section class="workspace-project-card">
                <div class="workspace-project-header">
                    <div>
                        <div class="workspace-project-title">${escapeHtml(projectLabel)}</div>
                        <div class="workspace-project-meta">${escapeHtml(projectName)}</div>
                    </div>
                    <span class="badge rounded-pill text-bg-light border">${trees.length}</span>
                </div>
                ${bodyHtml}
            </section>
        `;
    });

    updateWorkspaceSummary(visibleCount, allTrees.length);
    container.innerHTML = cards.filter(Boolean).join('') || `<div class="workspace-empty-state">${escapeHtml(t('workspaceEmptyProject'))}</div>`;
}

async function fetchWorkspaceTreeList(forceRefresh = false) {
    if (workspaceBrowserState.loaded && !forceRefresh) {
        renderWorkspaceBrowser();
        return;
    }
    workspaceBrowserState.loading = true;
    renderWorkspaceLoading();
    try {
        const res = await fetch('/tvbot/getTreeList');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        workspaceBrowserState.treeList = Array.isArray(data.treeList) ? data.treeList : [];
        workspaceBrowserState.projectList = Array.isArray(data.projectList) ? data.projectList : [];
        workspaceBrowserState.loaded = true;
    } catch (err) {
        const { container } = getWorkspaceControls();
        if (container) {
            container.innerHTML = `<div class="workspace-empty-state text-danger">${escapeHtml(t('workspaceLoadFailed', err.message))}</div>`;
        }
        updateWorkspaceSummary(0, 0);
        workspaceBrowserState.loaded = false;
        return;
    } finally {
        workspaceBrowserState.loading = false;
    }
    renderWorkspaceBrowser();
}

window.openWorkspaceModal = function(targetType) {
    const modalEl = getWorkspaceModal();
    workspaceBrowserState.targetType = String(targetType || '1');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    renderWorkspaceLoading();
    fetchWorkspaceTreeList(false);
};

window.selectWorkspaceTree = async function(dataObj) {
    const { projectId, treeName } = dataObj;
    const modalEl = getWorkspaceModal();
    const targetType = workspaceBrowserState.targetType;

    if (targetType === 'comparison') {
        const dataUrl = `/api/get_tree/${encodeURIComponent(projectId)}/${encodeURIComponent(treeName)}.json`;
        window.history.replaceState({}, '', `?originalJsonDataUri=${encodeURIComponent(dataUrl)}&projectId=${encodeURIComponent(projectId)}&treeTitle=${encodeURIComponent(treeName)}`);
        initTanglegramFromUrl();
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        return;
    }

    const treeNum = Number(targetType || '1');
    try {
        const { payload } = await fetchTreePayload(projectId, treeName);
        setWorkspaceSelection(treeNum, projectId, treeName, payload);
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    } catch (err) {
        alert(t('workspaceSelectFailed', err.message));
    }
};

document.getElementById('workspaceAccordion').addEventListener('click', function(event) {
    const button = event.target.closest('button[data-project-id][data-tree-name]');
    if (!button) return;

    window.selectWorkspaceTree({
        projectId: button.dataset.projectId,
        treeName: button.dataset.treeName
    });
});

document.getElementById('workspace-search').addEventListener('input', function(event) {
    workspaceBrowserState.search = String(event.target.value || '');
    renderWorkspaceBrowser();
});

document.getElementById('workspace-sort-by').addEventListener('change', function(event) {
    workspaceBrowserState.sortBy = String(event.target.value || 'mtime');
    renderWorkspaceBrowser();
});

document.getElementById('workspace-sort-dir').addEventListener('click', function() {
    workspaceBrowserState.sortDir = workspaceBrowserState.sortDir === 'desc' ? 'asc' : 'desc';
    renderWorkspaceBrowser();
});

document.getElementById('workspace-refresh').addEventListener('click', function() {
    fetchWorkspaceTreeList(true);
});

document.getElementById('file-comparison').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const payload = JSON.parse(text);
        if (payload.plotType !== 'tanglegramTree') {
            alert(t('loadedNotTanglegram'));
            return;
        }

        // Create a local blob URL for the comparison JSON
        const blob = new Blob([text], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Use history to trigger the loading logic
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('originalJsonDataUri', blobUrl);
        window.history.replaceState({}, '', newUrl.toString());
        
        initTanglegramFromUrl();
        
        const labelEl = document.getElementById('label-comparison');
        if (labelEl) labelEl.textContent = `[Local: ${file.name}]`;
    } catch (err) {
        alert(t('saveFailed', err.message));
    }
});

document.getElementById('file1').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const plotType = parseLocalJsonFile(text);
        const blob = new Blob([text], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);

        setSelectedTree(1, {
            treeName: file.name.replace(/\.json$/i, ''),
            projectId: 'local',
            plotType,
            dataUrl: blobUrl,
            sourceLabel: t('localSource'),
            localBlobUrl: blobUrl
        });
    } catch (err) {
        alert(t('leftJsonReadFailed', err.message));
    }
});

document.getElementById('file2').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const plotType = parseLocalJsonFile(text);
        const blob = new Blob([text], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);

        setSelectedTree(2, {
            treeName: file.name.replace(/\.json$/i, ''),
            projectId: 'local',
            plotType,
            dataUrl: blobUrl,
            sourceLabel: t('localSource'),
            localBlobUrl: blobUrl
        });
    } catch (err) {
        alert(t('rightJsonReadFailed', err.message));
    }
});

document.getElementById('btn-draw').addEventListener('click', loadSelectedTrees);
document.getElementById('btn-manual-mode').addEventListener('click', function() {
    manualConnectMode = !manualConnectMode;
    pendingSelection = null;
    updateManualModeButton();
    if (manualConnectMode) {
        setStatus(t('manualStatusOn'));
    } else {
        setStatus(t('manualStatusOff'));
    }
});
document.getElementById('btn-box-delete-mode').addEventListener('click', function() {
    boxDeleteMode = !boxDeleteMode;
    updateBoxDeleteModeButton();
    setupBoxDeleteInteraction();
    if (boxDeleteMode) {
        setStatus(t('boxDeleteStatusOn'));
    } else {
        setStatus(t('boxDeleteStatusOff'));
    }
});
document.getElementById('btn-toggle-pan').addEventListener('click', function() {
    canvasPanLocked = !canvasPanLocked;
    updatePanLockButton();
    ensureCombinedZoom();
    if (canvasPanLocked) {
        setStatus(t('panStatusLocked'));
    } else {
        setStatus(t('panStatusUnlocked'));
    }
});
document.getElementById('btn-auto-connect').addEventListener('click', autoConnectByName);
document.getElementById('btn-clear-connections').addEventListener('click', function() {
    tgStore.clear();
    pendingSelection = null;
    tgStore.select(null);
    updateConnectionList();
    drawConnections();
    syncStyleControlsFromSelection();
    setStatus(t('clearedConnections'));
});
document.getElementById('btn-export-svg').addEventListener('click', exportCombinedSvg);
document.getElementById('btn-export-pdf').addEventListener('click', exportCombinedPdf);

document.getElementById('connection-list').addEventListener('click', function(event) {
    const row = event.target.closest('[data-role="connection-row"]');
    if (!row) return;
    tgStore.select(Number(row.dataset.idx));
    updateConnectionList();
    syncStyleControlsFromSelection();
});

document.getElementById('line-color').addEventListener('input', function() {
    const style = readCurrentStyleInputs();
    tgStore.setDefaultStyle({ color: style.color });
    if (tgStore.updateSelectedStyle({ color: style.color })) {
        drawConnections();
        updateConnectionList();
    }
    refreshStyleControlLabels();
    updateStyleHint();
});

document.getElementById('line-width').addEventListener('input', function() {
    const style = readCurrentStyleInputs();
    tgStore.setDefaultStyle({ width: style.width });
    if (tgStore.updateSelectedStyle({ width: style.width })) {
        drawConnections();
        updateConnectionList();
    }
    refreshStyleControlLabels();
    updateStyleHint();
});

document.getElementById('line-opacity').addEventListener('input', function() {
    const style = readCurrentStyleInputs();
    tgStore.setDefaultStyle({ opacity: style.opacity });
    if (tgStore.updateSelectedStyle({ opacity: style.opacity })) {
        drawConnections();
        updateConnectionList();
    }
    refreshStyleControlLabels();
    updateStyleHint();
});

[
    ['layout-right-x', 'rightX'],
    ['layout-right-y', 'rightY']
].forEach(([elementId, stateKey]) => {
    document.getElementById(elementId).addEventListener('input', function(event) {
        layoutState[stateKey] = Number(event.target.value);
        refreshLayoutControlLabels();
        redrawCombinedCanvas();
        if (ensureFramesReady()) {
            setStatus(t('layoutUpdated'));
        }
    });
});

window.addEventListener('resize', drawConnections);
window.addEventListener('languageChanged', function() {
    updateManualModeButton();
    updateBoxDeleteModeButton();
    updatePanLockButton();
    updateStyleHint();
    updateTreeSummary(1);
    updateTreeSummary(2);
    renderWorkspaceBrowser();
    updateWorkspaceSortDirButton();
});
updateConnectionList();
syncStyleControlsFromSelection();
syncLayoutInputsFromState();
updateManualModeButton();
updateBoxDeleteModeButton();
updatePanLockButton();
setStatus(t('initialStatus'));

// ---------------------------
// Save & Load Tanglegram logic
// ---------------------------

async function updateSaveModalExistingFiles() {
    const folderSelect = document.getElementById('save-folder-select').value;
    const folderNew = document.getElementById('save-folder-new').value.trim();
    const saveProject = folderNew || folderSelect;
    const container = document.getElementById('save-existing-files');
    const warning = document.getElementById('overwrite-warning');
    const filenameInput = document.getElementById('save-filename');

    if (!saveProject) {
        container.innerHTML = `<div class="text-muted italic">Select a folder to see existing files</div>`;
        warning.classList.add('d-none');
        return;
    }

    const files = workspaceBrowserState.treeList.filter(t => t.projectId === saveProject).map(t => t.treeName);
    if (files.length === 0) {
        container.innerHTML = `<div class="text-muted small">No files in this folder</div>`;
    } else {
        container.innerHTML = files.map(f => `<div class="text-truncate" title="${escapeHtml(f)}">${escapeHtml(f)}.json</div>`).join('');
    }

    const currentFilename = filenameInput.value.trim();
    if (currentFilename && files.includes(currentFilename)) {
        warning.classList.remove('d-none');
    } else {
        warning.classList.add('d-none');
    }
}

async function openSaveModal() {
    if (!selectedTrees[1] || !selectedTrees[2]) {
        alert(t('saveLoadBoth'));
        return;
    }
    if (selectedTrees[1].projectId === 'local' || selectedTrees[2].projectId === 'local') {
        alert(t('saveNoLocal'));
        return;
    }

    const modalEl = getSaveModal();
    const modal = new bootstrap.Modal(modalEl);
    
    // Populate folder select
    const select = document.getElementById('save-folder-select');
    select.innerHTML = '';
    
    const projects = Array.isArray(workspaceBrowserState.projectList) ? workspaceBrowserState.projectList : [];
    if (projects.length === 0) {
        // Fetch list if not loaded
        await fetchWorkspaceTreeList(false);
    }
    
    workspaceBrowserState.projectList.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.projectId;
        opt.textContent = p.projectName || p.projectId;
        select.appendChild(opt);
    });

    // Default values
    const defProj = getDefaultSaveProject();
    if (workspaceBrowserState.projectList.some(p => p.projectId === defProj)) {
        select.value = defProj;
    }
    
    document.getElementById('save-filename').value = makeExportBaseName();
    document.getElementById('save-folder-new').value = '';
    
    updateSaveModalExistingFiles();
    modal.show();
}

document.getElementById('save-folder-select').addEventListener('change', updateSaveModalExistingFiles);
document.getElementById('save-folder-new').addEventListener('input', updateSaveModalExistingFiles);
document.getElementById('save-filename').addEventListener('input', updateSaveModalExistingFiles);

async function confirmSaveComparison() {
    const folderSelect = document.getElementById('save-folder-select').value;
    const folderNew = document.getElementById('save-folder-new').value.trim();
    const treeName = document.getElementById('save-filename').value.trim();
    
    const saveProject = folderNew || folderSelect;
    if (!saveProject) return;
    if (!isValidWorkspaceName(saveProject)) {
        alert(t('saveFolderInvalid'));
        return;
    }
    if (!treeName) return;

    const payload = {
        plotType: 'tanglegramTree',
        leftTree: {
            projectId: selectedTrees[1].projectId,
            treeName: selectedTrees[1].treeName
        },
        rightTree: {
            projectId: selectedTrees[2].projectId,
            treeName: selectedTrees[2].treeName
        },
        connections: tgStore.state.connections.map(c => ({
            leftKey: c.left.key,
            rightKey: c.right.key,
            style: { ...c.style }
        })),
        layoutState: { ...layoutState },
        defaultConnectionStyle: { ...tgStore.state.defaultStyle }
    };

    try {
        const res = await fetch('/tvbot/saveOriginalJsonData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: saveProject,
                treeName: treeName,
                jsonData: JSON.stringify(payload)
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(t('saveOk'));
            const modal = bootstrap.Modal.getInstance(getSaveModal());
            if (modal) modal.hide();
            
            // update URL so reload works
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('originalJsonDataUri', `/api/get_tree/${encodeURIComponent(saveProject)}/${encodeURIComponent(treeName)}.json`);
            newUrl.searchParams.set('projectId', saveProject);
            newUrl.searchParams.set('treeTitle', treeName);
            window.history.replaceState({}, '', newUrl.toString());
            
            // refresh workspace list for next time
            fetchWorkspaceTreeList(true);
        } else {
            alert(t('saveError', data.error));
        }
    } catch (err) {
        alert(t('saveFailed', err.message));
    }
}

document.getElementById('btn-confirm-save').addEventListener('click', confirmSaveComparison);

if (document.getElementById('btn-save-workspace')) {
    document.getElementById('btn-save-workspace').addEventListener('click', openSaveModal);
}

// Check if we need to load an existing tanglegram JSON
async function initTanglegramFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataUri = urlParams.get('originalJsonDataUri');
    if (!dataUri) return;

    try {
        const res = await fetch(dataUri);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        
        if (payload.plotType !== 'tanglegramTree') {
            console.warn(t('loadedNotTanglegram'));
            return;
        }

        // Restore trees
        const [leftRes, rightRes] = await Promise.all([
            fetchTreePayload(payload.leftTree.projectId, payload.leftTree.treeName).catch(e => null),
            fetchTreePayload(payload.rightTree.projectId, payload.rightTree.treeName).catch(e => null)
        ]);

        if (leftRes) {
            setWorkspaceSelection(1, payload.leftTree.projectId, payload.leftTree.treeName, leftRes.payload);
        }
        if (rightRes) {
            setWorkspaceSelection(2, payload.rightTree.projectId, payload.rightTree.treeName, rightRes.payload);
        }

        if (payload.layoutState) {
            Object.assign(layoutState, payload.layoutState);
            syncLayoutInputsFromState();
        }
        if (payload.defaultConnectionStyle) {
            tgStore.setDefaultStyle({ ...payload.defaultConnectionStyle });
            syncStyleControlsFromSelection();
        }

        if (leftRes && rightRes) {
            await loadSelectedTrees();
            
            // After loading, restore connections
            if (payload.connections && payload.connections.length > 0) {
                const leftMap = new Map();
                getCombinedTargets(1).forEach(r => leftMap.set(r.key, r));
                const rightMap = new Map();
                getCombinedTargets(2).forEach(r => rightMap.set(r.key, r));

                const nextConnections = [];
                payload.connections.forEach(c => {
                    const left = leftMap.get(c.leftKey);
                    const right = rightMap.get(c.rightKey);
                    if (left && right) {
                        nextConnections.push({ left: toStoreTarget(left), right: toStoreTarget(right), style: c.style });
                    }
                });
                tgStore.setConnections(nextConnections);
                
                if (tgStore.state.connections.length > 0) {
                    tgStore.select(0);
                }
                updateConnectionList();
                drawConnections();
                syncStyleControlsFromSelection();
            }
        }
    } catch (err) {
        console.error('Failed to init from URL:', err);
    }
}

// Call init on load
initTanglegramFromUrl();
