#!/bin/bash

echo "Validating repository structure for Infosys Global Hackathon 2025..."
echo

# Check for required files
echo "Checking for required template files..."
required_files=(
  "README.md"
  "CONTRIBUTING.md" 
  "LICENSE"
  "SECURITY.md"
  "docs/DESCRIPTION.md"
  "docs/contributing/ISSUES.md"
  "docs/contributing/PULL-REQUESTS.md"
)

missing_files=()
for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    missing_files+=("$file")
  fi
done

if [[ ${#missing_files[@]} -ne 0 ]]; then
  echo "❌ Missing required files:"
  printf '%s\n' "${missing_files[@]}"
  exit_status=1
else
  echo "✅ All required template files are present"
fi

# Validate README structure
echo
echo "Validating README structure..."
required_sections=(
  "# Infosys Global Hackathon 2025"
  "## Project Overview"
  "## Technical Implementation" 
  "## Getting Started"
  "## Contributing"
  "## Contributors"
)

missing_sections=()
for section in "${required_sections[@]}"; do
  if ! grep -q "$section" README.md; then
    missing_sections+=("$section")
  fi
done

if [[ ${#missing_sections[@]} -ne 0 ]]; then
  echo "❌ Missing required README sections:"
  printf '%s\n' "${missing_sections[@]}"
  exit_status=1
else
  echo "✅ README structure is valid"
fi

# Check for template placeholders
echo
echo "Checking for unmodified template placeholders..."
if grep -r "\[Replace with" . --include="*.md" || \
   grep -r "\[Your " . --include="*.md" || \
   grep -r "\[Insert " . --include="*.md"; then
  echo "⚠️ Template placeholders found (should be replaced in final submission)"
else
  echo "✅ No template placeholders found"
fi

# Validate contributing guidelines
echo
echo "Validating contributing guidelines..."
if grep -q "Infosys-Global-Hackathon/GlobalHackathonSample" CONTRIBUTING.md; then
  echo "✅ Contributing guidelines contain correct repository references"
else
  echo "❌ Contributing guidelines missing repository references"
  exit_status=1
fi

# Final result
echo
if [[ $exit_status -eq 1 ]]; then
  echo "❌ Validation failed. Please address the issues above."
  exit 1
else
  echo "✅ Repository validation successful! Your repo meets the requirements."
fi
