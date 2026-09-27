// Navigating from an open modal to any other page (e.g. "Start cooking",
// a header link) must close it: every other URL matches this catch-all,
// so the slot renders nothing there.
export default function ModalCatchAll() {
  return null;
}
