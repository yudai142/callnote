import React from 'react';
import { render, screen } from '@testing-library/react';
import CallList from '../components/CallList';

describe('CallList Component', () => {
  const mockCalls = [
    { id: 1, title: 'Meeting A', status: 'done', created_at: '2026-05-05T10:00:00Z' },
    { id: 2, title: 'Meeting B', status: 'transcribing', created_at: '2026-05-04T14:30:00Z' },
    { id: 3, title: 'Meeting C', status: 'error', created_at: '2026-05-03T09:00:00Z' },
  ];

  it('renders table with call items', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    expect(screen.getByText('Meeting A')).toBeInTheDocument();
    expect(screen.getByText('Meeting B')).toBeInTheDocument();
    expect(screen.getByText('Meeting C')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('処理中')).toBeInTheDocument();
    expect(screen.getByText('エラー')).toBeInTheDocument();
  });

  it('renders empty state when no calls', () => {
    render(<CallList calls={[]} onSelectCall={jest.fn()} />);

    expect(screen.getByText(/通話がありません|通話一覧が空です/i)).toBeInTheDocument();
  });

  it('renders FAB button for recording', () => {
    render(<CallList calls={mockCalls} onSelectCall={jest.fn()} />);

    const fab = screen.getByRole('button', { name: /録音|keyboard_voice/i });
    expect(fab).toBeInTheDocument();
  });

  it('calls onSelectCall when row is clicked', () => {
    const mockSelectCall = jest.fn();
    render(<CallList calls={mockCalls} onSelectCall={mockSelectCall} />);

    const meetingA = screen.getByText('Meeting A').closest('tr');
    meetingA.click();

    expect(mockSelectCall).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});
