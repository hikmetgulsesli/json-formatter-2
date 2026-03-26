import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

describe('KeyboardShortcutsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
    expect(screen.getByText('Klavye Kısayolları')).toBeInTheDocument();
  });

  it('should display all shortcuts with Turkish labels', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    // Check Turkish labels (use getAllByText since there might be duplicates)
    expect(screen.getAllByText('Biçimlendir').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Küçült').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kopyala').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Temizle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bu pencere').length).toBeGreaterThanOrEqual(1);
  });

  it('should display keyboard keys for each shortcut', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    // Check for keyboard keys (using getAllByText since some keys appear multiple times)
    const ctrlKeys = screen.getAllByText(/CTRL|⌘/);
    expect(ctrlKeys.length).toBeGreaterThanOrEqual(4);
    
    expect(screen.getAllByText('ENTER').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SHIFT').length).toBeGreaterThanOrEqual(2); // 2 shortcuts use SHIFT
    expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('C').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('L').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('?').length).toBeGreaterThanOrEqual(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    const modal = screen.getByTestId('keyboard-shortcuts-modal');
    fireEvent.click(modal);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have glassmorphism styling', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    const modal = screen.getByTestId('keyboard-shortcuts-modal');
    // Check for backdrop blur
    expect(modal).toHaveClass('backdrop-blur-sm');
  });

  it('should not call onClose when clicking inside modal content', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />);
    
    // Click on the modal content (title)
    const title = screen.getByText('Klavye Kısayolları');
    fireEvent.click(title);
    
    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
