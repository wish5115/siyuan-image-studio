/* popup.js - 一个可拖拽、可定制、支持亮暗主题、无遮罩层的弹窗库 */
// version 1.1.6
(() => {
	class Popup {
		/**
		 * @param {Object} options
		 * @param {string} [options.className='popup'] 主类名，如 'popup'
		 * @param {'light'|'dark'} [options.theme='light'] 主题
		 * @param {Object|number} [options.edgePadding=16]
		 *  - number: 四边统一内边距，限制弹窗离视窗边界的最小距离
		 *  - object: { top, right, bottom, left }
		 * @param {string|Node|Function} [options.content=''] 自定义内容：字符串、DOM 节点、或返回节点的函数
		 * @param {boolean} [options.center=true] 初始是否居中显示
		 * @param {number} [options.width] 初始宽度（px）
		 * @param {number} [options.height] 初始高度（px）
		 * @param {string} [options.title=''] 标题
		 * @param {boolean} [options.draggable=true] 是否可拖拽
		 * @param {boolean} [options.showMaximizeRestoreButton=false] 是否显示最大化/还原按钮
		 * @param {boolean} [options.electronCompatible=false] 是否启用 Electron 兼容模式
         * @param {Function} [options.onOpenCallback] 打开弹窗时的回调函数
         * @param {Function} [options.onMaxCallback] 最大化时的回调函数
         * @param {Function} [options.onRestoreCallback] 还原时的回调函数
		 */
		constructor(options = {}) {
			this.opts = Object.assign(
				{
					className: 'popup',
					theme: 'light',
					edgePadding: 16,
					content: '',
					center: true,
					width: undefined,
					height: undefined,
					title: '',
					draggable: true,
					showMaximizeRestoreButton: false,
					electronCompatible: false,
                    onOpenCallback: null,
                    onMaxCallback: null,
                    onRestoreCallback: null,
				},
				options
			);

			this._detectPlatform();
			this._normalizePadding();
			this._createDom();
			this._applyInitialSize();
			this._mount();
			this._bind();
			if (this.opts.center) this.center();
			this.isMaxed = false;
			this.dialogPosition = {};

			// 添加全屏状态监听
			if (this.opts.electronCompatible) {
				this._listenFullscreen();
			}
		}

		_detectPlatform() {
			// 检测操作系统平台
			if (this.opts.electronCompatible) {
				const ua = navigator.userAgent;
				const platform = navigator.platform;
				this.isMac = /Mac|iPhone|iPod|iPad/i.test(platform) || /Mac/i.test(ua);
				this.isWindows = /Win/i.test(platform) || /Windows/i.test(ua);
			} else {
				this.isMac = false;
				this.isWindows = false;
			}
		}

		_normalizePadding() {
			const ep = this.opts.edgePadding;
			if (typeof ep === 'number') {
				this.padding = { top: ep, right: ep, bottom: ep, left: ep };
			} else {
				this.padding = {
					top: ep.top ?? 16,
					right: ep.right ?? 16,
					bottom: ep.bottom ?? 16,
					left: ep.left ?? 16,
				};
			}
		}

		_createDom() {
			const cls = this.opts.className;
			// 容器
			this.el = document.createElement('div');
			this.el.className = `${cls} ${cls}-${this.opts.theme === 'dark' ? 'dark' : 'light'}`;
			this.el.setAttribute('role', 'dialog');
			this.el.setAttribute('aria-modal', 'false');
			this.el.style.position = 'fixed';
			this.el.style.inset = 'auto'; // 清空默认
			this.el.style.zIndex = this.opts?.zIndex || 9999;

			// 样式注入（仅首次按类名注入一次）
			const STYLE_MARK = `__${cls}_style__`;
			if (!document[STYLE_MARK]) {
				const style = document.createElement('style');
				style.textContent = this._buildStyle(cls);
				document.head.appendChild(style);
				document[STYLE_MARK] = true;
			}

			// 头部
			this.header = document.createElement('div');
			this.header.className = `${cls}__header`;

			this.headerTitle = document.createElement('div');
			this.headerTitle.className = `${cls}__title`;
			this.headerTitle.textContent = this.opts.title || '';

			// 按钮容器
			this.headerButtons = document.createElement('div');
			this.headerButtons.className = `${cls}__buttons`;

			// 最大化/还原按钮
			if (this.opts.showMaximizeRestoreButton) {
				this.maxRestoreBtn = document.createElement('button');
				this.maxRestoreBtn.className = `${cls}__maximize`;
				this.maxRestoreBtn.setAttribute('aria-label', 'Maximize');
				this.maxRestoreBtn.innerHTML = '□';
				this.maxRestoreBtn.style.display = 'none'; // 初始隐藏
				this.headerButtons.appendChild(this.maxRestoreBtn);
			}

			// 关闭按钮
			this.closeBtn = document.createElement('button');
			this.closeBtn.className = `${cls}__close`;
			this.closeBtn.setAttribute('aria-label', 'Close');
			this.closeBtn.innerHTML = '&times;';
			this.headerButtons.appendChild(this.closeBtn);

			this.header.appendChild(this.headerTitle);
			this.header.appendChild(this.headerButtons);

			// 内容
			this.body = document.createElement('div');
			this.body.className = `${cls}__body`;
			this.setContent(this.opts.content);

			this.el.appendChild(this.header);
			this.el.appendChild(this.body);
		}

		_buildStyle(cls) {
			// 使用 CSS 变量以便用户覆盖
			return `
.${cls} {
	box-sizing: border-box;
	min-width: 240px;
	border-radius: 12px;
	box-shadow: 0 8px 28px rgba(0,0,0,0.2);
	overflow: hidden;
	border: 1px solid var(--${cls}-border, rgba(0,0,0,0.1));
	background: var(--${cls}-bg, #fff);
	color: var(--${cls}-fg, #1f2328);
}
.${cls}-dark {
	--${cls}-bg: #0d1117;
	--${cls}-fg: #e6edf3;
	--${cls}-muted: #9da7b3;
	--${cls}-border: rgba(255,255,255,0.12);
	--${cls}-close-hover-bg: rgba(255,255,255,0.12);
}
.${cls}-light {
	--${cls}-bg: #ffffff;
	--${cls}-fg: #1f2328;
	--${cls}-muted: #6e7781;
	--${cls}-border: rgba(0,0,0,0.12);
	--${cls}-close-hover-bg: rgba(127,127,127,0.12);
}
.${cls}__header {
	cursor: move;
	user-select: none;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${this.opts.headerPadding??'6px 10px'};
	background: transparent;
	border-bottom: 1px solid var(--${cls}-border, rgba(0,0,0,0.08));
	${this.opts.headerStyle || ''};
}
.${cls}__header--maximized {
	cursor: default;
}
.${cls}__header--electron-mac .${cls}__title {
	margin-left: 70px;
}
.${cls}__header--electron-win .${cls}__buttons {
	margin-right: 140px;
}
.${cls}__title {
	font-size: 14px;
	font-weight: 600;
	color: var(--${cls}-fg);
	flex: 1;
	/*transition: margin-left 0.2s ease;*/
	overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.${cls}__buttons {
	display: flex;
	align-items: center;
	gap: 4px;
	/*transition: margin-right 0.2s ease;*/
}
.${cls}__close,
.${cls}__maximize {
	all: unset;
	cursor: pointer;
	font-size: 20px;
	line-height: 1;
	padding: 2px 6px;
	border-radius: 8px;
	color: var(--${cls}-muted);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 28px;
	height: 28px;
}
.${cls}__close {
    padding-bottom: 5px; /* 微调位置，把它“顶”上去 */
}
.${cls}__maximize {
	font-size: 16px;
}
.${cls}__close:hover,
.${cls}__maximize:hover {
	background: var(--${cls}-close-hover-bg);
}
.${cls}__body {
	padding: ${this.opts.bodyPadding??'10px'};
	overflow: auto;
	${this.opts.bodyStyle || ''};
}
.${cls}__body_content {
	${this.opts.bodyContentStyle || ''};
}
.${cls} * { box-sizing: border-box; }
			`;
		}

		_applyInitialSize() {
			if (this.opts.width) this.el.style.width = /^-?\d+(\.\d+)?$/.test(this.opts.width) ? this.opts.width + 'px' : this.opts.width;
			if (this.opts.height) this.el.style.height = /^-?\d+(\.\d+)?$/.test(this.opts.height) ? this.opts.height + 'px' : this.opts.height;
		}

		_mount() {
			document.body.appendChild(this.el);
			this._ensureWithinBounds();
		}

		_bind() {
			// 使用 pointerup 避免被 pointerdown 阻止
			this._onCloseClick = (e) => {
				e.stopPropagation();
				e.preventDefault();
				this.close();
			};
			this.closeBtn.addEventListener('pointerup', this._onCloseClick);

			if (this.opts.showMaximizeRestoreButton && this.maxRestoreBtn) {
				this._onMaxRestoreClick = (e) => {
					e.stopPropagation();
					e.preventDefault();
					this._toggleMaximize();
				};
				this.maxRestoreBtn.addEventListener('pointerup', this._onMaxRestoreClick);
			}

			if (this.opts.draggable) {
				this._onPointerDown = this._startDrag.bind(this);
				this.header.addEventListener('pointerdown', this._onPointerDown);
			}

			this._onResize = () => {
				if (this.dialogPosition.isMaxed) {
					this._applyMaximize();
				} else {
					this._ensureWithinBounds();
				}
			};
			window.addEventListener('resize', this._onResize);

			this._listenMaximize();
		}

		_toggleMaximize() {
			if (this.dialogPosition.isMaxed) {
				this._restoreWindow();
			} else {
				this._maximizeWindow();
			}
		}

		_maximizeWindow() {
			const dialog = this.el;
			const cls = this.opts.className;
			// 保存当前位置和尺寸
			const rect = getComputedStyle(dialog);
			this.dialogPosition = {
				top: dialog.style.top || rect.top,
				left: dialog.style.left || rect.left,
				width: dialog.style.width || rect.width,
				height: dialog.style.height || rect.height,
				maxHeight: dialog.style.maxHeight || rect.maxHeight,
				borderRadius: dialog.style.borderRadius || rect.borderRadius,
				isMaxed: true
			};
			this._applyMaximize();
			this._updateMaxRestoreButton(true);
			
			// 最大化时应用 Electron 兼容样式（如果不是全屏）
			if (this.opts.electronCompatible) {
				const isReallyFull = this._isReallyFullscreen();
				this._updateElectronCompatibleStyles(!isReallyFull);
			}

			// 添加最大化样式类
			this.header.classList.add(`${cls}__header--maximized`);
			this.opts.onMaximize?.();

            if (typeof this.opts.onMaxCallback === 'function') {
                this.opts.onMaxCallback.call(this);
            }
		}

		_restoreWindow() {
			const dialog = this.el;
			const cls = this.opts.className;
			// 还原
			dialog.style.top = this.dialogPosition.top;
			dialog.style.left = this.dialogPosition.left;
			dialog.style.width = this.dialogPosition.width;
			dialog.style.height = this.dialogPosition.height;
			dialog.style.maxHeight = this.dialogPosition.maxHeight;
			dialog.style.borderRadius = this.dialogPosition.borderRadius;
			this.dialogPosition = {};
			this._updateMaxRestoreButton(false);
			
			// 还原时移除 Electron 兼容样式
			if (this.opts.electronCompatible) {
				this._updateElectronCompatibleStyles(false);
			}
			
			// 移除最大化样式类
			this.header.classList.remove(`${cls}__header--maximized`);
			this.opts.onMaximizeRestore?.();

            if (typeof this.opts.onRestoreCallback === 'function') {
                this.opts.onRestoreCallback.call(this);
            }
		}

		_updateMaxRestoreButton(isMaxed) {
			if (this.opts.showMaximizeRestoreButton && this.maxRestoreBtn) {
				if (isMaxed) {
					this.maxRestoreBtn.innerHTML = '❐'; // 还原图标
					this.maxRestoreBtn.setAttribute('aria-label', 'Restore');
					this.maxRestoreBtn.setAttribute('title', 'Restore');
					this.maxRestoreBtn.style.display = 'inline-flex';
				} else {
					this.maxRestoreBtn.innerHTML = '□'; // 最大化图标
					this.maxRestoreBtn.setAttribute('aria-label', 'Maximize');
					this.maxRestoreBtn.setAttribute('title', 'Maximize');
					this.maxRestoreBtn.style.display = 'none';
				}
			}
		}

		_applyMaximize() {
			const maxPadding = this.opts.maximizeEdgePadding || {};
			const top = maxPadding.top ?? this.padding.top;
			const right = maxPadding.right ?? this.padding.right;
			const bottom = maxPadding.bottom ?? this.padding.bottom;
			const left = maxPadding.left ?? this.padding.left;

			const width = `calc(100% - ${left + right}px)`;
			const height = `calc(100vh - ${top + bottom}px)`;

			this.el.style.top = top + 'px';
			this.el.style.left = left + 'px';
			this.el.style.width = width;
			this.el.style.height = height;
			this.el.style.maxHeight = height;
			this.el.style.borderRadius = '0';
		}

		_listenMaximize() {
			let lastTapTime = 0;

			this._onMaximize = (e) => {
				// 排除按钮区域
				if (e.target === this.closeBtn || this.closeBtn.contains(e.target)) return;
				if (this.maxRestoreBtn && (e.target === this.maxRestoreBtn || this.maxRestoreBtn.contains(e.target))) return;
				if (e.target === this.headerButtons || this.headerButtons.contains(e.target)) return;

				const currentTime = Date.now();
				const tapLength = currentTime - lastTapTime;

				if (tapLength < 300 && tapLength > 0) {
					e.preventDefault();
					if (this.dialogPosition.isMaxed) {
						this._restoreWindow();
					} else {
						this._maximizeWindow();
					}
					lastTapTime = 0;
				} else {
					lastTapTime = currentTime;
				}
			};

			this.header.addEventListener('pointerup', this._onMaximize);
		}

		setContent(content) {
			// 清空
			this.body.innerHTML = '';
			let node = null;
			if (typeof content === 'function') {
				node = content();
			} else if (content instanceof Node) {
				node = content;
			} else if (typeof content === 'string') {
				const div = document.createElement('div');
				const cls = this.opts.className;
				div.className = `${cls}__body_content`;
				div.innerHTML = content;
				node = div;
			}
			if (node) this.body.appendChild(node);
		}

		setTitle(title = '') {
			this.headerTitle.textContent = title;
		}

		open(options = {}) {
			if(options.zIndex){
				this.setZIndex(options.zIndex);
			}
			this.el.style.display = 'block';
			this._ensureWithinBounds();

            if (typeof this.opts.onOpenCallback === 'function') {
                this.opts.onOpenCallback.call(this);
            }
		}

		async close() {
			if(typeof this.opts.canClose === 'function') {
				if(!(await this.opts.canClose())) return;
			}
			// 如果处于最大化状态，先还原
			if (this.dialogPosition.isMaxed) {
				this._restoreWindow();
			}
			this.el.style.display = 'none';
			if(typeof this.opts.onClose === 'function') {
				this.opts.onClose.call(this);
			}
		}

		destroy() {
			if(typeof this.opts.canDestroy === 'function') {
				if(!this.opts.canDestroy()) return;
			}
			
			window.removeEventListener('resize', this._onResize);
			this.closeBtn.removeEventListener('pointerup', this._onCloseClick);
			this.header.removeEventListener('pointerup', this._onMaximize);
			
			if (this.opts.electronCompatible && this._cleanUpFullscreenListener) {
				this._cleanUpFullscreenListener();
			}
			
			if (this.opts.showMaximizeRestoreButton && this.maxRestoreBtn) {
				this.maxRestoreBtn.removeEventListener('pointerup', this._onMaxRestoreClick);
			}
			if (this.opts.draggable) {
				this.header.removeEventListener('pointerdown', this._onPointerDown);
				document.removeEventListener('pointermove', this._onPointerMove);
				document.removeEventListener('pointerup', this._onPointerUp);
				document.removeEventListener('pointercancel', this._onPointerUp);
			}
			this.el.remove();
		}

		center() {
			const rect = this.el.getBoundingClientRect();
			const vw = document.documentElement.clientWidth;
			const vh = document.documentElement.clientHeight;
			const left = Math.max(this.padding.left, Math.round((vw - rect.width) / 2));
			const top = Math.max(this.padding.top, Math.round((vh - rect.height) / 2));
			this._setPos(left, top);
			this._ensureWithinBounds();
		}

		setTheme(theme) {
			const cls = this.opts.className;
			this.el.classList.remove(`${cls}-light`, `${cls}-dark`);
			this.el.classList.add(`${cls}-${theme === 'dark' ? 'dark' : 'light'}`);
		}

		getTheme() {
			return this.el.classList.contains(this.opts.className + '-dark') ? 'dark' : 'light';
		}

		setEdgePadding(padding) {
			this.opts.edgePadding = padding;
			this._normalizePadding();
			this._ensureWithinBounds();
		}

		setZIndex(zIndex) {
			this.el.style.zIndex = zIndex;
		}

		getEl() {
			return this.el;
		}

		/* ========== 拖拽相关 ========== */
		_startDrag(e) {
			if (this.dialogPosition.isMaxed) return;

			// 严格排除按钮和按钮容器
			if (e.target === this.closeBtn || this.closeBtn.contains(e.target)) return;
			if (this.maxRestoreBtn && (e.target === this.maxRestoreBtn || this.maxRestoreBtn.contains(e.target))) return;
			if (e.target === this.headerButtons || this.headerButtons.contains(e.target)) return;

			if (e.button !== 0 && e.button !== -1) return;

			this.dragStartX = e.clientX;
			this.dragStartY = e.clientY;
			this.dragPending = true;

			const rect = this.el.getBoundingClientRect();
			this.dragOffsetX = e.clientX - rect.left;
			this.dragOffsetY = e.clientY - rect.top;

			this._onPointerMove = this._dragMove.bind(this);
			this._onPointerUp = this._endDrag.bind(this);
			document.addEventListener('pointermove', this._onPointerMove, { passive: false });
			document.addEventListener('pointerup', this._onPointerUp);
			document.addEventListener('pointercancel', this._onPointerUp);
		}

		_dragMove(e) {
			if (this.dragPending) {
				const dx = Math.abs(e.clientX - this.dragStartX);
				const dy = Math.abs(e.clientY - this.dragStartY);
				if (dx > 5 || dy > 5) {
					e.preventDefault();
					this.dragging = true;
					this.dragPending = false;
					this.el.setPointerCapture?.(e.pointerId);
				} else {
					return;
				}
			}
			if (!this.dragging) return;
			const vw = document.documentElement.clientWidth;
			const vh = document.documentElement.clientHeight;
			const rect = this.el.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;
			// 期望位置
			let left = e.clientX - this.dragOffsetX;
			let top = e.clientY - this.dragOffsetY;
			// 计算边界（-1 表示不限制）
			const minLeft = this.padding.left === -1 ? -Infinity : this.padding.left;
			const maxLeft = this.padding.right === -1 ? Infinity : (vw - w - this.padding.right);
			const minTop = this.padding.top === -1 ? -Infinity : this.padding.top;
			const maxTop = this.padding.bottom === -1 ? Infinity : (vh - h - this.padding.bottom);
			// 限制在可拖动范围内
			if (minLeft !== -Infinity || maxLeft !== Infinity) {
				left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));
			}
			if (minTop !== -Infinity || maxTop !== Infinity) {
				top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));
			}
			this._setPos(left, top);
		}

		_endDrag(e) {
			this.dragging = false;
			this.dragPending = false;
			this.el.releasePointerCapture?.(e.pointerId);
			document.removeEventListener('pointermove', this._onPointerMove);
			document.removeEventListener('pointerup', this._onPointerUp);
			document.removeEventListener('pointercancel', this._onPointerUp);
		}

		_setPos(left, top) {
			this.el.style.left = left + 'px';
			this.el.style.top = top + 'px';
		}

		_ensureWithinBounds() {
			// 确保弹窗在可视范围内（考虑 edgePadding，-1 表示不限制）
			const vw = document.documentElement.clientWidth;
			const vh = document.documentElement.clientHeight;
			const rect = this.el.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;
			let left = rect.left;
			let top = rect.top;
			// 只在未设置为 -1 时才限制边界
			if (this.padding.left !== -1 || this.padding.right !== -1) {
				const minLeft = this.padding.left === -1 ? -Infinity : this.padding.left;
				const maxLeft = this.padding.right === -1 ? Infinity : Math.max(minLeft === -Infinity ? 0 : minLeft, vw - w - this.padding.right);
				
				if (minLeft !== -Infinity && left < minLeft) left = minLeft;
				if (maxLeft !== Infinity && left > maxLeft) left = maxLeft;
			}
			if (this.padding.top !== -1 || this.padding.bottom !== -1) {
				const minTop = this.padding.top === -1 ? -Infinity : this.padding.top;
				const maxTop = this.padding.bottom === -1 ? Infinity : Math.max(minTop === -Infinity ? 0 : minTop, vh - h - this.padding.bottom);
				
				if (minTop !== -Infinity && top < minTop) top = minTop;
				if (maxTop !== Infinity && top > maxTop) top = maxTop;
			}
			this._setPos(left, top);
		}

		// 改进：准确检测全屏状态（包括 macOS 原生全屏）
		// 改进：准确检测全屏状态（包括 macOS 原生全屏）
		_isReallyFullscreen() {
			// 1. API 全屏 (保留标准检测)
			if (
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement
			) {
				return true;
			}
			
			// 2. macOS 原生全屏检测 (修正判断逻辑)
			// 在 macOS 原生全屏模式下 (点击绿色按钮)，窗口通常占据整个物理屏幕。
			// 即使 innerHeight 没达到 screen.height，但 innerWidth 应该几乎达到 screen.width。
			// 
			// **关键修正：** 如果 innerWidth 达到物理屏幕宽度，并且 innerHeight 达到了物理屏幕高度
			// 或者 **可用高度 (availHeight) 等于物理高度 (height)**，这表明系统 UI (菜单栏/Dock) 消失了，即进入了全屏。
			
			const isWidthFull = Math.abs(window.innerWidth - window.screen.width) < 5;
			//const isAvailHeightFull = Math.abs(window.screen.availHeight - window.screen.height) < 5;
			return isWidthFull;

			//if (this.isMac) {
				// 在 Mac 上，判断是否物理宽度全屏 并且 系统可用高度是否等于物理高度
				// 这能有效检测绿色按钮触发的原生全屏，因为原生全屏会收起菜单栏
				//return isWidthFull && isAvailHeightFull;
			//}
			
			// 3. 其他平台/兜底尺寸检测
			// 如果 Mac 逻辑不满足，但宽高都接近物理屏幕，则视为全屏。
			// const isHeightFull = Math.abs(window.innerHeight - window.screen.height) < 5;
			// return isWidthFull && isHeightFull;
		}

		// 更新：监听全屏/窗口尺寸变化
		_listenFullscreen() {
			const updateState = () => {
				// 只有当弹窗处于最大化状态时，我们才关心是否要显示 Electron 的“红绿灯”留白
				if (!this.dialogPosition.isMaxed) return;

				const isFullscreen = this._isReallyFullscreen();
				const shouldApplyElectronStyle = !isFullscreen;

				// 应用样式
				this._updateElectronCompatibleStyles(shouldApplyElectronStyle);
			};

			// 1. 监听标准 API 事件
			const apiEvents = [
				'fullscreenchange', 
				'webkitfullscreenchange', 
				'mozfullscreenchange', 
				'MSFullscreenChange'
			];
			apiEvents.forEach(evt => document.addEventListener(evt, updateState));

			// 2. 监听 Resize (涵盖 macOS 原生全屏动画结束)
			// 使用 ResizeObserver 监听 html/body 尺寸变化
			this._windowResizeObserver = new ResizeObserver(() => {
				if (this._resizeTimeout) cancelAnimationFrame(this._resizeTimeout);
				this._resizeTimeout = requestAnimationFrame(() => {
					updateState();
					this._resizeTimeout = null;
				});
			});
			this._windowResizeObserver.observe(document.documentElement);

			// 保存清理函数供 destroy 调用
			this._cleanUpFullscreenListener = () => {
				apiEvents.forEach(evt => document.removeEventListener(evt, updateState));
				if (this._windowResizeObserver) {
					this._windowResizeObserver.disconnect();
					this._windowResizeObserver = null;
				}
				if (this._resizeTimeout) cancelAnimationFrame(this._resizeTimeout);
			};
		}

		// 更新 Electron 兼容样式
		_updateElectronCompatibleStyles(apply) {
			const cls = this.opts.className;
			
			if (apply) {
				// 应用 Electron 兼容样式
				if (this.isMac) {
					this.header.classList.add(`${cls}__header--electron-mac`);
				} else if (this.isWindows) {
					this.header.classList.add(`${cls}__header--electron-win`);
				}
			} else {
				// 移除 Electron 兼容样式
				this.header.classList.remove(`${cls}__header--electron-mac`);
				this.header.classList.remove(`${cls}__header--electron-win`);
			}
		}
	}

	// 暴露全局
	window.Popup = Popup;
})();