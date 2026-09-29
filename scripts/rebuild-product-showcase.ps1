[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repositoryPrefix = $repositoryRoot.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
$docsRoot = [IO.Path]::GetFullPath((Join-Path $repositoryRoot 'docs'))
$generatedProductRoot = [IO.Path]::GetFullPath(
    (Join-Path $docsRoot 'product-showcase\product')
)
$manifestPath = [IO.Path]::GetFullPath(
    (Join-Path $docsRoot '_data\product_showcase_pages.json')
)
$siteOutput = [IO.Path]::GetFullPath((Join-Path $repositoryRoot '_site'))
$generatorPath = [IO.Path]::GetFullPath(
    (Join-Path $PSScriptRoot 'generate_product_showcase_pages.py')
)
function Assert-RepositoryChildPath {
    param([Parameter(Mandatory)][string]$Path)

    $resolvedPath = [IO.Path]::GetFullPath($Path)
    if (-not $resolvedPath.StartsWith($repositoryPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to modify a path outside the repository: $resolvedPath"
    }
    return $resolvedPath
}

Write-Host 'Removing all existing product detail pages...'
if (Test-Path -LiteralPath $generatedProductRoot) {
    Remove-Item -LiteralPath (Assert-RepositoryChildPath -Path $generatedProductRoot) -Recurse -Force
}

if (Test-Path -LiteralPath $manifestPath -PathType Leaf) {
    Remove-Item -LiteralPath (Assert-RepositoryChildPath -Path $manifestPath) -Force
}

if (Test-Path -LiteralPath $siteOutput) {
    Remove-Item -LiteralPath (Assert-RepositoryChildPath -Path $siteOutput) -Recurse -Force
}

Write-Host 'Generating the current approved and published product pages...'
$uv = Get-Command uv -ErrorAction SilentlyContinue
if ($null -ne $uv) {
    & $uv.Source run --python 3.12 python $generatorPath
} else {
    $python = Get-Command python3, python -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $python) {
        throw 'Python 3 is required. Install Python 3 or uv, then run this script again.'
    }
    & $python.Source $generatorPath
}
if ($LASTEXITCODE -ne 0) {
    throw "Product page generation failed with exit code $LASTEXITCODE."
}

$jekyll = Get-Command jekyll -ErrorAction SilentlyContinue
if ($null -eq $jekyll) {
    throw 'Jekyll is required to build the site.'
}

Write-Host 'Building the complete Jekyll site...'
& $jekyll.Source build --source $docsRoot --destination $siteOutput
if ($LASTEXITCODE -ne 0) {
    throw "Jekyll build failed with exit code $LASTEXITCODE."
}

Write-Host "Rebuild complete: $siteOutput"
