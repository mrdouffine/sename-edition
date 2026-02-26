import type { OrderItem } from "@/models/Order";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} EUR`;
}

function dateFr(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(value);
}

function paymentMethodLabel(method: "paypal" | "mobile_money") {
  if (method === "paypal") return "PayPal";
  return "Mobile Money";
}

type TextOptions = {
  x: number;
  y: number;
  size?: number;
  font?: "F1" | "F2";
  color?: [number, number, number];
};

function drawText(text: string, options: TextOptions) {
  const safe = escapePdfText(text);
  const font = options.font ?? "F1";
  const size = options.size ?? 11;
  const [r, g, b] = options.color ?? [0, 0, 0];
  return `BT /${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${options.x} ${options.y} Tm (${safe}) Tj ET`;
}

function drawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: [number, number, number];
    stroke?: [number, number, number];
    lineWidth?: number;
  } = {}
) {
  const parts: string[] = [];
  if (options.fill) {
    const [r, g, b] = options.fill;
    parts.push(`${r} ${g} ${b} rg`);
  }
  if (options.stroke) {
    const [r, g, b] = options.stroke;
    parts.push(`${r} ${g} ${b} RG`);
  }
  if (options.lineWidth) {
    parts.push(`${options.lineWidth} w`);
  }
  parts.push(`${x} ${y} ${width} ${height} re`);
  if (options.fill && options.stroke) {
    parts.push("B");
  } else if (options.fill) {
    parts.push("f");
  } else {
    parts.push("S");
  }
  return parts.join("\n");
}

function buildInvoicePdf(contentCommands: string[]) {
  const content = contentCommands.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj"
  );
  objects.push(
    `4 0 obj << /Length ${Buffer.byteLength(content, "utf8")} >> stream\n${content}\nendstream endobj`
  );
  objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push("6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj");

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += `${obj}\n`;
  }

  const xrefStart = Buffer.byteLength(body, "utf8");
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body, "utf8");
}

export function generateInvoicePdf(params: {
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  saleType: "direct" | "preorder";
  paymentMethod: "paypal" | "mobile_money";
  paymentReference?: string;
  total: number;
  createdAt: Date;
  items: Array<
    OrderItem & {
      title?: string;
    }
  >;
}) {
  const commands: string[] = [];
  const paymentMethod = paymentMethodLabel(params.paymentMethod);
  const paymentLine =
    params.paymentMethod === "paypal"
      ? "PayPal (Paiement securise)"
      : "Mobile Money";

  // Page card
  commands.push(drawRect(35, 70, 525, 700, { fill: [0.98, 0.98, 0.98], stroke: [0.88, 0.88, 0.9], lineWidth: 1 }));

  // Header
  commands.push(drawRect(50, 730, 18, 18, { fill: [0.08, 0.08, 0.08] }));
  commands.push(drawText("BOOK", { x: 51.5, y: 737, size: 6, font: "F2", color: [0.98, 0.89, 0] }));
  commands.push(drawText("SENAME EDITION'S", { x: 76, y: 736, size: 16, font: "F2", color: [0.09, 0.09, 0.09] }));
  commands.push(drawText("LIBRAIRIE DIGITALE", { x: 76, y: 722, size: 9, font: "F1", color: [0.42, 0.46, 0.53] }));

  commands.push(drawRect(467, 735, 78, 22, { fill: [0.98, 0.89, 0] }));
  commands.push(drawText("PAYEE", { x: 487, y: 742, size: 10, font: "F2", color: [0.09, 0.09, 0.09] }));
  commands.push(drawText(`FACTURE: ${params.invoiceNumber}`, { x: 420, y: 718, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));
  commands.push(drawText(`DATE: ${dateFr(params.createdAt)}`, { x: 420, y: 704, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));

  commands.push(drawRect(50, 690, 495, 1, { fill: [0.88, 0.9, 0.93] }));

  // Emetteur and client summary (without address/SIRET)
  commands.push(drawText("EMETTEUR", { x: 55, y: 655, size: 9, font: "F2", color: [0.52, 0.56, 0.63] }));
  commands.push(drawText("SENAME EDITION'S", { x: 55, y: 636, size: 15, font: "F2", color: [0.12, 0.14, 0.18] }));
  commands.push(drawText("info@artforintrovert.com", { x: 55, y: 618, size: 11, font: "F1", color: [0.33, 0.36, 0.42] }));

  commands.push(drawText("FACTURE A", { x: 455, y: 655, size: 9, font: "F2", color: [0.52, 0.56, 0.63] }));
  commands.push(drawText(params.customerName || "Client", { x: 430, y: 636, size: 15, font: "F2", color: [0.12, 0.14, 0.18] }));
  commands.push(drawText(params.customerEmail || "-", { x: 430, y: 618, size: 11, font: "F1", color: [0.33, 0.36, 0.42] }));

  // Table header
  commands.push(drawRect(55, 565, 485, 28, { fill: [0.93, 0.94, 0.96], stroke: [0.87, 0.89, 0.93], lineWidth: 1 }));
  commands.push(drawText("LIVRE", { x: 65, y: 574, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));
  commands.push(drawText("QTE", { x: 350, y: 574, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));
  commands.push(drawText("PRIX UNITAIRE", { x: 395, y: 574, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));
  commands.push(drawText("TOTAL", { x: 500, y: 574, size: 9, font: "F2", color: [0.42, 0.46, 0.53] }));

  let rowY = 535;
  const displayItems = params.items.slice(0, 8);
  for (const item of displayItems) {
    const title = item.title ?? "Ouvrage";
    const lineTotal = item.quantity * item.unitPrice;
    commands.push(drawRect(55, rowY, 485, 30, { fill: [1, 1, 1], stroke: [0.9, 0.92, 0.95], lineWidth: 1 }));
    commands.push(drawText(title.slice(0, 46), { x: 65, y: rowY + 10, size: 11, font: "F2", color: [0.12, 0.14, 0.18] }));
    commands.push(drawText(String(item.quantity), { x: 355, y: rowY + 10, size: 11, color: [0.12, 0.14, 0.18] }));
    commands.push(drawText(money(item.unitPrice), { x: 400, y: rowY + 10, size: 11, color: [0.12, 0.14, 0.18] }));
    commands.push(drawText(money(lineTotal), { x: 500, y: rowY + 10, size: 11, font: "F2", color: [0.12, 0.14, 0.18] }));
    rowY -= 32;
  }

  if (params.items.length > displayItems.length) {
    commands.push(
      drawText(`+ ${params.items.length - displayItems.length} autre(s) ouvrage(s)`, {
        x: 65,
        y: rowY + 12,
        size: 10,
        color: [0.42, 0.46, 0.53]
      })
    );
  }

  // Payment note + method
  commands.push(drawText("NOTE DE PAIEMENT", { x: 55, y: 250, size: 9, font: "F2", color: [0.52, 0.56, 0.63] }));
  commands.push(
    drawText("\"Merci pour votre confiance. Votre achat soutient les auteurs independants et la promotion de la lecture.\"", {
      x: 55,
      y: 232,
      size: 9,
      color: [0.45, 0.49, 0.56]
    })
  );
  commands.push(drawRect(55, 180, 250, 48, { fill: [0.94, 0.95, 0.97] }));
  commands.push(drawText("METHODE DE PAIEMENT", { x: 65, y: 208, size: 8, font: "F2", color: [0.52, 0.56, 0.63] }));
  commands.push(drawText(paymentLine, { x: 65, y: 193, size: 10, font: "F2", color: [0.12, 0.14, 0.18] }));
  if (params.paymentReference) {
    commands.push(
      drawText(`Ref: ${String(params.paymentReference).slice(0, 28)}`, {
        x: 65,
        y: 182,
        size: 8,
        color: [0.42, 0.46, 0.53]
      })
    );
  } else {
    commands.push(
      drawText(`Provider: ${paymentMethod}`, {
        x: 65,
        y: 182,
        size: 8,
        color: [0.42, 0.46, 0.53]
      })
    );
  }

  // Total only (no HT/TVA)
  commands.push(drawText("TOTAL", { x: 425, y: 248, size: 11, font: "F2", color: [0.42, 0.46, 0.53] }));
  commands.push(drawRect(395, 190, 145, 44, { fill: [0.98, 0.89, 0] }));
  commands.push(drawText("TOTAL", { x: 405, y: 208, size: 10, font: "F2", color: [0.09, 0.09, 0.09] }));
  commands.push(drawText(money(params.total), { x: 480, y: 206, size: 17, font: "F2", color: [0.09, 0.09, 0.09] }));

  commands.push(drawRect(50, 150, 495, 1, { fill: [0.88, 0.9, 0.93] }));
  commands.push(
    drawText("SENAME EDITION'S - DOCUMENT COMMERCIAL", {
      x: 352,
      y: 134,
      size: 8,
      font: "F2",
      color: [0.52, 0.56, 0.63]
    })
  );

  return buildInvoicePdf(commands);
}
