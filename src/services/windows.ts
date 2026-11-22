import { ref } from "vue";

// About shares the main native window with the request workspace.
const aboutOpen = ref(false);

function openAboutWindow() {
  aboutOpen.value = true;
}

export { aboutOpen, openAboutWindow };
