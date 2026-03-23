(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];

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
    updateButtons(theme);

    if (dispatch) {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
  };

  applyTheme(readStoredTheme() || currentTheme(), { dispatch: false });

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';

      try {
        localStorage.setItem('theme', nextTheme);
      } catch (_) {}

      applyTheme(nextTheme);
    });
  });
})();
