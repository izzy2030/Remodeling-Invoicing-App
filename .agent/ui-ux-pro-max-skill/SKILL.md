---
name: UI UX Pro Max
description: AI-powered design intelligence for generating professional design systems
---

# UI UX Pro Max Skill

This skill allows you to generate comprehensive design systems and UI/UX recommendations.

## Usage

When you need to design a UI, generate a color palette, pick fonts, or understand best practices for a specific industry or technology stack, use the python script provided in this skill.

### 1. Generate a Design System

The most powerful feature is the design system generator. Run this at the start of any new UI project.

```bash
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <detailed_keywords>" --design-system -p "<ProjectName>"
```

Example:
```bash
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "SaaS dashboard dark mode analytics" --design-system -p "Analytix"
```

### 2. Search for Specific Recommendations

You can search specific domains if you only need one aspect.

**Domains:** `style`, `color`, `typography`, `landing`, `chart`, `ux`, `product`

```bash
# Colors for fintech
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "fintech banking" --domain color

# Styles for a modern app
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style

# Typography for a luxury brand
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "luxury elegant serif" --domain typography
```

### 3. Stack-Specific Guidelines

Get best practices for the technology you are using.

```bash
python .agent/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "responsive layout" --stack html-tailwind
```

**Stacks:** `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

## Interpretation

The script returns standard markdown or ASCII output. Read the output to inform your code decisions (colors to use, class names to apply, patterns to follow).
