chrome.storage.local.get(["tracking"], (data) => {
    let tracking = data.tracking || {};
    let output = document.getElementById("output");
    output.innerHTML = "";

    Object.keys(tracking).forEach(site => {
        let minutes = Math.round(tracking[site] / 60000);
        output.innerHTML += `<p><b>${site}</b>: ${minutes} min</p>`;
    });
});
