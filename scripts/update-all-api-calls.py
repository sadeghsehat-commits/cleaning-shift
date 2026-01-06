#!/usr/bin/env python3
"""
Script to update all API calls to use apiUrl() for mobile compatibility
"""
import os
import re
import sys

def update_file(filepath):
    """Update a single file to use apiUrl() for API calls"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Check if file already imports apiUrl
        has_import = 'from \'@/lib/api-config\'' in content or 'from "@/lib/api-config"' in content
        
        # Add import if needed and file has fetch('/api/
        if not has_import and 'fetch(\'/api/' in content:
            # Find the first import line
            import_match = re.search(r'^(import|export|\'use client\'|"use client")', content, re.MULTILINE)
            if import_match:
                insert_pos = import_match.end()
                # Find the end of the import block
                lines = content[:insert_pos].split('\n')
                last_import_line = 0
                for i, line in enumerate(lines):
                    if line.strip().startswith('import ') or line.strip().startswith('export '):
                        last_import_line = i
                
                # Insert after last import
                lines.insert(last_import_line + 1, "import { apiUrl } from '@/lib/api-config';")
                content = '\n'.join(lines) + content[insert_pos:]
        
        # Replace fetch('/api/ with fetch(apiUrl('/api/
        content = re.sub(
            r"fetch\((['\"`])/api/",
            r"fetch(apiUrl(\1/api/",
            content
        )
        
        # Replace fetch(`/api/ with fetch(apiUrl(`/api/
        content = re.sub(
            r"fetch\(`/api/",
            r"fetch(apiUrl(`/api/",
            content
        )
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    # Find all TypeScript/TSX files in app directory
    updated_files = []
    
    for root, dirs, files in os.walk('app'):
        # Skip node_modules and .next
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'api']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                if update_file(filepath):
                    updated_files.append(filepath)
    
    # Also check components directory
    if os.path.exists('components'):
        for root, dirs, files in os.walk('components'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    filepath = os.path.join(root, file)
                    if update_file(filepath):
                        updated_files.append(filepath)
    
    if updated_files:
        print(f"✅ Updated {len(updated_files)} files:")
        for f in updated_files:
            print(f"   - {f}")
    else:
        print("ℹ️  No files needed updating")
    
    print("\n⚠️  IMPORTANT: Set NEXT_PUBLIC_API_URL in .env.local:")
    print("   NEXT_PUBLIC_API_URL=https://your-app.vercel.app")

if __name__ == '__main__':
    main()

