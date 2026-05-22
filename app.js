// ⚠️ OVERWRITE THIS WITH YOUR RANDOMLY GENERATED ROOT NGROK LINK FROM COLAB EVERYTIME YOU BOOT THE SERVER
const API_BASE_URL = "https://disperser-removable-conical.ngrok-free.dev";

let currentImageURL = null;

// Dynamic real-time slider synchronizer
const sliders = ['style-scale', 'strength', 'steps'];
sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { document.getElementById(`${id}-val`).innerText = el.value; });
});

const outImg = document.getElementById('output-image');
const compareImg = document.getElementById('comparison-image');
const downloadBtn = document.getElementById('download-btn');
const loader = document.getElementById('loader');
const placeholder = document.getElementById('placeholder-text');
const compareLabels = document.getElementById('comparison-labels');
const historyGrid = document.getElementById('history-grid');

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

/**
 * FEATURE 1 ENGINE: Pushes generated image blobs safely into our visual history matrix wall
 */
function addToHistoryLog(imageBlob, metadataText) {
    const objectURL = URL.createObjectURL(imageBlob);
    
    const card = document.createElement('div');
    card.className = 'gallery-card';
    
    const img = document.createElement('img');
    img.src = objectURL;
    
    const label = document.createElement('span');
    label.innerText = metadataText;
    
    card.appendChild(img);
    card.appendChild(label);
    
    // Clicking history element restores preview instantly
    card.addEventListener('click', () => {
        compareImg.style.display = "none";
        compareLabels.style.display = "none";
        placeholder.style.display = "none";
        
        if (metadataText.includes("COMPARE")) {
            compareImg.src = objectURL;
            compareImg.style.display = "block";
            compareLabels.style.display = "flex";
        } else {
            outImg.src = objectURL;
            outImg.style.display = "block";
        }
        
        if(currentImageURL && !currentImageURL.startsWith('blob:http')) {
            // Keep track of current main download reference safely
        }
        downloadBtn.style.display = "flex";
    });
    
    historyGrid.insertBefore(card, historyGrid.firstChild);
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
    formData.append("model_choice", document.getElementById('model-choice').value);
    
    // INTEGRATION OF FEATURES 3 & 4 ATTRIBUTES INTO FORMDATA PAYLOAD
    formData.append("structure_lock", document.getElementById('structure-lock').value);
    formData.append("hd_upscale", document.getElementById('hd-upscale').checked ? "true" : "false");
    
    formData.append("style_scale", document.getElementById('style-scale').value);
    formData.append("strength", document.getElementById('strength').value);
    formData.append("steps", document.getElementById('steps').value);

    try {
        const response = await fetch(`${API_BASE_URL}/stylize`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Server communication fault.");

        const imageBlob = await response.blob();
        if(currentImageURL) URL.revokeObjectURL(currentImageURL);
        currentImageURL = URL.createObjectURL(imageBlob);

        outImg.src = currentImageURL;
        outImg.style.display = "block";
        downloadBtn.style.display = "flex";
        
        // Push generated element to live session gallery history log
        const labelName = `${document.getElementById('model-choice').value} (${document.getElementById('structure-lock').value})`;
        addToHistoryLog(imageBlob, labelName);
        
    } catch (error) {
        console.error(error);
        alert("Runtime crash on AI Node server. Confirm your Ngrok link configuration.");
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
    
    // COMPARISON STAGE INHERITS THE STRUCTURAL EXTRACTION & RESOLUTION SETTINGS AS WELL
    formData.append("structure_lock", document.getElementById('structure-lock').value);
    formData.append("hd_upscale", document.getElementById('hd-upscale').checked ? "true" : "false");
    
    formData.append("style_scale", document.getElementById('style-scale').value);
    formData.append("strength", document.getElementById('strength').value);
    formData.append("steps", document.getElementById('steps').value);

    try {
        const response = await fetch(`${API_BASE_URL}/compare`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Comparison engine error.");

        const imageBlob = await response.blob();
        if(currentImageURL) URL.revokeObjectURL(currentImageURL);
        currentImageURL = URL.createObjectURL(imageBlob);

        compareImg.src = currentImageURL;
        compareImg.style.display = "block";
        compareLabels.style.display = "flex";
        downloadBtn.style.display = "flex";
        
        addToHistoryLog(imageBlob, "⚔️ COMPARE MATRIX");
        
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