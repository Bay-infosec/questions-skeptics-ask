import { mkdir, writeFile } from "node:fs/promises";
import QRCode from "qrcode";

const url = "https://questions-skeptics-ask.vercel.app";
const outputDir = new URL("../public/qr-kit/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const qrSvg = await QRCode.toString(url, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: 3,
  color: {
    dark: "#173F36",
    light: "#FFFDF8",
  },
});

const qrDataUrl = await QRCode.toDataURL(url, {
  errorCorrectionLevel: "H",
  margin: 3,
  width: 1400,
  color: {
    dark: "#173F36",
    light: "#FFFDF8",
  },
});

const posterHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Questions Skeptics Ask - Participant QR</title>
  <style>
    @page { size: Letter portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 8.5in; height: 11in; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #173f36;
      background: #f7f3eb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .poster {
      position: relative;
      display: flex;
      min-height: 11in;
      flex-direction: column;
      overflow: hidden;
      padding: .58in .65in .5in;
    }
    .poster::before {
      content: "";
      position: absolute;
      top: -.75in;
      right: -.65in;
      width: 2.4in;
      height: 2.4in;
      border-radius: 50%;
      background: #e6b84f;
      opacity: .95;
    }
    .poster::after {
      content: "";
      position: absolute;
      bottom: -.85in;
      left: -.65in;
      width: 2.25in;
      height: 2.25in;
      border-radius: 50%;
      background: #ed6a4f;
    }
    header {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: .15in;
    }
    .mark {
      display: grid;
      width: .55in;
      height: .55in;
      place-items: center;
      border-radius: 50% 50% 50% .15in;
      color: white;
      background: #ed6a4f;
      font-size: 21pt;
      font-weight: 800;
    }
    .brand strong { display: block; font-size: 14pt; }
    .brand span {
      display: block;
      margin-top: 3px;
      color: #687a75;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .eyebrow {
      margin: .56in 0 .12in;
      color: #ed6a4f;
      font-size: 10pt;
      font-weight: 800;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    h1 {
      max-width: 6.9in;
      margin: 0;
      font-size: 39pt;
      line-height: .98;
      letter-spacing: -.045em;
    }
    .subtitle {
      margin: .15in 0 .31in;
      color: #687a75;
      font-size: 13pt;
      line-height: 1.4;
    }
    .qr-panel {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 3.7in 1fr;
      gap: .35in;
      align-items: center;
      padding: .28in;
      border: 1px solid #d9d4ca;
      border-radius: .28in;
      background: #fffdf8;
      box-shadow: 0 .16in .4in rgba(23, 63, 54, .1);
    }
    .qr-wrap {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      padding: .08in;
      border-radius: .18in;
      background: #fffdf8;
    }
    .qr-wrap img { display: block; width: 100%; height: 100%; }
    .steps { display: grid; gap: .18in; }
    .step {
      display: grid;
      grid-template-columns: .33in 1fr;
      gap: .11in;
      align-items: start;
    }
    .number {
      display: grid;
      width: .31in;
      height: .31in;
      place-items: center;
      border-radius: 50%;
      color: white;
      background: #173f36;
      font-size: 10pt;
      font-weight: 800;
    }
    .step strong { display: block; margin-bottom: 2px; font-size: 11pt; }
    .step span { color: #687a75; font-size: 9pt; line-height: 1.35; }
    .privacy {
      position: relative;
      z-index: 1;
      display: flex;
      gap: .12in;
      align-items: center;
      margin-top: .28in;
      padding: .16in .2in;
      border: 1px solid #bed1c3;
      border-radius: .16in;
      background: #dce9df;
      font-size: 10pt;
      font-weight: 700;
    }
    .privacy i {
      display: grid;
      flex: 0 0 auto;
      width: .28in;
      height: .28in;
      place-items: center;
      border: 2px solid #173f36;
      border-radius: 50%;
      font-style: normal;
    }
    footer {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: end;
      margin-top: auto;
      padding-top: .3in;
    }
    .url {
      max-width: 5.6in;
      overflow-wrap: anywhere;
      font-size: 12pt;
      font-weight: 800;
    }
    .tag {
      padding: .08in .13in;
      border-radius: 999px;
      color: white;
      background: #173f36;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: .09em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <main class="poster">
    <header>
      <div class="mark">Q</div>
      <div class="brand">
        <strong>Questions Skeptics Ask</strong>
        <span>About Christianity</span>
      </div>
    </header>

    <p class="eyebrow">Identity · Meaning · Hope</p>
    <h1>Join the conversation.</h1>
    <p class="subtitle">Use this page throughout the workshop for the live poll, honest questions, and your optional next step.</p>

    <section class="qr-panel">
      <div class="qr-wrap">
        <img src="${qrDataUrl}" alt="QR code for the workshop participant page">
      </div>
      <div class="steps">
        <div class="step">
          <span class="number">1</span>
          <div><strong>Open your camera</strong><span>Point it at the QR code.</span></div>
        </div>
        <div class="step">
          <span class="number">2</span>
          <div><strong>Tap the link</strong><span>No app or account required.</span></div>
        </div>
        <div class="step">
          <span class="number">3</span>
          <div><strong>Keep it open</strong><span>We will use the same page throughout the workshop.</span></div>
        </div>
      </div>
    </section>

    <div class="privacy"><i>?</i> Poll responses and questions can be submitted anonymously.</div>

    <footer>
      <div class="url">${url.replace("https://", "")}</div>
      <div class="tag">Scan to begin</div>
    </footer>
  </main>
</body>
</html>`;

await writeFile(new URL("participant-qr.svg", outputDir), qrSvg);
await writeFile(
  new URL("participant-qr.png", outputDir),
  Buffer.from(qrDataUrl.split(",")[1], "base64"),
);
await writeFile(new URL("participant-poster.html", outputDir), posterHtml);

console.log("Generated participant QR kit in public/qr-kit");
