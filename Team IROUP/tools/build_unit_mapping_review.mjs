import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = process.argv[2] || "D:/DATA_MASTER_ Students_Staff/unit_mapping_review_data.json";
const outputPath = process.argv[3] || "D:/DATA_MASTER_ Students_Staff/UP_UNIT_MAPPING_REVIEW_2026-05-22.xlsx";

const data = JSON.parse((await fs.readFile(inputPath, "utf8")).replace(/^\uFEFF/, ""));

const workbook = Workbook.create();

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

function styleHeader(range) {
  range.format = {
    fill: "#1F4E79",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function writeTable(sheet, headers, rows, tableName) {
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
  if (rows.length) {
    sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;
  }
  styleHeader(sheet.getRangeByIndexes(0, 0, 1, headers.length));
  sheet.freezePanes.freezeRows(1);
  const tableRange = sheet.getRangeByIndexes(0, 0, Math.max(rows.length + 1, 2), headers.length);
  const table = sheet.tables.add(tableRange.address, true, tableName);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
}

const summary = workbook.worksheets.add("Summary");
summary.showGridLines = false;
summary.getRange("A1:F1").values = [["UP Unit Mapping Review"]];
summary.mergeCells("A1:F1");
summary.getRange("A1").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF", size: 16 },
};
summary.getRange("A3:B10").values = [
  ["Generated at", data.generated_at],
  ["Privacy note", data.privacy_note],
  ["Student rows", data.student_row_count],
  ["Staff rows", data.staff_row_count],
  ["Unit master rows", data.unit_master_count],
  ["Student distinct units", data.review_rows.filter((r) => r.source_type === "student").length],
  ["Staff distinct units", data.review_rows.filter((r) => r.source_type === "staff").length],
  ["Rows requiring review", data.review_rows.filter((r) => r.match_status === "REVIEW").length],
];
summary.getRange("A3:A10").format = { fill: "#D9EAF7", font: { bold: true } };
summary.getRange("B3:B10").format.wrapText = true;
setWidths(summary, [190, 520, 120, 120, 120, 120]);

const reviewHeaders = [
  "source_type",
  "source_unit_name",
  "source_row_count",
  "match_status",
  "matched_unit_id",
  "matched_unit_name_th",
  "matched_unit_type",
  "matched_active",
  "proposed_action",
  "proposed_unit_id",
  "approved_unit_id",
  "review_note",
];
const reviewRows = data.review_rows.map((r) => reviewHeaders.map((h) => r[h] ?? ""));
const review = workbook.worksheets.add("Mapping Review");
writeTable(review, reviewHeaders, reviewRows, "MappingReview");
setWidths(review, [95, 360, 110, 105, 130, 320, 120, 100, 145, 150, 150, 360]);
review.getRangeByIndexes(1, 8, Math.max(reviewRows.length, 1), 4).format.fill = "#FFF7D6";

const unitHeaders = ["unit_id", "unit_code", "unit_name_th", "unit_name_en", "unit_type", "parent_unit_id", "active"];
const unitRows = data.unit_master.map((r) => unitHeaders.map((h) => r[h] ?? ""));
const units = workbook.worksheets.add("UP_UNIT_MASTER");
writeTable(units, unitHeaders, unitRows, "UnitMaster");
setWidths(units, [130, 100, 330, 360, 120, 140, 90]);

const unmatchedHeaders = reviewHeaders;
const unmatchedRows = data.review_rows
  .filter((r) => r.match_status === "REVIEW")
  .map((r) => unmatchedHeaders.map((h) => r[h] ?? ""));
const unmatched = workbook.worksheets.add("Needs Review");
writeTable(unmatched, unmatchedHeaders, unmatchedRows, "NeedsReview");
setWidths(unmatched, [95, 420, 110, 105, 130, 320, 120, 100, 145, 150, 150, 380]);
unmatched.getRangeByIndexes(1, 8, Math.max(unmatchedRows.length, 1), 4).format.fill = "#FFF7D6";

for (const sheet of [review, unmatched]) {
  const rows = Math.max(sheet.getUsedRange(true).rowCount - 1, 1);
  sheet.getRangeByIndexes(1, 8, rows, 1).dataValidation = {
    rule: { type: "list", values: ["use_existing", "add_active_unit", "add_inactive_unit", "map_to_parent", "exclude_or_hold"] },
  };
  sheet.getRangeByIndexes(1, 10, rows, 1).dataValidation = {
    rule: { type: "list", formula1: "UP_UNIT_MASTER!$A$2:$A$500" },
  };
}

const outputDir = path.dirname(outputPath);
await fs.mkdir(outputDir, { recursive: true });

for (const sheetName of ["Summary", "Mapping Review", "Needs Review", "UP_UNIT_MASTER"]) {
  await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);
