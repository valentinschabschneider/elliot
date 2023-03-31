window.addEventListener('DOMContentLoaded', () => {
  if (!window.chrome) {
    Toastify({
      text: 'To guarantee that this document looks like the author intended, please use a Crominium based browser like Chrome.',
      duration: 10000,
      close: true,
    }).showToast();
  }
});
