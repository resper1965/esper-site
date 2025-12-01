'use client';

import { useEffect } from 'react';

/**
 * Code Copy Button Enhancement
 * Adds copy buttons to all code blocks in the page
 */
export function CodeCopyButtons() {
  useEffect(() => {
    // Find all pre elements (code blocks)
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((pre) => {
      // Skip if button already exists
      if (pre.querySelector('.copy-button')) return;

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'copy-button-container';
      buttonContainer.style.cssText = 'position: absolute; top: 0.5rem; right: 0.5rem; z-index: 10;';

      // Create button
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `;
      button.style.cssText = `
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        padding: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        color: var(--muted-foreground);
      `;

      // Add hover effect
      button.onmouseenter = () => {
        button.style.background = 'var(--muted)';
        button.style.color = 'var(--foreground)';
      };
      button.onmouseleave = () => {
        button.style.background = 'var(--background)';
        button.style.color = 'var(--muted-foreground)';
      };

      // Copy functionality
      button.onclick = async () => {
        const code = pre.querySelector('code');
        if (!code) return;

        const text = code.textContent || '';
        await navigator.clipboard.writeText(text);

        // Show success state
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        button.style.color = 'var(--primary)';

        // Reset after 2 seconds
        setTimeout(() => {
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          `;
          button.style.color = 'var(--muted-foreground)';
        }, 2000);
      };

      buttonContainer.appendChild(button);

      // Make pre relative for absolute positioning
      pre.style.position = 'relative';
      pre.appendChild(buttonContainer);
    });
  }, []);

  return null;
}
