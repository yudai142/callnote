import React from 'react';
import { render, screen } from '@testing-library/react';
import CallList from '../../../app/javascript/components/CallList';

describe('CallList', () => {
  const mockCalls = [
    {
      id: 1,
      title: 'Meeting 1',
      status: 'done',
      transcription: 'Hello everyone',
      summary: 'Meeting summary',
      created_at: '2026-05-05'
    },
    {
      id: 2,
      title: 'Call 2',
      status: 'transcribing',
      transcription: null,
      summary: null,
      created_at: '2026-05-04'
    }
  ];

  it('renders call list with items', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    expect(screen.getByText('Meeting 1')).toBeInTheDocument();
    expect(screen.getByText('Call 2')).toBeInTheDocument();
  });

  it('displays call status badges', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    expect(screen.getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/transcribing/i)).toBeInTheDocument();
  });

  it('calls onSelectCall when a call is clicked', () => {
    const onSelectCall = jest.fn();
    render(<CallList calls={mockCalls} onSelectCall={onSelectCall} />);

    screen.getByText('Meeting 1').closest('li').click();
    expect(onSelectCall).toHaveBeenCalledWith(mockCalls[0]);
  });

  it('renders empty state when no calls', () => {
    render(<CallList calls={[]} onSelectCall={jest.fn()} />);

    expect(screen.getByText(/通話がありません/i)).toBeInTheDocument();
  });

  it('displays calls in reverse chronological order (newest first)', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Meeting 1');
    expect(items[1]).toHaveTextContent('Call 2');
  });
});
