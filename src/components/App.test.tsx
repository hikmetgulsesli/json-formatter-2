import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { App } from './App';

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Keyboard Shortcuts Modal', () => {
    it('should open modal when ? key is pressed', () => {
      render(<App />);
      
      // Press ? key (not in textarea)
      fireEvent.keyDown(window, { key: '?' });
      
      // Modal should be visible
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      expect(screen.getByText('Klavye Kısayolları')).toBeInTheDocument();
    });

    it('should not open modal when ? is typed in textarea', () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      // Focus textarea and type ?
      input.focus();
      fireEvent.keyDown(input, { key: '?' });
      
      // Modal should NOT be visible
      expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
    });

    it('should close modal when Escape key is pressed', () => {
      render(<App />);
      
      // Open modal
      fireEvent.keyDown(window, { key: '?' });
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      
      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      
      // Modal should be closed
      expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
    });

    it('should close modal when clicking overlay', () => {
      render(<App />);
      
      // Open modal
      fireEvent.keyDown(window, { key: '?' });
      const modal = screen.getByTestId('keyboard-shortcuts-modal');
      expect(modal).toBeInTheDocument();
      
      // Click on overlay (the modal backdrop)
      fireEvent.click(modal);
      
      // Modal should be closed
      expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
    });

    it('should close modal when clicking close button', () => {
      render(<App />);
      
      // Open modal
      fireEvent.keyDown(window, { key: '?' });
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      
      // Click close button
      fireEvent.click(screen.getByTestId('close-modal-btn'));
      
      // Modal should be closed
      expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
    });

    it('should display all keyboard shortcuts with Turkish labels', () => {
      render(<App />);
      
      // Open modal
      fireEvent.keyDown(window, { key: '?' });
      
      // Check for Turkish labels (use getAllByText since there might be duplicates in the UI)
      expect(screen.getAllByText('Biçimlendir').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Küçült').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kopyala').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Temizle').length).toBeGreaterThanOrEqual(1);
    });

    it('should open modal when clicking help button', () => {
      render(<App />);
      
      const helpBtn = screen.getByTestId('help-btn');
      fireEvent.click(helpBtn);
      
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
    });
  });

  describe('Keyboard shortcuts work globally', () => {
    it('should trigger format on Ctrl+Enter', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"name":"test"}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      // Press Ctrl+Enter
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
      
      // Input should be formatted
      await waitFor(() => {
        expect(input).toHaveValue('{\n  "name": "test"\n}');
      });
    });

    it('should trigger minify on Ctrl+Shift+M', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{\n  "name": "test"\n}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      // Press Ctrl+Shift+M
      fireEvent.keyDown(window, { key: 'm', ctrlKey: true, shiftKey: true });
      
      // Input should be minified
      await waitFor(() => {
        expect(input).toHaveValue('{"name":"test"}');
      });
    });

    it('should trigger copy on Ctrl+Shift+C when not in textarea', async () => {
      vi.useRealTimers();
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test": 1}' } });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Press Ctrl+Shift+C
      fireEvent.keyDown(window, { key: 'c', ctrlKey: true, shiftKey: true });
      
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('{\n  "test": 1\n}');
      });
    });

    it('should trigger clear on Ctrl+L', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test": 1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Press Ctrl+L
      fireEvent.keyDown(window, { key: 'l', ctrlKey: true });
      
      // Input should be cleared
      await waitFor(() => {
        expect(input).toHaveValue('');
        expect(screen.getByText('HAZIR')).toBeInTheDocument();
      });
    });
  });

  describe('Shortcuts disabled when modal is open', () => {
    it('should not trigger format when modal is open', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"name":"test"}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      // Open modal
      fireEvent.keyDown(window, { key: '?' });
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      
      // Try to format while modal is open
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
      
      // Input should NOT be formatted
      expect(input).toHaveValue('{"name":"test"}');
    });
  });
});
