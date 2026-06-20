$baseAppPath = "e:\bajapro-fe\src\src\app\(dashboard)"
$targetBase = "e:\bajapro-fe\src\src"

$groups = @("(master)", "(transaction)")

foreach ($group in $groups) {
    $groupPath = Join-Path $baseAppPath $group
    if (Test-Path $groupPath) {
        $features = Get-ChildItem -Path $groupPath -Directory
        foreach ($feature in $features) {
            $featureName = $feature.Name

            # Tentukan folder sumber
            $componentsDir = Join-Path $feature.FullName "components"
            $hooksDir = Join-Path $feature.FullName "hooks"
            $typesDir = Join-Path $feature.FullName "types"
            $apiDir = Join-Path $feature.FullName "api"

            # Tentukan folder tujuan
            $targetComponentsDir = Join-Path $targetBase "components\features\$featureName"
            $targetHooksDir = Join-Path $targetBase "hooks\$featureName"
            $targetTypesDir = Join-Path $targetBase "types\$featureName"
            $targetApiDir = Join-Path $targetBase "actions\$featureName"

            # Buat direktori jika ada sumbernya
            if (Test-Path $componentsDir) {
                New-Item -ItemType Directory -Force -Path $targetComponentsDir | Out-Null
                Move-Item -Path "$componentsDir\*" -Destination $targetComponentsDir -Force
                Remove-Item -Path $componentsDir -Force -Recurse
            }
            if (Test-Path $hooksDir) {
                New-Item -ItemType Directory -Force -Path $targetHooksDir | Out-Null
                Move-Item -Path "$hooksDir\*" -Destination $targetHooksDir -Force
                Remove-Item -Path $hooksDir -Force -Recurse
            }
            if (Test-Path $typesDir) {
                New-Item -ItemType Directory -Force -Path $targetTypesDir | Out-Null
                Move-Item -Path "$typesDir\*" -Destination $targetTypesDir -Force
                Remove-Item -Path $typesDir -Force -Recurse
            }
            if (Test-Path $apiDir) {
                New-Item -ItemType Directory -Force -Path $targetApiDir | Out-Null
                Move-Item -Path "$apiDir\*" -Destination $targetApiDir -Force
                Remove-Item -Path $apiDir -Force -Recurse
            }

            # Lakukan replace string global untuk merapikan import khusus fitur ini
            # Karena path sebelumnya bervariasi, kita coba catch semuanya
            $files = Get-ChildItem -Path $targetBase -Recurse -Include *.ts,*.tsx
            foreach ($file in $files) {
                $content = Get-Content $file.FullName
                $changed = $false

                # Regex untuk menangkap import
                $searchComp = "@\/src\/app\/\(dashboard\)\/\$group\/$featureName\/components"
                $searchHooks = "@\/src\/app\/\(dashboard\)\/\$group\/$featureName\/hooks"
                $searchTypes = "@\/src\/app\/\(dashboard\)\/\$group\/$featureName\/types"
                $searchApi = "@\/src\/app\/\(dashboard\)\/\$group\/$featureName\/api"

                if ($content -match $searchComp) {
                    $content = $content -replace $searchComp, "@/src/components/features/$featureName"
                    $changed = $true
                }
                if ($content -match $searchHooks) {
                    $content = $content -replace $searchHooks, "@/src/hooks/$featureName"
                    $changed = $true
                }
                if ($content -match $searchTypes) {
                    $content = $content -replace $searchTypes, "@/src/types/$featureName"
                    $changed = $true
                }
                if ($content -match $searchApi) {
                    $content = $content -replace $searchApi, "@/src/actions/$featureName"
                    $changed = $true
                }

                if ($changed) {
                    Set-Content -Path $file.FullName -Value $content
                    Write-Host "Updated imports for $featureName in $($file.Name)"
                }
            }
        }
    }
}
Write-Host "Selesai!"
