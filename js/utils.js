export function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}


export function show_loading(msg) {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("loading-msg").textContent = msg || "Loading...";
}
export function hide_loading() {
    document.getElementById("loading").style.display = "none";
}
