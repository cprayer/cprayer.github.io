(function() {
	function toggleDarkMode() {
		for (var i = 0; i < document.styleSheets.length; i++) {
			for (var j = 0; j < document.styleSheets[i].rules.length; j++) {
				var rule = document.styleSheets[i].rules[j].media;
				if (!rule || !rule.mediaText.includes("prefers-color-scheme")) continue;
				if (rule.mediaText.includes("light")) {
					rule.deleteMedium("(prefers-color-scheme: light)");
					rule.appendMedium("(prefers-color-scheme: dark)");
				} else {
					rule.deleteMedium("(prefers-color-scheme: dark)");
					rule.appendMedium("(prefers-color-scheme: light)");
				}
			}
		}
	}
	function clickDarkMode()
	{
		toggleDarkMode();
		var key = 'theme-inverted';
		if (localStorage.getItem(key)) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, "1");
		}
	}
	document.addEventListener('DOMContentLoaded', function() {
		var toggle = document.querySelector('.theme-toggle');
		if (!toggle) return;
		toggle.style.display = 'block';
		toggle.addEventListener('click', clickDarkMode);
	});
	if (localStorage.getItem('theme-inverted')) {
		toggleDarkMode();
	}
	addEventListener('storage', function(e) {
		if (e.key !== 'theme-inverted') return;
		toggleDarkMode();
	});
})();

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.protocol === 'file:') return;
	var modal = document.getElementById('codeview');
	if (!modal) return;
	var abortController;
	function closeModal() {
		modal.style.display = 'none';
		if (abortController) {
			abortController.abort();
		}
	}
	modal.addEventListener('click', (e) => {
		if (e.target !== modal && !e.target.classList.contains('close')) return;
		if (modal.style.display !== 'block') return;
		history.back();
	});
	document.addEventListener('keydown', (e) => {
		if (e.keyCode !== 27) return;
		if (modal.style.display !== 'block') return;
		history.back();
	});
	document.addEventListener('click', (e) => {
		var a = e.target.closest('a');
		if (!a || !a.classList.contains('source')) return;
		var src = a.href;
		var lang = a.dataset.lang;
		history.pushState({src, lang}, '');
		showModal(src, lang);
		e.preventDefault();
	});

	function showModal(src, lang) {
		lang = {
			pascal:"delphi",
			pypy:"python",
			pypy3:"python",
			py3:"python"
		}[lang] || lang;
		var ext = src.split('.').pop();
		var code = modal.querySelector('code');
		code.className = '';
		if (abortController) {
			abortController.abort();
		}
		code.innerText = 'loading...';
		modal.style.display = 'block';
		if (ext === 'zip') {
			code.innerHTML = "<a href='" + src + "'>Download ZIP archive</a>";
			return;
		}
		abortController = new AbortController();
		fetch(src, {signal: abortController.signal}).then((response) => {
			if (!response.ok) {
				throw new Error('got response code ' + response.status);
			}
			return response.text();
		}).then((text) => {
			code.className = "language-" + lang;
			code.textContent = text;
			if (window.hljs) {
				hljs.highlightElement(code);
			}
		}).catch((error) => {
			if (error.name === "AbortError") return;
			code.innerText = 'Download error: ' + error.message;
		});
	}
	addEventListener("popstate", (e) => {
		if (!e.state || !e.state.src) {
			closeModal();
			return;
		}
		if (e.state.src) {
			showModal(e.state.src, e.state.lang);
		}
	});
});

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.protocol === 'file:') return;
	var input = document.getElementById('username');
	if (!input) return;
	var initialState = input.value;
	var abortController;
	var timeout;
	input.addEventListener('keydown', (e) => {
		if (e.keyCode !== 13) return;
		clearTimeout(timeout);
		onchange();
	});
	input.addEventListener('input', (e) => {
		clearTimeout(timeout);
		timeout = setTimeout(onchange, 500);
	});
	function onchange() {
		var username = input.value;
		var url = input.dataset.src + username;
		history.pushState({username}, '', url);
		reload();
	}
	function reload() {
		if (abortController) {
			abortController.abort();
		}
		input.classList.remove('error');
		input.classList.add('loading');
		var src = input.dataset.src + input.value;
		abortController = new AbortController();
		fetch(src, {signal: abortController.signal}).then((response) => {
			if (!response.ok) {
				throw new Error('got response code ' + response.status);
			}
			return response.text();
		}).then((text) => {
			var parser = new DOMParser();
			var doc = parser.parseFromString(text, 'text/html');
			var content = doc.querySelector('.content');
			if (!content) {
				throw new Error('no suitable content');
			}
			document.querySelector('.content').replaceWith(content);
			document.title = input.value + ' | GCJ Archive';
			input.classList.remove('loading');
		}).catch((error) => {
			if (error.name === "AbortError") return;
			input.classList.remove('loading');
			input.classList.add('error');
		});
		
	}
	addEventListener("popstate", (e) => {
		if (!e.state) {
			if (input.value === initialState) return;
			input.value = initialState;
			reload();
			return;
		}
		if (e.state.username) {
			if (input.value === e.state.username) return;
			input.value = e.state.username;
			reload();
		}
	});
});
