// ⚠️ OVERWRITE THIS WITH YOUR RANDOMLY GENERATED ROOT NGROK LINK FROM COLAB EVERYTIME YOU BOOT THE SERVER
const API_BASE_URL = "https://disperser-removable-conical.ngrok-free.dev";

let currentImageURL = null;

// Dynamic real-time slider value synchronizer matrix
const sliders = ['style-scale', 'strength', 'steps'];
sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => {
            document.getElementById(`${id}-val`).innerText = el.value;
        });
    }
});

// Cache reference hooks to DOM nodes
const outImg = document.getElementById('output-image');
const compareImg = document.getElementById('comparison-image');
const downloadBtn = document.getElementById('download-btn');
const loader = document.getElementById('loader');
const placeholder = document.getElementById('placeholder-text');
const compareLabels = document.getElementById('comparison-labels');

/**
 * Handles DOM layout mutation toggles during backend processing runs
 */
function setProcessingState(activeButton, loadingText) {
    activeButton.disabled = true;
    activeButton.innerText = loadingText;
    compareImg.style.display = "none";
    compareLabels.style.display = "none";
    outImg.style.display = "none";
    placeholder.style.display = "none";
    downloadBtn.style.display = "none";
    loader.style.display = "block";
}

// --- 1. SINGLE IMAGE GENERATION EXECUTION INTERFACE ---
document.getElementById('submit-btn').addEventListener('click', async () => {
    const contentFile = document.getElementById('content-input').files[0];
    const styleFile = document.getElementById('style-input').files[0];

    if (!contentFile || !styleFile) {
        alert("Missing dependencies: Select both content and design references.");
        return;
    }

    const btn = document.getElementById('submit-btn');
    setProcessingState(btn, "🎨 Materializing Matrix...");

    const formData = new FormData();
    formData.append("content_file", contentFile);
    formData.append("style_file", styleFile);
    formData.append("style_scale", document.getElementById('style-scale').value);
    formData.append("strength", document.getElementById('strength').value);
    formData.append("steps", document.getElementById('steps').value);

    try {
        const response = await fetch(`${API_BASE_URL}/stylize`, { 
            method: "POST", 
            body: formData 
        });
        if (!response.ok) throw new Error("Server communication fault.");

        const imageBlob = await response.blob();
        if(currentImageURL) URL.revokeObjectURL(currentImageURL);
        currentImageURL = URL.createObjectURL(imageBlob);

        outImg.src = currentImageURL;
        outImg.style.display = "block";
        downloadBtn.style.display = "flex";
    } catch (error) {
        console.error(error);
        alert("Runtime crash on AI Node server. Confirm your Ngrok address link is active.");
        placeholder.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "🚀 Generate Masterpiece";
        loader.style.display = "none";
    }
});

// --- 2. MODEL COMPARISON GRID EXECUTION INTERFACE ---
document.getElementById('compare-btn').addEventListener('click', async () => {
    const contentFile = document.getElementById('content-input').files[0];
    const styleFile = document.getElementById('style-input').files[0];

    if (!contentFile || !styleFile) {
        alert("Missing dependencies: Both configurations must be bound.");
        return;
    }

    const btn = document.getElementById('compare-btn');
    setProcessingState(btn, "⚔️ Initiating Model Cross-Analysis...");

    const formData = new FormData();
    formData.append("content_file", contentFile);
    formData.append("style_file", styleFile);
    formData.append("style_scale", document.getElementById('style-scale').value);
    formData.append("strength", document.getElementById('strength').value);
    formData.append("steps", document.getElementById('steps').value);

    try {
        const response = await fetch(`${API_BASE_URL}/compare`, { 
            method: "POST", 
            body: formData 
        });
        if (!response.ok) throw new Error("Comparison engine error.");

        const imageBlob = await response.blob();
        if(currentImageURL) URL.revokeObjectURL(currentImageURL);
        currentImageURL = URL.createObjectURL(imageBlob);

        compareImg.src = currentImageURL;
        compareImg.style.display = "block";
        compareLabels.style.display = "flex";
        downloadBtn.style.display = "flex";
    } catch (error) {
        console.error(error);
        alert("Analysis matrix execution failure.");
        placeholder.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "⚔️ Compare Two AI Models";
        loader.style.display = "none";
    }
});

// --- 3. LOCAL FILE DOWNLOAD EXPORT PIPELINE ---
downloadBtn.addEventListener('click', () => {
    if (!currentImageURL) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = currentImageURL;
    downloadLink.download = compareImg.style.display === "block" ? "ai_model_comparison.png" : "ai_masterpiece.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});