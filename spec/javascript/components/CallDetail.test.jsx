import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CallDetail from '../../../app/javascript/components/CallDetail';

describe('CallDetail', () => {
  const mockCall = {
    id: 1,
    title: 'Meeting 1',
    status: 'done',
    transcription: 'Hello everyone, this is a test meeting',
    summary: 'Team meeting discussing Q2 targets',
    created_at: '2026-05-05'
  };

  it('renders call title and metadata', () => {
    render(<CallDetail call={mockCall} onClose={jest.fn()} />);

    expect(screen.getByText('Meeting 1')).toBeInTheDocument();
    expect(screen.getByText(/2026-05-05/)).toBeInTheDocument();
  });

  it('displays transcription content', () => {
    render(<CallDetail call={mockCall} onClose={jest.fn()} />);

    expect(screen.getByText(/Hello everyone, this is a test meeting/)).toBeInTheDocument();
  });

  it('displays summary section when summary exists', () => {
    render(<CallDetail call={mockCall} onClose={jest.fn()} />);

    expect(screen.getByText(/Team meeting discussing Q2 targets/)).toBeInTheDocument();
  });

  it('hides summary section when summary is null', () => {
    const callWithoutSummary = { ...mockCall, summary: null };
    render(<CallDetail call={callWithoutSummary} onClose={jest.fn()} />);

    expect(screen.queryByText(/Team meeting discussing Q2 targets/)).not.toBeInTheDocument();
  });

  it('displays processing state when status is transcribing', () => {
    const processingCall = { ...mockCall, status: 'transcribing', transcription: null, summary: null };
    render(<CallDetail call={processingCall} onClose={jest.fn()} />);

    expect(screen.getByText(/処理中/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<CallDetail call={mockCall} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /閉じる|×/i });
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders audio player for the call', () => {
    render(<CallDetail call={mockCall} onClose={jest.fn()} />);

    expect(screen.getByTestId('audio-player')).toBeInTheDocument();
  });
});
