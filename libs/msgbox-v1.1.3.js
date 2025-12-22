// version 1.1.3
// see https://scriptcat.org/zh-CN/script-show-page/4824
(() => {
    // 语言包
    const i18n = {
        'zh-CN': {
            alert: { title: '提示', okText: '确定' },
            confirm: { title: '确认', okText: '确定', cancelText: '取消' },
            prompt: { title: '输入', okText: '确定', cancelText: '取消' }
        },
        'en-US': {
            alert: { title: 'Alert', okText: 'OK' },
            confirm: { title: 'Confirm', okText: 'OK', cancelText: 'Cancel' },
            prompt: { title: 'Input', okText: 'OK', cancelText: 'Cancel' }
        }
    };
    // 当前语言（默认自动检测）
    let currentLang = navigator.language || 'en-US';

    // 当前主题
    let currentTheme = 'auto';

    // 遮罩层 z-index 值
    let currentZIndex = 9999;

    /**
     * 设置语言
     * @param {string} lang - 语言代码，如 'zh-CN', 'en-US'
     */
    function setLang(lang) {
        lang = lang.replace('_', '-');
        if (i18n[lang]) {
            currentLang = lang;
        } else {
            currentLang = 'en-US';
            console.warn(`Language '${lang}' not supported, using '${currentLang}'`);
        }
    }
    /**
     * 获取当前语言的文本
     * @param {string} type - 对话框类型
     * @param {string} key - 文本键
     * @returns {string}
     */
    function getText(type, key) {
        return i18n[currentLang]?.[type]?.[key] || i18n['zh-CN'][type][key];
    }

    /**
     * 显示警告对话框
     * @param {string} message - 显示的消息内容
     * @param {Object} [options] - 配置选项
     * @param {string} [options.title='提示'] - 对话框标题
     * @param {string} [options.okText='确定'] - 确认按钮文字
     * @param {('light'|'dark'|'auto')} [options.theme='auto'] - 主题模式
     * @param {number} [options.zIndex=9999] - 遮罩层的 z-index 值
     * @returns {Promise<void>}
     */
    async function showAlert(message, options = {}) {
        let lang = options.lang ? options.lang.replace('_', '-') : currentLang;
        lang = i18n[lang] ? lang : 'en-US';
        const {
            title = i18n[lang]?.alert.title || getText('alert', 'title'),
            okText = i18n[lang]?.alert.okText || getText('alert', 'okText'),
            theme = '',
            zIndex = 0
        } = options;

        return new Promise((resolve) => {
            // 获取当前主题
            const isDark = getTheme(theme || currentTheme);
            const themeColors = getThemeColors(isDark);

            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, ${isDark ? '0.7' : '0.5'});
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${zIndex || currentZIndex};
            `;

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
            background: ${themeColors.bg};
            border-radius: 8px;
            padding: 20px;
            min-width: 380px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
            `;

            dialog.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: ${themeColors.title};">${title}</div>
            <div style="font-size: 14px; margin-bottom: 20px; color: ${themeColors.text};">${message}</div>
            <div style="text-align: right;">
                <button id="alertOkBtn" style="
                padding: 8px 20px;
                background: ${themeColors.primaryBtn};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
                ">${okText}</button>
            </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 添加按钮悬停效果
            const okBtn = dialog.querySelector('#alertOkBtn');
            okBtn.onmouseover = () => okBtn.style.opacity = '0.9';
            okBtn.onmouseout = () => okBtn.style.opacity = '1';

            // 绑定确定按钮事件
            okBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve();
            };
        });
    }

    /**
     * 显示确认对话框
     * @param {string} message - 显示的消息内容
     * @param {Object} [options] - 配置选项
     * @param {string} [options.title='确认'] - 对话框标题
     * @param {string} [options.okText='确定'] - 确认按钮文字
     * @param {string} [options.cancelText='取消'] - 取消按钮文字
     * @param {('light'|'dark'|'auto')} [options.theme='auto'] - 主题模式
     * @param {number} [options.zIndex=9999] - 遮罩层的 z-index 值
     * @returns {Promise<boolean>} - 返回 true 表示确定，false 表示取消
     */
    async function showConfirm(message, options = {}) {
        let lang = options.lang ? options.lang.replace('_', '-') : currentLang;
        lang = i18n[lang] ? lang : 'en-US';
        const {
            title = i18n[lang]?.confirm.title || getText('confirm', 'title'),
            okText = i18n[lang]?.confirm.okText || getText('confirm', 'okText'),
            cancelText = i18n[lang]?.confirm.cancelText || getText('confirm', 'cancelText'),
            theme = '',
            zIndex = 0
        } = options;

        return new Promise((resolve) => {
            // 获取当前主题
            const isDark = getTheme(theme || currentTheme);
            const themeColors = getThemeColors(isDark);

            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, ${isDark ? '0.7' : '0.5'});
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${zIndex || currentZIndex};
            `;

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
            background: ${themeColors.bg};
            border-radius: 8px;
            padding: 20px;
            min-width: 380px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
            `;

            dialog.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: ${themeColors.title};">${title}</div>
            <div style="font-size: 14px; margin-bottom: 20px; color: ${themeColors.text};">${message}</div>
            <div style="text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="confirmCancelBtn" style="
                padding: 8px 20px;
                background: ${themeColors.cancelBtn};
                color: ${themeColors.cancelBtnText};
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
                ">${cancelText}</button>
                <button id="confirmOkBtn" style="
                padding: 8px 20px;
                background: ${themeColors.primaryBtn};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
                ">${okText}</button>
            </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 添加按钮悬停效果
            const okBtn = dialog.querySelector('#confirmOkBtn');
            const cancelBtn = dialog.querySelector('#confirmCancelBtn');

            okBtn.onmouseover = () => okBtn.style.opacity = '0.9';
            okBtn.onmouseout = () => okBtn.style.opacity = '1';
            cancelBtn.onmouseover = () => cancelBtn.style.opacity = '0.9';
            cancelBtn.onmouseout = () => cancelBtn.style.opacity = '1';

            // 关闭对话框的函数
            const closeDialog = (result) => {
                document.body.removeChild(overlay);
                resolve(result);
            };

            // 绑定按钮事件
            okBtn.onclick = () => closeDialog(true);
            cancelBtn.onclick = () => closeDialog(false);

            // 点击遮罩层关闭（返回取消）
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    closeDialog(false);
                }
            };

            // ESC 键关闭
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closeDialog(false);
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        });
    }

    /**
     * 显示输入对话框
     * @param {string} message - 显示的消息内容
     * @param {string} [defaultValue=''] - 输入框默认值
     * @param {Object} [options] - 配置选项
     * @param {string} [options.title='输入'] - 对话框标题
     * @param {string} [options.okText='确定'] - 确认按钮文字
     * @param {string} [options.cancelText='取消'] - 取消按钮文字
     * @param {string} [options.placeholder=''] - 输入框占位符
     * @param {('light'|'dark'|'auto')} [options.theme='auto'] - 主题模式
     * @param {number} [options.zIndex=9999] - 遮罩层的 z-index 值
     * @returns {Promise<string|false>} - 返回输入的内容（可为空字符串），或 false 表示取消
     */
    async function showPrompt(message, defaultValue = '', options = {}) {
        let lang = options.lang ? options.lang.replace('_', '-') : currentLang;
        lang = i18n[lang] ? lang : 'en-US';
        const {
            title = i18n[lang]?.prompt.title || getText('prompt', 'title'),
            okText = i18n[lang]?.prompt.okText || getText('prompt', 'okText'),
            cancelText = i18n[lang]?.prompt.cancelText || getText('prompt', 'cancelText'),
            placeholder = '',
            theme = '',
            zIndex = 0
        } = options;

        return new Promise((resolve) => {
            // 获取当前主题
            const isDark = getTheme(theme || currentTheme);
            const themeColors = getThemeColors(isDark);

            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, ${isDark ? '0.7' : '0.5'});
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${zIndex || currentZIndex};
            `;

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
            background: ${themeColors.bg};
            border-radius: 8px;
            padding: 20px;
            min-width: 380px;
            max-width: 500px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
            `;

            dialog.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: ${themeColors.title};">${title}</div>
            <div style="font-size: 14px; margin-bottom: 15px; color: ${themeColors.text};">${message}</div>
            <input 
                type="text" 
                id="promptInput" 
                value="${escapeHtml(defaultValue)}"
                placeholder="${escapeHtml(placeholder)}"
                style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid ${isDark ? '#555' : '#ddd'};
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                    margin-bottom: 20px;
                    background: ${isDark ? '#3a3a3a' : '#ffffff'};
                    color: ${themeColors.text};
                    outline: none;
                "
            />
            <div style="text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="promptCancelBtn" style="
                padding: 8px 20px;
                background: ${themeColors.cancelBtn};
                color: ${themeColors.cancelBtnText};
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
                ">${cancelText}</button>
                <button id="promptOkBtn" style="
                padding: 8px 20px;
                background: ${themeColors.primaryBtn};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
                ">${okText}</button>
            </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 获取元素
            const input = dialog.querySelector('#promptInput');
            const okBtn = dialog.querySelector('#promptOkBtn');
            const cancelBtn = dialog.querySelector('#promptCancelBtn');

            // 聚焦输入框并选中文本
            setTimeout(() => {
                input.focus();
                input.select();
            }, 0);

            // 添加输入框焦点样式
            input.onfocus = () => {
                input.style.borderColor = themeColors.primaryBtn;
            };
            input.onblur = () => {
                input.style.borderColor = isDark ? '#555' : '#ddd';
            };

            // 添加按钮悬停效果
            okBtn.onmouseover = () => okBtn.style.opacity = '0.9';
            okBtn.onmouseout = () => okBtn.style.opacity = '1';
            cancelBtn.onmouseover = () => cancelBtn.style.opacity = '0.9';
            cancelBtn.onmouseout = () => cancelBtn.style.opacity = '1';

            // 关闭对话框的函数
            const closeDialog = (result) => {
                document.removeEventListener('keydown', handleKeydown);
                document.body.removeChild(overlay);
                resolve(result);
            };

            // 绑定按钮事件
            okBtn.onclick = () => closeDialog(input.value);
            cancelBtn.onclick = () => closeDialog(false);

            // 点击遮罩层关闭（返回 false）
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    closeDialog(false);
                }
            };

            // 键盘事件处理
            const handleKeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    closeDialog(input.value);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDialog(false);
                }
            };
            document.addEventListener('keydown', handleKeydown);
        });
    }

    /**
     * 获取主题模式
     * @param {string} theme - 主题设置
     * @returns {boolean} - true 表示深色主题
     */
    function getTheme(theme) {
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        // auto 模式：检测系统主题
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function setTheme(theme) {
        currentTheme = theme || 'auto';
    }

    /**
     * 获取主题颜色
     * @param {boolean} isDark - 是否深色主题
     * @returns {Object} 主题颜色对象
     */
    function getThemeColors(isDark) {
        if (isDark) {
            return {
                bg: '#2d2d2d',
                title: '#ffffff',
                text: '#e0e0e0',
                primaryBtn: '#0d6efd',
                cancelBtn: '#4a4a4a',
                cancelBtnText: '#ffffff'
            };
        } else {
            return {
                bg: '#ffffff',
                title: '#333333',
                text: '#666666',
                primaryBtn: '#007bff',
                cancelBtn: '#e9ecef',
                cancelBtnText: '#333333'
            };
        }
    }

    /**
     * HTML 转义函数
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function setZIndex(zIndex) {
        currentZIndex = zIndex || currentZIndex;
    }

    // 导出 API
    window.msgbox = {
        showAlert,
        showConfirm,
        showPrompt,
        setTheme,
        setZIndex,
        setLang,
        getLang: () => currentLang
    };
})();