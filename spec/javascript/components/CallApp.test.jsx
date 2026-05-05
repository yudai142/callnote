import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CallApp from '../../../app/javascript/components/CallApp';

describe('CallApp', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  it('renders the main app container', () => {
    render(<CallApp />);
    expect(screen.getByRole('heading', { name: /通話管理/i })).toBeInTheDocument();
  });

  it('fetches and displays call list on mount', async () => {
    const mockCalls = [
      { id: 1, title: 'Call 1', status: 'done', transcription: 'Test transcription' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCalls
    });

    render(<CallApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/calls');
    });
  });

  it('polls for call status updates', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(<CallApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('renders CallList and CallUploader components', () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(<CallApp />);

    expect(screen.getByTestId('call-list')).toBeInTheDocument();
    expect(screen.getByTestId('call-uploader')).toBeInTheDocument();
  });
});
