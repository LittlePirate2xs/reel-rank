<#
.SYNOPSIS
  Wire real media into the Reel & Rank site.

.DESCRIPTION
  Two jobs, run in order:

  1. COPY - pulls the media that already exists in your RamanRasa assets folder
     into public\media using the names the manifest expects.

  2. SCAN - walks public\media and regenerates src\lib\media-availability.ts so
     the site knows which assets are real and which still need the designed
     placeholder frame.

  Step 2 always runs, even if step 1 copies nothing. That means you can also
  just drop files into public\media yourself and re-run this script.

  Nothing is ever deleted.

.EXAMPLE
  powershell -File scripts\wire-media.ps1
  powershell -File scripts\wire-media.ps1 -Source "D:\my assets"
  powershell -File scripts\wire-media.ps1 -ScanOnly

.NOTES
  This file is deliberately pure ASCII so it runs identically under Windows
  PowerShell 5.1 and PowerShell 7.
#>

[CmdletBinding()]
param(
  # Where to copy real media from. Defaults to the RamanRasa assets folder.
  [string]$Source = "$env:USERPROFILE\Documents\Ramanrasa assets",

  # Skip copying and only re-scan public\media.
  [switch]$ScanOnly
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PublicMedia = Join-Path $ProjectRoot "public\media"
$AvailabilityFile = Join-Path $ProjectRoot "src\lib\media-availability.ts"

Write-Host ""
Write-Host "Reel & Rank - media wiring" -ForegroundColor White
Write-Host "  project : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  media   : $PublicMedia" -ForegroundColor DarkGray

# ---------------------------------------------------------------------------
# Phase 1 - copy known assets
# ---------------------------------------------------------------------------

# manifest id -> path relative to $Source
$Map = [ordered]@{
  # The eight films, in the order they should appear in the series.
  "film-01" = "Video\ramanrasa-fall-spice-reel-9x16.mp4"
  "film-02" = "Video\ramanrasa-thank-you-ispice2-bold-9x16.mp4"
  "film-03" = "Video\ramanrasa-cover-autumn-motion.mp4"
  "film-04" = "Video\ramanrasa-facebook-cover-autumn-motion.mp4"
  "film-05" = "Video\ramanrasa-cinnamon-aplus-video.mp4"
  "film-06" = "Video\amazon-brandstore-loop-15s.mp4"
  "film-07" = "Video\fall-promo-15s\ramanrasa-fall-promo-15s-16x9-with-offer.mp4"
  "film-08" = "Video\launch-reveal-10s\ramanrasa-launch-reveal-10s-9x16.mp4"

  # Poster frames, only where a real one exists.
  "film-07-poster" = "Video\fall-promo-15s\ramanrasa-fall-promo-poster-offer.png"
  "film-08-poster" = "Video\launch-reveal-10s\ramanrasa-launch-reveal-poster-9x16.jpg"

  # Motion graphics samples.
  "motion-01" = "Video\email-welcome-founders-batch-motion.mp4"
  "motion-02" = "Video\fall-promo-15s\ramanrasa-fall-promo-15s-16x9-clean-no-offer-text.mp4"
  "motion-03" = "Video\ramanrasa-facebook-cover-autumn-motion.mp4"

  # Campaign stills.
  "campaign-still-01" = "Images\hero-cinnamon-pouch-plantation.png"
  "campaign-still-02" = "Images\hero-cinnamon-pouch-bright.png"
  "campaign-still-03" = "Images\amazon-aplus-lineup-premium.png"
  "campaign-still-04" = "Images\amazon-brandstore-hero-3000x600.png"

  # Studio stills.
  "studio-01" = "Images\PXL_20260622_080041811.jpg"
  "studio-02" = "Images\PXL_20260622_080113595.jpg"
  "studio-03" = "Images\PXL_20260624_111840911.jpg"
}

function Get-Destination([string]$id) {
  if ($id -match '^film-\d{2}-poster$') { return "films\$id.jpg" }
  if ($id -match '^film-\d{2}$')        { return "films\$id.mp4" }
  if ($id -match '^motion-\d{2}$')      { return "motion\$id.mp4" }
  if ($id -match '^campaign-still')     { return "campaign\$id.jpg" }
  if ($id -eq 'campaign-hero')          { return "campaign\flavors-chase-me.jpg" }
  if ($id -match '^portrait-')          { return "team\$($id -replace '^portrait-','').jpg" }
  if ($id -match '^studio-')            { return "studio\$id.jpg" }
  if ($id -match '^brand-')             { return "brand\$($id -replace '^brand-','').svg" }
  if ($id -eq 'og-fallback')            { return "brand\og-fallback.jpg" }
  return $id
}

if (-not $ScanOnly) {
  Write-Host ""
  Write-Host "Phase 1 - copying" -ForegroundColor White

  if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "  source folder not found, skipping copy:" -ForegroundColor Yellow
    Write-Host "  $Source" -ForegroundColor DarkGray
  }
  else {
    $copied = 0
    $skipped = 0
    $missing = @()

    foreach ($id in $Map.Keys) {
      $from = Join-Path $Source $Map[$id]
      $to = Join-Path $PublicMedia (Get-Destination $id)

      if (-not (Test-Path -LiteralPath $from)) {
        $missing += $Map[$id]
        continue
      }

      if (Test-Path -LiteralPath $to) {
        $skipped++
        continue
      }

      $dir = Split-Path -Parent $to
      if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
      }

      Copy-Item -LiteralPath $from -Destination $to -Force
      Write-Host "  + $id" -ForegroundColor Green
      $copied++
    }

    Write-Host "  copied $copied, already present $skipped" -ForegroundColor DarkGray
    if ($missing.Count -gt 0) {
      Write-Host "  not found in source ($($missing.Count)):" -ForegroundColor Yellow
      $missing | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
    }
  }
}

# ---------------------------------------------------------------------------
# Phase 2 - scan public\media and regenerate the availability module
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Phase 2 - scanning public\media" -ForegroundColor White

$ids = New-Object System.Collections.Generic.HashSet[string]

if (Test-Path -LiteralPath $PublicMedia) {
  $files = Get-ChildItem -LiteralPath $PublicMedia -Recurse -File

  foreach ($file in $files) {
    $rel = $file.FullName.Substring($PublicMedia.Length + 1) -replace '\\', '/'
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    if ($rel -match '^films/film-(\d{2})\.(mp4|webm|mov)$') {
      [void]$ids.Add("film-$($Matches[1])"); continue
    }
    if ($rel -match '^films/film-(\d{2})\.(jpg|jpeg|png|webp|avif)$') {
      [void]$ids.Add("film-$($Matches[1])-poster"); continue
    }
    if ($rel -match '^motion/motion-(\d{2})\.(mp4|webm|mov)$') {
      [void]$ids.Add("motion-$($Matches[1])"); continue
    }
    if ($rel -match '^motion/motion-(\d{2})\.(jpg|jpeg|png|webp|avif)$') {
      # The video is the asset, but the poster decides whether it can be drawn.
      [void]$ids.Add("motion-$($Matches[1])-poster"); continue
    }
    if ($rel -match '^campaign/flavors-chase-me\.') {
      [void]$ids.Add("campaign-hero"); continue
    }
    if ($rel -match '^campaign/still-(\d{2})\.') {
      [void]$ids.Add("campaign-still-$($Matches[1])"); continue
    }
    if ($rel -match '^team/([a-z0-9-]+)\.(jpg|jpeg|png|webp|avif)$') {
      [void]$ids.Add("portrait-$($Matches[1])"); continue
    }
    if ($rel -match '^studio/([a-z0-9-]+)\.') {
      [void]$ids.Add($Matches[1]); continue
    }
    if ($rel -match '^brand/logo\.') { [void]$ids.Add("brand-logo"); continue }
    if ($rel -match '^brand/mark\.') { [void]$ids.Add("brand-mark"); continue }
    if ($rel -match '^brand/og-fallback\.') { [void]$ids.Add("og-fallback"); continue }

    if ($name -ne '.gitkeep' -and $name -ne 'README' -and $name -ne 'STOCK-CREDITS') {
      Write-Host "  ? unmapped: $rel" -ForegroundColor DarkGray
    }
  }
}

$sorted = @($ids | Sort-Object)

if ($sorted.Count -eq 0) {
  $body = "  // Nothing wired yet - every asset renders its placeholder frame."
}
else {
  $lines = @()
  foreach ($id in $sorted) { $lines += "  `"$id`"," }
  $body = $lines -join "`n"
}

$content = @"
/* ============================================================================
   GENERATED FILE - do not edit by hand.

   Written by ``scripts/wire-media.ps1``. It lists the media ids whose real files
   are present under /public/media. Anything not listed renders the designed
   placeholder frame instead.

   Re-run the script after adding or replacing files:
     powershell -File scripts\wire-media.ps1
   ========================================================================= */

export const availableMediaIds: ReadonlySet<string> = new Set<string>([
$body
]);
"@

# Write UTF-8 without a BOM so the TypeScript toolchain sees no stray character.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($AvailabilityFile, $content, $utf8NoBom)

Write-Host ""
Write-Host "  $($sorted.Count) of the manifest's assets now have real files." -ForegroundColor Green
foreach ($id in $sorted) { Write-Host "    $id" -ForegroundColor DarkGray }
Write-Host ""
Write-Host "  wrote $AvailabilityFile" -ForegroundColor DarkGray
Write-Host "Done. Restart the dev server if it is running." -ForegroundColor White
Write-Host ""
