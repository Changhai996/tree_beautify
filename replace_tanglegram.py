import sys
import re

with open('/Users/duanchanghai/Downloads/tools/TVBOT/src/tanglegramTree.html', 'r') as f:
    content = f.read()

# Add translation script and update HTML
new_html = content.replace(
    '<h5 class="fw-bold mb-3">双树比较</h5>',
    '''<div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0" data-i18n="tg_title">Dual-Tree Comparison</h5>
            <button id="lang-toggle" class="btn btn-sm btn-outline-secondary" style="font-size: 0.8rem;">🌐 中文</button>
        </div>'''
).replace(
    '<label class="form-label fw-bold text-primary">左侧树</label>',
    '<label class="form-label fw-bold text-primary" data-i18n="tg_left_tree">Left Tree</label>'
).replace(
    '从 Workspace 选择 JSON',
    '<span data-i18n="tg_select_workspace">Select JSON from Workspace</span>'
).replace(
    '<label class="form-label fw-bold text-primary">右侧树</label>',
    '<label class="form-label fw-bold text-primary" data-i18n="tg_right_tree">Right Tree</label>'
).replace(
    '加载左右双树',
    '<span data-i18n="tg_load_trees">Load Dual Trees</span>'
).replace(
    '开启手动连线模式',
    '<span data-i18n="tg_manual_mode">Enable Manual Connection</span>'
).replace(
    '按叶名/折叠名自动连线',
    '<span data-i18n="tg_auto_mode">Auto-connect by Leaf/Clade</span>'
).replace(
    '清空连线',
    '<span data-i18n="tg_clear_conn">Clear Connections</span>'
).replace(
    '开启框选删线',
    '<span data-i18n="tg_box_delete">Enable Box Deletion</span>'
).replace(
    '锁定画布移动',
    '<span data-i18n="tg_lock_pan">Lock Canvas Panning</span>'
).replace(
    '导出 SVG',
    '<span data-i18n="tg_export_svg">Export SVG</span>'
).replace(
    '导出 PDF',
    '<span data-i18n="tg_export_pdf">Export PDF</span>'
).replace(
    '<h6 class="fw-bold mb-3">连线样式</h6>',
    '<h6 class="fw-bold mb-3" data-i18n="tg_conn_style">Connection Style</h6>'
).replace(
    '<label class="form-label small mb-1">颜色</label>',
    '<label class="form-label small mb-1" data-i18n="tg_color">Color</label>'
).replace(
    '<label class="form-label small mb-1">粗细 <span id="line-width-value">2</span></label>',
    '<label class="form-label small mb-1"><span data-i18n="tg_thickness">Thickness</span> <span id="line-width-value">2</span></label>'
).replace(
    '<label class="form-label small mb-1">透明度 <span id="line-opacity-value">0.7</span></label>',
    '<label class="form-label small mb-1"><span data-i18n="tg_opacity">Opacity</span> <span id="line-opacity-value">0.7</span></label>'
).replace(
    '未选中具体连线时，这些参数会作为新连线默认样式。',
    '<span data-i18n="tg_style_hint">These act as default styles for new connections if none is selected.</span>'
).replace(
    '<h6 class="fw-bold mb-3">树布局调整</h6>',
    '<h6 class="fw-bold mb-3" data-i18n="tg_layout_adj">Tree Layout Adjustment</h6>'
).replace(
    '<label class="form-label small mb-1">右树左右 <span id="layout-right-x-value">0</span></label>',
    '<label class="form-label small mb-1"><span data-i18n="tg_right_x">Right Tree X</span> <span id="layout-right-x-value">0</span></label>'
).replace(
    '<label class="form-label small mb-1">右树上下 <span id="layout-right-y-value">0</span></label>',
    '<label class="form-label small mb-1"><span data-i18n="tg_right_y">Right Tree Y</span> <span id="layout-right-y-value">0</span></label>'
).replace(
    '只移动右侧树。调节后会立即重绘双树和连线，双击画布中的连线可直接删除。',
    '<span data-i18n="tg_layout_hint">Moves only the right tree. Double-click connections on canvas to delete them.</span>'
).replace(
    '先分别选择左侧和右侧的 Workspace JSON 文件，再加载双树。当前是同一张合成画布；需要手动连线时，请先开启“手动连线模式”。',
    '<span data-i18n="tg_status_init">Select Workspace JSON files for left and right trees, then load. To draw lines manually, enable "Manual Connection Mode" first.</span>'
).replace(
    '<h6 class="fw-bold mb-2">连线列表</h6>',
    '<h6 class="fw-bold mb-2" data-i18n="tg_conn_list">Connection List</h6>'
).replace(
    '<h6 class="canvas-tree-title" id="tree-title-1">左侧树</h6>',
    '<h6 class="canvas-tree-title" id="tree-title-1" data-i18n="tg_left_tree_canvas">Left Tree</h6>'
).replace(
    '<p class="canvas-tree-subtitle" id="tree-source-1">尚未加载</p>',
    '<p class="canvas-tree-subtitle" id="tree-source-1" data-i18n="tg_not_loaded">Not Loaded</p>'
).replace(
    '单独打开',
    '<span data-i18n="tg_open_solo">Open Alone</span>'
).replace(
    '<h6 class="canvas-tree-title" id="tree-title-2">右侧树</h6>',
    '<h6 class="canvas-tree-title" id="tree-title-2" data-i18n="tg_right_tree_canvas">Right Tree</h6>'
).replace(
    '<p class="canvas-tree-subtitle" id="tree-source-2">尚未加载</p>',
    '<p class="canvas-tree-subtitle" id="tree-source-2" data-i18n="tg_not_loaded">Not Loaded</p>'
).replace(
    '<h5 class="modal-title">从 Workspace 选择树 JSON</h5>',
    '<h5 class="modal-title" data-i18n="tg_modal_title">Select Tree JSON from Workspace</h5>'
)

translation_script = """
<script>
    const tgTranslations = {
        en: {
            tg_title: "Dual-Tree Comparison",
            tg_left_tree: "Left Tree",
            tg_right_tree: "Right Tree",
            tg_select_workspace: "Select JSON from Workspace",
            tg_load_trees: "Load Dual Trees",
            tg_manual_mode: "Enable Manual Connection",
            tg_auto_mode: "Auto-connect by Leaf/Clade",
            tg_clear_conn: "Clear Connections",
            tg_box_delete: "Enable Box Deletion",
            tg_lock_pan: "Lock Canvas Panning",
            tg_export_svg: "Export SVG",
            tg_export_pdf: "Export PDF",
            tg_conn_style: "Connection Style",
            tg_color: "Color",
            tg_thickness: "Thickness",
            tg_opacity: "Opacity",
            tg_style_hint: "These act as default styles for new connections if none is selected.",
            tg_layout_adj: "Tree Layout Adjustment",
            tg_right_x: "Right Tree X",
            tg_right_y: "Right Tree Y",
            tg_layout_hint: "Moves only the right tree. Double-click connections on canvas to delete them.",
            tg_status_init: "Select Workspace JSON files for left and right trees, then load. To draw lines manually, enable 'Manual Connection Mode' first.",
            tg_conn_list: "Connection List",
            tg_left_tree_canvas: "Left Tree",
            tg_right_tree_canvas: "Right Tree",
            tg_not_loaded: "Not Loaded",
            tg_open_solo: "Open Alone",
            tg_modal_title: "Select Tree JSON from Workspace",
            lang_label: "🌐 中文"
        },
        zh: {
            tg_title: "双树比较",
            tg_left_tree: "左侧树",
            tg_right_tree: "右侧树",
            tg_select_workspace: "从 Workspace 选择 JSON",
            tg_load_trees: "加载左右双树",
            tg_manual_mode: "开启手动连线模式",
            tg_auto_mode: "按叶名/折叠名自动连线",
            tg_clear_conn: "清空连线",
            tg_box_delete: "开启框选删线",
            tg_lock_pan: "锁定画布移动",
            tg_export_svg: "导出 SVG",
            tg_export_pdf: "导出 PDF",
            tg_conn_style: "连线样式",
            tg_color: "颜色",
            tg_thickness: "粗细",
            tg_opacity: "透明度",
            tg_style_hint: "未选中具体连线时，这些参数会作为新连线默认样式。",
            tg_layout_adj: "树布局调整",
            tg_right_x: "右树左右",
            tg_right_y: "右树上下",
            tg_layout_hint: "只移动右侧树。调节后会立即重绘双树和连线，双击画布中的连线可直接删除。",
            tg_status_init: "先分别选择左侧和右侧的 Workspace JSON 文件，再加载双树。当前是同一张合成画布；需要手动连线时，请先开启“手动连线模式”。",
            tg_conn_list: "连线列表",
            tg_left_tree_canvas: "左侧树",
            tg_right_tree_canvas: "右侧树",
            tg_not_loaded: "尚未加载",
            tg_open_solo: "单独打开",
            tg_modal_title: "从 Workspace 选择树 JSON",
            lang_label: "🌐 English"
        }
    };

    let currentLang = localStorage.getItem('tvbot_lang') || 'en';

    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (tgTranslations[lang] && tgTranslations[lang][key]) {
                el.innerHTML = tgTranslations[lang][key];
            }
        });
        const toggleBtn = document.getElementById('lang-toggle');
        if(toggleBtn) {
            toggleBtn.innerText = tgTranslations[lang]['lang_label'];
        }
        
        // Broadcast event for JS components if needed
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyLanguage(currentLang);
        const toggleBtn = document.getElementById('lang-toggle');
        if(toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                currentLang = currentLang === 'en' ? 'zh' : 'en';
                localStorage.setItem('tvbot_lang', currentLang);
                applyLanguage(currentLang);
            });
        }
    });
</script>
</body>
"""
new_html = new_html.replace('</body>', translation_script)

with open('/Users/duanchanghai/Downloads/tools/TVBOT/src/tanglegramTree.html', 'w') as f:
    f.write(new_html)
