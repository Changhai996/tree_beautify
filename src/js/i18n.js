const globalTranslations = {
    'Reroot on this node': '在此节点重新定根',
    'offset': '偏移量',
    'Project:': '项目:',
    'Normal': '普通树',
    'Circular': '圆形树',
    'Unrooted': '无根树',
    'Export PDF': '导出 PDF',
    'Export SVG': '导出 SVG',
    'Text': '文本',
    'Color': '颜色',
    'Size': '大小',
    'Style': '样式',
    'Width': '宽度',
    'Height': '高度',
    'Upload': '上传',
    'Download': '下载',
    'Save': '保存',
    'Cancel': '取消',
    'Confirm': '确定',
    'Delete': '删除',
    'Edit': '编辑',
    'Node': '节点',
    'Branch': '分支',
    'Leaf': '叶子',
    'Label': '标签',
    'Background': '背景',
    'Opacity': '透明度',
    'Line': '线条',
    'Shape': '形状',
    'Circle': '圆形',
    'Rect': '矩形',
    'Triangle': '三角形',
    'Star': '星形',
    'Cross': '十字',
    'Font': '字体',
    'Font Size': '字号',
    'Bold': '加粗',
    'Italic': '斜体',
    'Alignment': '对齐',
    'Left': '左对齐',
    'Center': '居中',
    'Right': '右对齐',
    'Top': '顶部',
    'Bottom': '底部',
    'Margin': '外边距',
    'Padding': '内边距',
    'Border': '边框',
    'Shadow': '阴影',
    'Layout': '布局',
    'Position': '位置',
    'Scale': '缩放',
    'Rotation': '旋转',
    'Tree structure change btn box': '树结构调整',
    'Loading...': '加载中...'
};

function translateDOM(lang) {
    const isZh = lang === 'zh';
    
    // We walk the DOM and replace text nodes.
    // To be safe and reversible, we store original english in a data attribute
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToTranslate = [];
    while (node = walker.nextNode()) {
        if (node.parentElement && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
            const text = node.nodeValue.trim();
            if (text) nodesToTranslate.push({node, text, parent: node.parentElement});
        }
    }

    nodesToTranslate.forEach(({node, text, parent}) => {
        // Init original text if not present
        if (!parent.hasAttribute('data-orig-en')) {
            // Only set if we match a known string or it's currently English
            parent.setAttribute('data-orig-en', text);
        }

        const origEn = parent.getAttribute('data-orig-en');
        
        if (isZh) {
            if (globalTranslations[origEn]) {
                node.nodeValue = node.nodeValue.replace(origEn, globalTranslations[origEn]);
            }
        } else {
            // Revert to English
            if (globalTranslations[origEn]) {
                node.nodeValue = node.nodeValue.replace(globalTranslations[origEn], origEn);
            }
        }
    });
}

function initGlobalI18n() {
    let currentLang = localStorage.getItem('tvbot_lang') || 'en';
    
    // Create floating toggle button if not exists
    if (!document.getElementById('global-lang-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'global-lang-toggle';
        btn.className = 'btn btn-sm btn-outline-secondary';
        btn.style.cssText = 'position: fixed; top: 15px; right: 20px; z-index: 99999; background: rgba(255,255,255,0.9); box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 20px; padding: 4px 12px; font-weight: bold; cursor: pointer; border: 1px solid #ccc;';
        btn.innerText = currentLang === 'en' ? '🌐 中文' : '🌐 English';
        
        btn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'zh' : 'en';
            localStorage.setItem('tvbot_lang', currentLang);
            btn.innerText = currentLang === 'en' ? '🌐 中文' : '🌐 English';
            translateDOM(currentLang);
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
        });
        
        document.body.appendChild(btn);
    }
    
    // Initial translation (delay slightly for Vue to render)
    setTimeout(() => {
        translateDOM(currentLang);
    }, 500);
    setTimeout(() => {
        translateDOM(currentLang);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', initGlobalI18n);
