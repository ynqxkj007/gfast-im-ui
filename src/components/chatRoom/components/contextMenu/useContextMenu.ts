import { onMounted, onUnmounted, ref } from "vue";

export default function (containerRef: { value: any; }) {
    const showMenu = ref(false);
    const x = ref(0);
    const y = ref(0);
    const monitor: { [key: string]: any } = {}
    const handleContextMenu = (e:any) => {
        if (monitor.showMenu) {
            monitor.showMenu()
        }
        e.preventDefault();
        e.stopPropagation();
        showMenu.value = true;
        x.value = e.clientX;
        y.value = e.clientY;
    };
    function closeMenu() {
        showMenu.value = false;
    }
    onMounted(() => {
        const div = containerRef.value;
        if (div) {
            div.addEventListener("contextmenu", handleContextMenu);
            window.addEventListener("click", closeMenu, true);
            window.addEventListener("contextmenu", closeMenu, true);
        }

    });
    onUnmounted(() => {
        const div = containerRef.value;
        if (div) {
            div.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("click", closeMenu, true);
            window.removeEventListener("contextmenu", closeMenu, true);
        }

    });
    return {
        showMenu,
        monitor,
        x,
        y,
    };
}