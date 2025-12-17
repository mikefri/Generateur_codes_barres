document.addEventListener('DOMContentLoaded', () => {

    // --- MISE À JOUR DE L'OBJET REFS ---
    const refs = {
        excelInput: document.getElementById('excelInput'),
        dropZone: document.getElementById('dropZone'),
        importStatus: document.getElementById('importStatus'),
        importCount: document.getElementById('importCount'),
        clearBtn: document.getElementById('clearDataBtn'),
        downloadBtn: document.getElementById('downloadBtn'),

        gridContainer: document.getElementById('gridContainer'),
        pageSheet: document.getElementById('pageSheet'),
        sheetLayer: document.getElementById('sheetLayer'),
        zoomSlider: document.getElementById('zoomSlider'),
        zoomValue: document.getElementById('zoomValue'),

        // NOUVEAU: Références pour la saisie manuelle
        manualContainer: document.getElementById('manualInputContainer'),
        addCodeBtn: document.getElementById('addCodeInputBtn'),

        // Inputs Config
        codeType: document.getElementById('codeType'),
        marginTop: document.getElementById('marginTop'),
        marginLeft: document.getElementById('marginLeft'),
        nbCols: document.getElementById('nbCols'),
        nbRows: document.getElementById('nbRows'),
        rowHeight: document.getElementById('rowHeight'),
        codeScale: document.getElementById('codeScale'),

        // RÉFÉRENCES
        gridPresetSelect: document.getElementById('gridPresetSelect'),
        arrowOption: document.getElementById('arrowOption'),

        // RÉFÉRENCES MODALE
        helpModal: document.getElementById('helpModal'),
        helpButton: document.getElementById('helpButton'), 
        closeModalBtn: document.getElementById('closeModalBtn')
    };

    let appData = []; // Stockage des codes

    // --- DÉFINITION DES PRESETS DE GRILLE (INCHANGÉ) ---
    const gridPresets = [
        { name: "Planche de 24 70x36", marginTop: 3.5, marginLeft: 0, nbCols: 3, nbRows: 8, rowHeight: 36 },
        { name: "Planche de 4 210x74", marginTop: 0, marginLeft: 0, nbCols: 1, nbRows: 4, rowHeight: 74 }
    ];

    // --- LOGIQUE DE SAISIE MANUELLE ---

    // CORRECTIF TEMPS RÉEL : On ne filtre pas les vides ici pour que le rendu réagisse tout de suite
    function syncManualInputs() {
        const inputs = document.querySelectorAll('.manual-code-input');
        appData = Array.from(inputs).map(input => input.value.trim());
        renderBarcodes();
    }

    function createInputRow(value = "") {
        const row = document.createElement('div');
        row.className = 'input-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'manual-code-input';
        input.value = value;
        input.placeholder = "Entrez un code...";
        
        // On écoute l'événement 'input' pour le temps réel
        input.addEventListener('input', syncManualInputs);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-code-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => {
            row.remove();
            syncManualInputs();
        };

        row.appendChild(input);
        row.appendChild(removeBtn);
        refs.manualContainer.appendChild(row);
    }

    if (refs.addCodeBtn) {
        refs.addCodeBtn.addEventListener('click', () => createInputRow());
    }

    // --- GESTION DU ZOOM ---
    refs.zoomSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        refs.sheetLayer.style.transform = `scale(${scale})`;
        refs.zoomValue.textContent = `${Math.round(scale * 100)}%`;
    });

    // --- MISE A JOUR CSS ---
    function updateSheetCSS(sheetElement) {
        const style = sheetElement.style;
        style.setProperty('--mt', refs.marginTop.value + 'mm');
        style.setProperty('--ml', refs.marginLeft.value + 'mm');
        style.setProperty('--cols', refs.nbCols.value);
        style.setProperty('--rows', refs.nbRows.value);
        style.setProperty('--lh', refs.rowHeight.value + 'mm');
    }

    function updateGridCSS() {
        updateSheetCSS(refs.pageSheet);
    }

    [refs.marginTop, refs.marginLeft, refs.nbCols, refs.nbRows, refs.rowHeight, refs.codeScale, refs.codeType, refs.arrowOption]
        .forEach(el => el.addEventListener('input', () => {
            if (el !== refs.arrowOption && el !== refs.codeType) {
                refs.gridPresetSelect.value = "";
            }
            updateGridCSS();
            renderBarcodes();
        }));

    // --- PRESETS ---
    function populatePresets() {
        gridPresets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            refs.gridPresetSelect.appendChild(option);
        });
    }

    refs.gridPresetSelect.addEventListener('change', (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex === "" || selectedIndex === null) return;
        const preset = gridPresets[selectedIndex];
        refs.marginTop.value = preset.marginTop;
        refs.marginLeft.value = preset.marginLeft;
        refs.nbCols.value = preset.nbCols;
        refs.nbRows.value = preset.nbRows;
        refs.rowHeight.value = preset.rowHeight;
        updateGridCSS();
        renderBarcodes();
    });

    // --- FLÈCHES ---
    function createArrowSVG(fullOption) {
        if (fullOption === 'none' || !fullOption.startsWith('line-')) return null;
        const [style, dir] = fullOption.split('-');
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "10mm"); svg.setAttribute("height", "20mm");
        svg.setAttribute("viewBox", "0 0 100 200");
        svg.style.marginRight = "5px"; svg.style.flexShrink = "0";
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill", "none"); path.setAttribute("stroke", "#000");
        path.setAttribute("stroke-width", "20"); path.setAttribute("stroke-linecap", "round");
        let d = (dir === 'up') ? "M 50,180 L 50,20 M 25,50 L 50,20 L 75,50" : "M 50,20 L 50,180 M 25,150 L 50,180 L 75,150";
        path.setAttribute("d", d);
        svg.appendChild(path);
        return svg;
    }

    // --- RENDU DES CODES ---
    function renderBarcodes() {
        const sheetsToRemove = refs.sheetLayer.querySelectorAll('.sheet:not(#pageSheet)');
        sheetsToRemove.forEach(sheet => sheet.remove());

        const scale = parseFloat(refs.codeScale.value);
        const cols = parseInt(refs.nbCols.value);
        const rows = parseInt(refs.nbRows.value);
        const labelsPerPage = cols * rows;

        // On filtre les données vides uniquement pour l'affichage final
        let dataToUse = appData.filter(v => v !== "");
        if (dataToUse.length === 0) dataToUse = ["EXEMPLE"];

        const isDemo = appData.filter(v => v !== "").length === 0;
        const totalPages = Math.ceil(dataToUse.length / labelsPerPage);
        const fragment = document.createDocumentFragment();

        for (let p = 0; p < totalPages; p++) {
            const pageData = dataToUse.slice(p * labelsPerPage, (p + 1) * labelsPerPage);
            let currentSheet, pageGridContainer;

            if (p === 0) {
                currentSheet = refs.pageSheet;
                currentSheet.innerHTML = '';
            } else {
                currentSheet = document.createElement('div');
                currentSheet.className = 'sheet';
                updateSheetCSS(currentSheet);
            }

            pageGridContainer = document.createElement('div');
            pageGridContainer.className = 'grid-container';
            currentSheet.appendChild(pageGridContainer);
            if (p === 0) refs.gridContainer = pageGridContainer;

            pageData.forEach(code => createCell(code, scale, pageGridContainer, isDemo));
            if (p > 0) fragment.appendChild(currentSheet);
        }
        refs.sheetLayer.appendChild(fragment);
    }

    function createCell(text, scale, containerElement, isDemo = false) {
        const cell = document.createElement('div');
        cell.className = 'barcode-cell';
        if (isDemo) cell.style.opacity = "0.3";

        const arrowSVG = createArrowSVG(refs.arrowOption.value);
        if (arrowSVG) cell.appendChild(arrowSVG);

        try {
            const type = refs.codeType.value;
            if (type === 'QRCODE') {
                const canvas = document.createElement('canvas');
                cell.appendChild(canvas);
                containerElement.appendChild(cell); // Important : ajouter au DOM avant QRCode
                QRCode.toCanvas(canvas, String(text), { margin: 0, width: 100 * scale });
            } else {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                cell.appendChild(svg);
                JsBarcode(svg, String(text), {
                    format: type, width: 2 * scale, height: 50 * scale, displayValue: true, margin: 5
                });
                containerElement.appendChild(cell);
            }
        } catch (e) {
            cell.innerHTML = `<span style="color:red;font-size:0.7rem;">Invalide</span>`;
            containerElement.appendChild(cell);
        }
    }

    // --- IMPORT EXCEL ---
    refs.excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            appData = json.map(r => r[0]).filter(c => c !== undefined && c !== "");
            refs.manualContainer.innerHTML = '';
            appData.forEach(val => createInputRow(val));
            renderBarcodes();
        };
        reader.readAsBinaryString(file);
    });

    refs.clearBtn.addEventListener('click', () => {
        appData = [];
        refs.manualContainer.innerHTML = '';
        createInputRow();
        renderBarcodes();
    });

    // --- DOWNLOAD PDF ---
    refs.downloadBtn.addEventListener('click', async () => {
        refs.downloadBtn.textContent = 'Génération...';
        const originalTransform = refs.sheetLayer.style.transform;
        refs.sheetLayer.style.transform = "scale(1)";
        const sheets = refs.sheetLayer.querySelectorAll('.sheet');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        for (let i = 0; i < sheets.length; i++) {
            if (i > 0) pdf.addPage();
            const canvas = await html2canvas(sheets[i], { scale: 2 });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
        }
        pdf.save('planche.pdf');
        refs.sheetLayer.style.transform = originalTransform;
        refs.downloadBtn.textContent = 'Télécharger';
    });

    // --- INIT ---
    populatePresets();
    updateGridCSS();
    createInputRow();
    renderBarcodes();
});
