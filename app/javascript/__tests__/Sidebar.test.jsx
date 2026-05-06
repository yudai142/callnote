import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../components/Sidebar';

describe('Sidebar Component', () => {
  it('renders navigation links', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={jest.fn()} />);

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('通話一覧')).toBeInTheDocument();
    expect(screen.getByText('新規アップロード')).toBeInTheDocument();
    expect(screen.getByText('分析レポート')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('renders logout link', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={jest.fn()} />);

    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('renders record button', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={jest.fn()} />);

    expect(screen.getByText('録音を開始')).toBeInTheDocument();
  });

  it('calls onNavigate when link is clicked', () => {
    const mockNavigate = jest.fn();
    render(<Sidebar currentPage="dashboard" onNavigate={mockNavigate} />);

    const callsLink = screen.getByText('通話一覧');
    callsLink.click();

    expect(mockNavigate).toHaveBeenCalledWith('calls');
  });

  it('highlights active page link', () => {
    render(<Sidebar currentPage="calls" onNavigate={jest.fn()} />);

    const callsLink = screen.getByText('通話一覧').closest('a');
    expect(callsLink).toHaveClass('text-primary');
  });
});
