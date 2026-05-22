param(
  [string]$StudentPath = "D:\DATA_MASTER_ Students_Staff\STUDENT_MASTER _DATA.xls",
  [string]$StaffPath = "D:\DATA_MASTER_ Students_Staff\STAFF_MASTER _DATA.xls",
  [string]$UnitReviewPath = "D:\DATA_MASTER_ Students_Staff\unit_mapping_review_data.json",
  [string]$ApprovedMappingPath = "D:\DATA_MASTER_ Students_Staff\approved_unit_mapping_review.json",
  [string]$OutputDir = "D:\DATA_MASTER_ Students_Staff\staging"
)

$ErrorActionPreference = "Stop"

function Normalize-Text {
  param([object]$Value)
  if ($null -eq $Value) { return "" }
  return ([string]$Value).Trim() -replace "\s+", " "
}

function Read-JsonFile {
  param([string]$Path)
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Build-UnitMap {
  param(
    [object]$UnitReview,
    [object]$ApprovedMapping
  )

  $map = @{}
  foreach ($row in $UnitReview.review_rows) {
    if ($row.match_status -eq "MATCH") {
      $map[$row.source_unit_name] = @{
        action = "use_existing"
        unit_id = $row.matched_unit_id
      }
    }
  }

  foreach ($row in $ApprovedMapping.review_rows) {
    $action = Normalize-Text $row.proposed_action
    $unitId = Normalize-Text $(if ($row.approved_unit_id) { $row.approved_unit_id } else { $row.proposed_unit_id })
    $map[$row.source_unit_name] = @{
      action = $action
      unit_id = $unitId
    }
  }

  return $map
}

function Normalize-Gender {
  param([object]$Value)
  $text = (Normalize-Text $Value).ToLowerInvariant()
  if ($text -in @("m", "male", "ชาย", "นาย")) { return "male" }
  if ($text -in @("f", "female", "หญิง", "นาง", "นางสาว")) { return "female" }
  return $text
}

function Normalize-StaffType {
  param([object]$Value)
  $text = (Normalize-Text $Value).ToLowerInvariant()
  if ($text -match "วิชาการ|academic|อาจารย์|lecturer") { return "academic" }
  if ($text -match "สนับสนุน|support|ปฏิบัติการ|พนักงาน") { return "support" }
  return $text
}

function Get-CellText {
  param(
    [object]$Values,
    [int]$Row,
    [int]$Col
  )
  return Normalize-Text $Values.GetValue($Row, $Col)
}

function Has-DataInRow {
  param(
    [object]$Values,
    [int]$Row,
    [int]$ColumnCount
  )
  for ($c = 1; $c -le $ColumnCount; $c++) {
    if (Get-CellText -Values $Values -Row $Row -Col $c) { return $true }
  }
  return $false
}

function Read-XlsValues {
  param([string]$Path)
  $excel = $null
  $workbook = $null
  try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $workbook = $excel.Workbooks.Open($Path)
    $sheet = $workbook.Worksheets.Item(1)
    $used = $sheet.UsedRange
    return @{
      values = $used.Value2
      rows = $used.Rows.Count
      cols = $used.Columns.Count
    }
  } finally {
    if ($workbook) { $workbook.Close($false) | Out-Null }
    if ($excel) {
      $excel.Quit() | Out-Null
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
  }
}

function Export-CsvUtf8Bom {
  param(
    [array]$Rows,
    [string]$Path
  )
  $Rows | Export-Csv -LiteralPath $Path -NoTypeInformation -Encoding UTF8
}

$unitReview = Read-JsonFile -Path $UnitReviewPath
$approvedMapping = Read-JsonFile -Path $ApprovedMappingPath
$unitMap = Build-UnitMap -UnitReview $unitReview -ApprovedMapping $approvedMapping
$timestamp = (Get-Date).ToString("s")

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$studentHeaders = @(
  "student_id", "prefix_th", "first_name_th", "last_name_th", "full_name_th",
  "prefix_en", "first_name_en", "last_name_en", "full_name_en", "gender",
  "unit_id", "program_th", "degree_level", "student_status", "active",
  "source_system", "updated_at"
)

$staffHeaders = @(
  "staff_id", "prefix_th", "first_name_th", "last_name_th", "full_name_th",
  "first_name_en", "last_name_en", "full_name_en", "gender", "unit_id",
  "position", "staff_type", "active", "source_system", "updated_at"
)

$studentData = Read-XlsValues -Path $StudentPath
$studentRows = @()
$heldRows = @()

for ($r = 1; $r -le $studentData.rows; $r++) {
  if (-not (Has-DataInRow -Values $studentData.values -Row $r -ColumnCount 12)) { continue }
  $unitName = Get-CellText -Values $studentData.values -Row $r -Col 11
  if ($unitName -eq "unit_id") { continue }
  $unit = $unitMap[$unitName]
  if (-not $unit -or $unit.action -eq "exclude_or_hold" -or -not $unit.unit_id) {
    $heldRows += [pscustomobject]@{
      source_type = "student"
      source_row_number = $r
      source_unit_name = $unitName
      reason = $(if ($unit) { $unit.action } else { "missing_unit_mapping" })
    }
    continue
  }

  $studentRows += [pscustomobject]@{
    student_id = Get-CellText -Values $studentData.values -Row $r -Col 1
    prefix_th = Get-CellText -Values $studentData.values -Row $r -Col 2
    first_name_th = Get-CellText -Values $studentData.values -Row $r -Col 3
    last_name_th = Get-CellText -Values $studentData.values -Row $r -Col 4
    full_name_th = Get-CellText -Values $studentData.values -Row $r -Col 9
    prefix_en = Get-CellText -Values $studentData.values -Row $r -Col 5
    first_name_en = Get-CellText -Values $studentData.values -Row $r -Col 6
    last_name_en = Get-CellText -Values $studentData.values -Row $r -Col 7
    full_name_en = Get-CellText -Values $studentData.values -Row $r -Col 10
    gender = Normalize-Gender (Get-CellText -Values $studentData.values -Row $r -Col 8)
    unit_id = $unit.unit_id
    program_th = Get-CellText -Values $studentData.values -Row $r -Col 12
    degree_level = ""
    student_status = "active"
    active = "TRUE"
    source_system = "UP_MASTER_2026"
    updated_at = $timestamp
  }
}

$staffData = Read-XlsValues -Path $StaffPath
$staffRows = @()
$staffIndex = 0

for ($r = 1; $r -le $staffData.rows; $r++) {
  if (-not (Has-DataInRow -Values $staffData.values -Row $r -ColumnCount 13)) { continue }
  $unitName = Get-CellText -Values $staffData.values -Row $r -Col 11
  if ($unitName -eq "unit_id") { continue }
  $unit = $unitMap[$unitName]
  if (-not $unit -or $unit.action -eq "exclude_or_hold" -or -not $unit.unit_id) {
    $heldRows += [pscustomobject]@{
      source_type = "staff"
      source_row_number = $r
      source_unit_name = $unitName
      reason = $(if ($unit) { $unit.action } else { "missing_unit_mapping" })
    }
    continue
  }

  $staffIndex += 1
  $staffRows += [pscustomobject]@{
    staff_id = "STF-UP2026-" + $staffIndex.ToString("000000")
    prefix_th = Get-CellText -Values $staffData.values -Row $r -Col 2
    first_name_th = Get-CellText -Values $staffData.values -Row $r -Col 3
    last_name_th = Get-CellText -Values $staffData.values -Row $r -Col 4
    full_name_th = Get-CellText -Values $staffData.values -Row $r -Col 8
    first_name_en = Get-CellText -Values $staffData.values -Row $r -Col 6
    last_name_en = Get-CellText -Values $staffData.values -Row $r -Col 7
    full_name_en = Get-CellText -Values $staffData.values -Row $r -Col 9
    gender = Normalize-Gender (Get-CellText -Values $staffData.values -Row $r -Col 10)
    unit_id = $unit.unit_id
    position = Get-CellText -Values $staffData.values -Row $r -Col 12
    staff_type = Normalize-StaffType (Get-CellText -Values $staffData.values -Row $r -Col 13)
    active = "TRUE"
    source_system = "UP_MASTER_2026"
    updated_at = $timestamp
  }
}

$studentOut = Join-Path $OutputDir "PERSON_STUDENT_IMPORT_STAGING.csv"
$staffOut = Join-Path $OutputDir "PERSON_STAFF_IMPORT_STAGING.csv"
$heldOut = Join-Path $OutputDir "PERSON_IMPORT_HELD_ROWS.csv"
$summaryOut = Join-Path $OutputDir "PERSON_IMPORT_STAGING_SUMMARY.json"

Export-CsvUtf8Bom -Rows $studentRows -Path $studentOut
Export-CsvUtf8Bom -Rows $staffRows -Path $staffOut
Export-CsvUtf8Bom -Rows $heldRows -Path $heldOut

$summary = [ordered]@{
  generated_at = $timestamp
  privacy_note = "Staging CSVs contain person-level data and must remain local-only."
  student_import_rows = $studentRows.Count
  staff_import_rows = $staffRows.Count
  held_rows = $heldRows.Count
  student_output = $studentOut
  staff_output = $staffOut
  held_output = $heldOut
}

$summary | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $summaryOut -Encoding UTF8
Write-Output ($summary | ConvertTo-Json -Depth 4)
