let alignments = [];

function handleTEILoad(fileInputId, containerId) {
  const input = document.getElementById(fileInputId);
  input.addEventListener("change", () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(reader.result, "text/xml");
      const paragraphs = Array.from(xml.getElementsByTagName("p"));
      const text = paragraphs.map(p => p.textContent.trim()).join("\n\n");
      document.getElementById(containerId).textContent = text;
    };
    reader.readAsText(file);
  });
}

handleTEILoad("sourceFile", "sourceText");
handleTEILoad("targetFile", "targetText");

function getSelectedText(containerId) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';
  const range = selection.getRangeAt(0);
  const container = document.getElementById(containerId);
  if (!container.contains(range.commonAncestorContainer)) return '';
  return selection.toString().trim();
}

function highlightText(containerId, text, id) {
  const container = document.getElementById(containerId);
  const html = container.innerHTML;
  const safeText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safeText, 'g');
  container.innerHTML = html.replace(
    regex,
    `<mark data-align-id="${id}">${text}</mark>`
  );
}

document.getElementById("createLinkBtn").addEventListener("click", () => {
  const sourceText = getSelectedText("sourceText");
  const targetText = getSelectedText("targetText");
  const category = document.getElementById("categorySelect").value;

  if (!sourceText || !targetText) {
    alert("Seleziona testo in entrambe le colonne.");
    return;
  }

  const alignmentId = `aln${alignments.length + 1}`;
  alignments.push({ id: alignmentId, source: sourceText, target: targetText, category });

  highlightText("sourceText", sourceText, alignmentId + "-src");
  highlightText("targetText", targetText, alignmentId + "-trg");

  window.getSelection().removeAllRanges();
});

document.getElementById("autoAlignBtn").addEventListener("click", () => {
  alert("Allineamento automatico non ancora disponibile.");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  let xml = `<linkGrp type="manual-alignment">\n`;
  alignments.forEach(a => {
    xml += `  <link xml:id="${a.id}" ana="#${a.category}" targets="#${a.id}-src #${a.id}-trg"/>\n`;
  });
  xml += `</linkGrp>`;
  document.getElementById("output").textContent = xml;
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const content = document.getElementById("output").textContent;
  const blob = new Blob([content], { type: 'text/xml' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "allineamento.xml";
  a.click();
});

// Tokenizzazione semplice su punto
document.getElementById("tokenizeBtn").addEventListener("click", () => {
  ["sourceText", "targetText"].forEach(id => {
    const box = document.getElementById(id);
    const sentences = box.textContent.split(/(?<=[.!?])\s+/);
    box.innerHTML = sentences.map(s => `<p>${s.trim()}</p>`).join('');
  });
});
