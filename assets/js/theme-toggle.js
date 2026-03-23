(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];
  const accentToggle = document.querySelector('[data-link-accent-toggle]');
  const favicon = document.querySelector('[data-site-favicon]');

  const readStoredTheme = () => {
    let storedTheme = null;

    try {
      storedTheme = localStorage.getItem('theme');
    } catch (_) {
      storedTheme = null;
    }

    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  };

  const currentTheme = () => root.dataset.theme === 'light' ? 'light' : 'dark';
  const currentLinkAccent = () => root.dataset.linkAccent === 'brown' ? 'brown' : 'green';

  const updateAccentToggle = accent => {
    if (!accentToggle) return;

    accentToggle.setAttribute(
      'aria-label',
      accent === 'green' ? 'Switch link accent to brown' : 'Switch link accent to green'
    );
  };

  const applyLinkAccent = accent => {
    root.dataset.linkAccent = accent;
    updateAccentToggle(accent);
  };

  const updateFavicon = theme => {
    if (!favicon) return;

    favicon.href = theme === 'light' ? favicon.dataset.faviconLight : favicon.dataset.faviconDark;
  };

  const updateButtons = theme => {
    buttons.forEach(button => {
      const sun = button.querySelector('[data-theme-icon="sun"]');
      const moon = button.querySelector('[data-theme-icon="moon"]');

      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      if (sun) sun.hidden = theme === 'dark';
      if (moon) moon.hidden = theme !== 'dark';
    });
  };

  const applyTheme = (theme, { dispatch = true } = {}) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateFavicon(theme);
    updateButtons(theme);

    if (dispatch) {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
  };

  applyTheme(readStoredTheme() || currentTheme(), { dispatch: false });
  applyLinkAccent(currentLinkAccent());

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';

      try {
        localStorage.setItem('theme', nextTheme);
      } catch (_) {}

      applyTheme(nextTheme);
    });
  });

  if (accentToggle) {
    accentToggle.addEventListener('click', () => {
      const nextAccent = currentLinkAccent() === 'green' ? 'brown' : 'green';

      try {
        localStorage.setItem('linkAccent', nextAccent);
      } catch (_) {}

      applyLinkAccent(nextAccent);
    });
  }
})();
