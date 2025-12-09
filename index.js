const { Plugin, Setting, Dialog } = require("siyuan");

const STORAGE_NAME = "config.json";

const defaultConfig = {
    shortcut: "ctrl+shift+e",
    backup: false,
    isCompression: true,
    vipKey: "",
    isVip: false,
};

// true 调试 false 生产
const isDebug = false;
// 当前版本
const version = '0.0.5';

module.exports = class SiYuanImageStudioPlugin extends Plugin {
    async onload() {
        this.isMobile = !!document.getElementById("sidebar");
        await this.initSettings();
        await this.loadImageStudio();
        ImageStudio.create({
            shortcut: this.data[STORAGE_NAME].shortcut,
            backup: this.data[STORAGE_NAME].backup,
            vipKey: this.data[STORAGE_NAME].vipKey,
            isVip: this.data[STORAGE_NAME].isVip,
            isCompression: this.data[STORAGE_NAME].isCompression,
            i18n: this.i18n,
            isDebug: isDebug,
        });
    }
    onLayoutReady() {
        
    }

    onunload() {
        if(typeof ImageStudio === 'undefined') return;
        ImageStudio.destroy();
        document.querySelectorAll(`script[data-plugin="${this.name}"]`).forEach(s => s.remove());
    }

    async uninstall() {
        // 删除配置文件
        await this.removeData(STORAGE_NAME);
    }
    loadImageStudio(src) {
        src = src || `/plugins/${this.name}/libs/siyuan-image-studio${isDebug ? '-origin' : ''}.js?v=${version}`;
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.dataset.plugin = this.name;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initSettings() {
        this.data[STORAGE_NAME] = await this.loadData(STORAGE_NAME) || defaultConfig;
        this.setting = new Setting({
            confirmCallback: async () => {
                const shortcutInput = this.setting.dialog.element.querySelector("input[name=shortcut]");
                if (shortcutInput) {
                    this.data[STORAGE_NAME].shortcut = shortcutInput?.value?.trim();
                }
                const backupInput = this.setting.dialog.element.querySelector("input[name=backup]");
                if (backupInput) {
                    this.data[STORAGE_NAME].backup = backupInput.checked;
                }
                const isCompressionInput = this.setting.dialog.element.querySelector("input[name=isCompression]");
                if (isCompressionInput) {
                    this.data[STORAGE_NAME].isCompression = isCompressionInput.checked;
                }
                const vipKeyInput = this.setting.dialog.element.querySelector("input[name=vipKey]");
                if (vipKeyInput) {
                    this.data[STORAGE_NAME].vipKey = vipKeyInput?.value?.trim();
                }
                this.data[STORAGE_NAME].isVip = await ImageStudio.updateData(this.data[STORAGE_NAME]);
                await this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
            }
        });
        this.setting.addItem({
                title: this.t('Shortcut'),
                direction: "row",
                description: this.t("Set the shortcut to open Image Studio"),
                createActionElement: () => {
                    const shortcut = document.createElement("input");
                    shortcut.type = "text";
                    shortcut.name = "shortcut";
                    shortcut.className = "b3-text-field fn__block";
                    shortcut.placeholder = this.t("Enter shortcut");
                    shortcut.value = this.data[STORAGE_NAME].shortcut || "";
                    return shortcut;
                },
        });
        this.setting.addItem({
                title: this.t("Backup"),
                direction: "row",
                description: this.t("Backup your image to the cloud"),
                createActionElement: () => {
                    const backupContainer = document.createElement("div");
                    const backup = document.createElement("input");
                    backup.type = "checkbox";
                    backup.name = "backup";
                    backup.className = "b3-switch fn__block";
                    backup.title = this.t("If enabled, your images will be backed up to the local file system.");
                    backup.checked = this.data[STORAGE_NAME].backup || false;
                    backupContainer.appendChild(backup);
                    return backupContainer;
                }
        });
        this.setting.addItem({
                title: this.t("Images Compression"),
                direction: "row",
                description: this.t("Enable image compression"),
                createActionElement: () => {
                    const isCompressionContainer = document.createElement("div");
                    const isCompression = document.createElement("input");
                    isCompression.type = "checkbox";
                    isCompression.name = "isCompression";
                    isCompression.className = "b3-switch fn__block";
                    isCompression.title = this.t("If enabled, your images will be compressed.");
                    isCompression.checked = this.data[STORAGE_NAME].isCompression || false;
                    isCompressionContainer.appendChild(isCompression);
                    return isCompressionContainer;
                }
        });
        this.setting.addItem({
                title: this.t("VIP Key"),
                direction: "row",
                description: this.t("Enter your vip key to get more features"),
                createActionElement: () => {
                    const vipKeyContainer = document.createElement("div");
                    const vipKey = document.createElement("input");
                    vipKey.type = "text";
                    vipKey.name = "vipKey";
                    vipKey.className = "b3-text-field fn__block";
                    vipKey.placeholder = this.t("Enter vip key");
                    vipKey.value = this.data[STORAGE_NAME].vipKey || "";
                    vipKeyContainer.appendChild(vipKey);
                    // 验证按钮
                    const vipKeyVerifyButton = document.createElement("button");
                    vipKeyVerifyButton.type = "button";
                    vipKeyVerifyButton.className = "b3-button b3-button--secondary";
                    vipKeyVerifyButton.style.marginTop = "10px";
                    vipKeyVerifyButton.innerHTML = this.t("Verify Key");
                    vipKeyVerifyButton.addEventListener("click", async () => {
                        const verification = await this.verifyVipKey(vipKey.value.trim());
                        if (!verification?.success) {
                            if(showAlert) showAlert(verification.message || this.t("VIP key verification failed!"));
                            // this.data[STORAGE_NAME].isVip = false;
                            // await this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
                            // ImageStudio.updateData(this.data[STORAGE_NAME]);
                            return;
                        }
                        // this.data[STORAGE_NAME].vipKey = vipKey.value.trim();
                        // this.data[STORAGE_NAME].isVip = true;
                        // await this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
                        if(showAlert) showAlert(this.t("VIP key verified successfully!"));
                    });
                    vipKeyContainer.appendChild(vipKeyVerifyButton);
                    // 购买按钮
                    const vipKeyButton = document.createElement("button");
                    vipKeyButton.type = "button";
                    vipKeyButton.className = "b3-button b3-button--primary";
                    vipKeyButton.style.marginTop = "10px";
                    vipKeyButton.style.marginLeft = "10px";
                    vipKeyButton.style.backgroundColor = "var(--b3-theme-error)";
                    vipKeyButton.innerHTML = this.t("Buy Now");
                    vipKeyButton.addEventListener("click", () => {
                        this.showDialog();
                    });
                    vipKeyContainer.appendChild(vipKeyButton);
                    return vipKeyContainer;
                }
        });
    }

    async verifyVipKey(vipKey) {
        if (vipKey.trim() === "") {
            return {message: this.t("VIP key cannot be empty"), success: false};
        }
        const isVip = await ImageStudio.verifyKey(vipKey);
        if (!isVip) {
            return {message: this.t("VIP key verification failed!"), success: false};
        }
        return {message: this.t("VIP key verified successfully!"), success: true};
    }

    updateConfig(key, data) {
        this.data[STORAGE_NAME][key] = data;
        this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
    }

    showDialog() {
        const dialog = new Dialog({
            title: this.t('Upgrade VIP'),
            content: `<div class="b3-dialog__content" style="padding: 10px;">
<style>
            .vip-popup-content {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                color: #ffffff;
                padding: 15px;
                border-radius: 16px;
                max-width: min(600px, 100%);
                margin: 0 auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .vip-popup-content .vip-badge {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #1a1a1a;
                padding: 12px 24px;
                border-radius: 25px;
                text-align: center;
                font-weight: bold;
                margin-bottom: 25px;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                font-size: 16px;
                ${this.data[STORAGE_NAME].isVip ? '' : 'display: none;'}
            }

            .vip-popup-content .section-title {
                color: #ffd700;
                font-size: 20px;
                margin: 15px 0 15px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                border-bottom: 2px solid rgba(255, 215, 0, 0.3);
                padding-bottom: 10px;
            }

            .vip-popup-content .title-icon {
                font-size: 24px;
            }

            .vip-popup-content .features-list {
                list-style: none;
                padding: 0;
                margin: 20px 0;
            }

            .vip-popup-content .features-list li {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px 20px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 3px solid #4CAF50;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
            }

            .vip-popup-content .features-list li:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(5px);
            }

            .vip-popup-content .check-icon {
                font-size: 18px;
            }

            .vip-popup-content .badge-soon {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 12px;
                margin-left: 8px;
                font-weight: 500;
            }

            .vip-popup-content .steps-list {
                counter-reset: step-counter;
                list-style: none;
                padding: 0;
                margin: 20px 0;
            }

            .vip-popup-content .steps-list > li {
                counter-increment: step-counter;
                margin: 20px 0;
                position: relative;
                padding-left: 50px;
            }

            .vip-popup-content .steps-list > li::before {
                content: counter(step-counter);
                position: absolute;
                left: 0;
                top: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
            }

            .vip-popup-content .step-content {
                background: rgba(255, 255, 255, 0.03);
                padding: 20px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            .vip-popup-content .step-content > p {
                margin: 0 0 15px 0;
                color: #e0e0e0;
            }

            .vip-popup-content .qrcode {
                text-align: center;
                padding: 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                margin-top: 15px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }

            .vip-popup-content .qrcode img {
                border-radius: 8px;
            }

            .vip-popup-content .contact-list {
                list-style: none;
                padding: 0;
                margin: 15px 0 0 0;
            }

            .vip-popup-content .contact-list li {
                padding: 10px 15px;
                margin: 8px 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: background 0.3s ease;
            }

            .vip-popup-content .contact-list li:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .vip-popup-content .contact-icon {
                font-size: 18px;
                min-width: 24px;
            }

            .vip-popup-content .contact-list a {
                color: #64b5f6;
                text-decoration: none;
                transition: color 0.3s ease;
            }

            .vip-popup-content .contact-list a:hover {
                color: #90caf9;
                text-decoration: underline;
            }

            .vip-popup-content .qq-code {
                background: rgba(255, 215, 0, 0.2);
                color: #ffd700;
                padding: 3px 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                border: 1px solid rgba(255, 215, 0, 0.3);
            }

            .vip-popup-content .response-note {
                background: rgba(102, 126, 234, 0.1);
                border-left: 3px solid #667eea;
                padding: 12px 15px !important;
                margin-top: 12px !important;
                font-size: 14px;
                color: #b0b0b0;
                line-height: 1.6;
            }

            /* 滚动条美化 */
            .vip-popup-content::-webkit-scrollbar {
                width: 8px;
            }

            .vip-popup-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }

            .vip-popup-content::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.3);
                border-radius: 4px;
            }

            .vip-popup-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.5);
            }
        </style>
        <div class="vip-popup-content">
            <div class="vip-badge">${this.t('You are already a VIP member, no need to upgrade')} ✨</div>
            <h3 class="section-title">
                <span class="title-icon">🎯</span>
                ${this.t('Upgrade to VIP to unlock more advanced features')}
            </h3>
            <ul class="features-list">
                <li><span class="check-icon">✅</span> ${this.t('Unlimited usage')}</li>
                <li><span class="check-icon">✅</span> ${this.t('Advanced AI image editing')}<span class="badge-soon">${this.t('Coming soon')}</span></li>
                <li><span class="check-icon">✅</span> ${this.t('Batch image processing')}<span class="badge-soon">${this.t('Coming soon')}</span></li>
            </ul>
            <h3 class="section-title">
                <span class="title-icon">💎</span>
                ${this.t('How to upgrade to VIP')}
            </h3>
            <ol class="steps-list">
                <li>
                    <div class="step-content">
                        <p>${this.t('After donation, you can upgrade to VIP. Supported donation methods:')}</p>
                        <div class="qrcode">
                            <div><img src="https://b3logfile.com/file/2025/12/image-ukLI8JA.png?imageView2/2/interlace/1/format/webp" alt="${this.t('WeChat donation QR code')}" /></div>
                            <div style="margin-top: 10px;"><img src="https://b3logfile.com/file/2025/12/image-PyncEHH.png?imageView2/2/interlace/1/format/webp" alt="${this.t('Alipay donation QR code')}" /></div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="step-content">
                        <p>${this.t('After donation, you can contact the author via the following methods:')}</p>
                        <ul class="contact-list">
                            <li>
                                <span class="contact-icon">💬</span>
                                <a href="https://ld246.com/chats/wilsons" target="_blank">${this.t('Leave a message in LianDi Community')}</a>
                            </li>
                            <li>
                                <span class="contact-icon">📧</span>
                                <a href="https://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=MkVbQVoHAwMHclRdSl9TW14cUV1f" target="_blank">${this.t('QQ message')}</a>
                            </li>
                            <li>
                                <span class="contact-icon">👥</span>
                                ${this.t('QQ group')}:<code class="qq-code">283157619</code>${this.t('Contact the group owner')}
                            </li>
                            <li class="response-note">
                                <span class="contact-icon">⏰</span>
                                ${this.t('No matter which way, the author will reply and send the license code as soon as possible, usually within 24 hours.')}
                            </li>
                        </ul>
                    </div>
                </li>
            </ol>
        </div>
</div>`,
            width: this.isMobile ? "92vw" : "560px",
            height: this.isMobile ? "80vh" : "540px",
        });
    }

    t(key) {
        return this.i18n[key] || key;
    }
};