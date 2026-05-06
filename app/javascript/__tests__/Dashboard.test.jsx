import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

describe('Dashboard Component', () => {
  const mockCalls = [
    { id: 1, title: 'Meeting 1', status: 'done', created_at: '2026-05-05T10:00:00Z', duration: 1800 },
    { id: 2, title: 'Meeting 2', status: 'done', created_at: '2026-05-04T14:30:00Z', duration: 2400 },
  ];

  it('renders statistics cards', () => {
    render(<Dashboard calls={mockCalls} />);

    expect(screen.getByText('24')).toBeInTheDocument(); // ファイル総数
    expect(screen.getByText('18.5')).toBeInTheDocument(); // 書き起こし時間
    expect(screen.getByText('42')).toBeInTheDocument(); // AI要約
  });

  it('renders dashboard title', () => {
    render(<Dashboard calls={mockCalls} />);

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  it('renders recent uploads section', () => {
    render(<Dashboard calls={mockCalls} />);

    expect(screen.getByText('最近のアップロード')).toBeInTheDocument();
  });

  it('displays quick action buttons', () => {
    render(<Dashboard calls={mockCalls} />);

    expect(screen.getByText('音声アップロード')).toBeInTheDocument();
    expect(screen.getByText('AI一括要約')).toBeInTheDocument();
  });

  it('renders with empty calls', () => {
    render(<Dashboard calls={[]} />);

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });
});
