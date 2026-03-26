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

describe('App - US-010: Input-Output State Synchronization', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Input change triggers validation within 300ms', () => {
    it('should debounce validation for 300ms', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test":' } });
      
      // Immediately after input, status should still be ready
      expect(screen.getByText('HAZIR')).toBeInTheDocument();
      
      // Advance time by 300ms
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERSİZ')).toBeInTheDocument();
      });
    });

    it('should reset debounce timer on rapid input', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test":' } });
      
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      
      // Trigger another change before 300ms
      fireEvent.change(input, { target: { value: '{"test": 1' } });
      
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      
      // Still should not have validated yet (timer was reset)
      expect(screen.getByText('HAZIR')).toBeInTheDocument();
      
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      
      // Now it should show invalid
      await waitFor(() => {
        expect(screen.getByText('GEÇERSİZ')).toBeInTheDocument();
      });
    });
  });

  describe('Validation result updates status indicator within 350ms', () => {
    it('should show valid status for valid JSON', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"name": "test"}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
    });

    it('should show invalid status for invalid JSON', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: 'invalid json' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERSİZ')).toBeInTheDocument();
      });
    });
  });

  describe('Tree view updates on valid input', () => {
    it('should update tree view with formatted JSON', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"name":"test"}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        const treeView = screen.getByTestId('tree-view');
        expect(treeView.textContent).toContain('"name": "test"');
      });
    });
  });

  describe('Error state shown within 350ms of invalid input', () => {
    it('should show error banner for invalid JSON', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test":}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Geçersiz JSON:/)).toBeInTheDocument();
      });
    });
  });

  describe('Format updates both textarea and tree view atomically', () => {
    it('should format input and update tree view when format button clicked', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"name":"test","val":1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      const formatBtn = screen.getByTestId('format-btn');
      fireEvent.click(formatBtn);
      
      // Textarea should be updated with formatted JSON
      await waitFor(() => {
        expect(input).toHaveValue('{\n  "name": "test",\n  "val": 1\n}');
      });
      
      // Tree view should also be updated
      const treeView = screen.getByTestId('tree-view');
      expect(treeView.textContent).toContain('"name": "test"');
    });
  });

  describe('Minify updates both textarea and tree view atomically', () => {
    it('should minify input and update tree view when minify button clicked', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{\n  "name": "test"\n}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      const minifyBtn = screen.getByTestId('minify-btn');
      fireEvent.click(minifyBtn);
      
      // Textarea should be updated with minified JSON
      await waitFor(() => {
        expect(input).toHaveValue('{"name":"test"}');
      });
      
      // Tree view should also be updated with minified content
      const treeView = screen.getByTestId('tree-view');
      expect(treeView.textContent).toContain('{"name":"test"}');
    });
  });

  describe('Clear resets input, tree view, and status atomically', () => {
    it('should reset all state when clear button clicked', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      // First add some content
      fireEvent.change(input, { target: { value: '{"test": 1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Then clear
      const clearBtn = screen.getByTestId('clear-btn');
      fireEvent.click(clearBtn);
      
      // All state should be reset
      await waitFor(() => {
        expect(screen.getByText('HAZIR')).toBeInTheDocument();
        expect(input).toHaveValue('');
      });
      
      // Tree view should be empty
      const treeView = screen.getByTestId('tree-view');
      expect(treeView.textContent).toContain('JSON girin');
    });
  });

  describe('No orphaned state after any action sequence', () => {
    it('should maintain consistent state through format -> clear -> input sequence', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      // Format valid JSON
      fireEvent.change(input, { target: { value: '{"a":1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      fireEvent.click(screen.getByTestId('format-btn'));
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Clear
      fireEvent.click(screen.getByTestId('clear-btn'));
      
      await waitFor(() => {
        expect(screen.getByText('HAZIR')).toBeInTheDocument();
      });
      
      // Enter invalid JSON
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERSİZ')).toBeInTheDocument();
      });
      
      // State should be consistent
      expect(input).toHaveValue('invalid');
    });
  });

  describe('Copy functionality', () => {
    it('should copy formatted output to clipboard', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"test": 1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      // Wait for valid state
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Use real timers for clipboard operation
      vi.useRealTimers();
      
      const copyBtn = screen.getByTestId('copy-btn');
      fireEvent.click(copyBtn);
      
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('{\n  "test": 1\n}');
      });
      
      // Toast should appear
      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toBeInTheDocument();
      });
    });
  });

  describe('Error state disables tree view', () => {
    it('should disable tree view when JSON is invalid', async () => {
      render(<App />);
      const input = screen.getByTestId('json-input');
      
      fireEvent.change(input, { target: { value: '{"valid": 1}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERLİ')).toBeInTheDocument();
      });
      
      // Make it invalid
      fireEvent.change(input, { target: { value: '{"invalid":}' } });
      
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('GEÇERSİZ')).toBeInTheDocument();
      });
      
      // Tree view should show disabled message
      const treeView = screen.getByTestId('tree-view');
      expect(treeView.textContent).toContain('devre dışı');
    });
  });
});
