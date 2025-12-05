# PowerShell script to run the Dynamic Survey project
# Run this script from the project root directory

# Refresh PATH to include pnpm
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Navigate to the survey-builder directory
Set-Location "survey-builder\survey-builder"

# Run the development server
pnpm dev

