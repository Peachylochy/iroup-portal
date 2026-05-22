param(
  [string]$StudentPath = "D:\DATA_MASTER_ Students_Staff\STUDENT_MASTER _DATA.xls",
  [string]$StaffPath = "D:\DATA_MASTER_ Students_Staff\STAFF_MASTER _DATA.xls",
  [string]$UnitMasterPath = "Team IROUP\backend\database-v2\IROUP_V2_UP_UNIT_MASTER.gs",
  [string]$OutputPath = "D:\DATA_MASTER_ Students_Staff\unit_mapping_review_data.json"
)

$ErrorActionPreference = "Stop"

function Normalize-Text {
  param([object]$Value)
  if ($null -eq $Value) { return "" }
  return ([string]$Value).Trim() -replace "\s+", " "
}

function Read-XlsUnitCounts {
  param(
    [string]$Path,
    [int]$UnitColumn,
    [int]$DataColumnCount
  )

  $excel = $null
  $workbook = $null
  try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $workbook = $excel.Workbooks.Open($Path)
    $sheet = $workbook.Worksheets.Item(1)
    $used = $sheet.UsedRange
    $rows = $used.Rows.Count
    $cols = $used.Columns.Count
    $values = $used.Value2
    $validRows = 0
    $counts = @{}

    for ($r = 1; $r -le $rows; $r++) {
      $hasData = $false
      $maxCol = [Math]::Min($DataColumnCount, $cols)
      for ($c = 1; $c -le $maxCol; $c++) {
        if (Normalize-Text $values.GetValue($r, $c)) {
          $hasData = $true
          break
        }
      }
      if (-not $hasData) { continue }
      $unitName = Normalize-Text $values.GetValue($r, $UnitColumn)
      if ($unitName -eq "unit_id") { continue }
      $validRows += 1
      if (-not $unitName) { $unitName = "(blank)" }
      if (-not $counts.ContainsKey($unitName)) { $counts[$unitName] = 0 }
      $counts[$unitName] += 1
    }

    return @{
      path = $Path
      row_count = $validRows
      unit_counts = $counts
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

function Read-UnitMaster {
  param([string]$Path)

  $text = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $pattern = "\{[\s\S]*?unit_id:\s*'(?<unit_id>[^']*)'[\s\S]*?unit_code:\s*'(?<unit_code>[^']*)'[\s\S]*?unit_name_th:\s*'(?<unit_name_th>[^']*)'[\s\S]*?unit_name_en:\s*'(?<unit_name_en>[^']*)'[\s\S]*?unit_type:\s*'(?<unit_type>[^']*)'[\s\S]*?parent_unit_id:\s*'(?<parent_unit_id>[^']*)'[\s\S]*?active:\s*(?<active>true|false)"
  $matches = [regex]::Matches($text, $pattern)
  $units = @()
  foreach ($m in $matches) {
    $units += [ordered]@{
      unit_id = $m.Groups["unit_id"].Value
      unit_code = $m.Groups["unit_code"].Value
      unit_name_th = $m.Groups["unit_name_th"].Value
      unit_name_en = $m.Groups["unit_name_en"].Value
      unit_type = $m.Groups["unit_type"].Value
      parent_unit_id = $m.Groups["parent_unit_id"].Value
      active = [bool]::Parse($m.Groups["active"].Value)
    }
  }
  return $units
}

function Find-Match {
  param(
    [string]$SourceUnit,
    [array]$Units
  )
  $normalized = Normalize-Text $SourceUnit
  foreach ($unit in $Units) {
    if ((Normalize-Text $unit.unit_name_th) -eq $normalized) { return $unit }
  }
  return $null
}

$unitMaster = Read-UnitMaster -Path $UnitMasterPath
$student = Read-XlsUnitCounts -Path $StudentPath -UnitColumn 11 -DataColumnCount 12
$staff = Read-XlsUnitCounts -Path $StaffPath -UnitColumn 11 -DataColumnCount 13

function Build-ReviewRows {
  param(
    [string]$SourceType,
    [hashtable]$Counts,
    [array]$Units
  )
  $rows = @()
  foreach ($name in ($Counts.Keys | Sort-Object)) {
    $match = Find-Match -SourceUnit $name -Units $Units
    $rows += [ordered]@{
      source_type = $SourceType
      source_unit_name = $name
      source_row_count = $Counts[$name]
      match_status = $(if ($match) { "MATCH" } else { "REVIEW" })
      matched_unit_id = $(if ($match) { $match.unit_id } else { "" })
      matched_unit_name_th = $(if ($match) { $match.unit_name_th } else { "" })
      matched_unit_type = $(if ($match) { $match.unit_type } else { "" })
      matched_active = $(if ($match) { $match.active } else { "" })
      proposed_action = $(if ($match) { "use_existing" } else { "" })
      proposed_unit_id = ""
      approved_unit_id = ""
      review_note = ""
    }
  }
  return $rows
}

$reviewRows = @()
$reviewRows += Build-ReviewRows -SourceType "student" -Counts $student.unit_counts -Units $unitMaster
$reviewRows += Build-ReviewRows -SourceType "staff" -Counts $staff.unit_counts -Units $unitMaster

$result = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  privacy_note = "Aggregate unit-name counts only. No person-level rows, names, or IDs are included."
  student_path = $StudentPath
  staff_path = $StaffPath
  student_row_count = $student.row_count
  staff_row_count = $staff.row_count
  unit_master_count = $unitMaster.Count
  review_rows = $reviewRows
  unit_master = $unitMaster
}

$dir = Split-Path -Parent $OutputPath
if ($dir -and -not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Path $dir | Out-Null
}

$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output $OutputPath
