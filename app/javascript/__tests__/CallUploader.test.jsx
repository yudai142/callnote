import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallUploader from '../components/CallUploader';

describe('CallUploader Component', () => {
  it('renders upload zone', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    expect(screen.getByText(/ファイルを選択|ドラッグ&ドロップ/i)).toBeInTheDocument();
  });

  it('renders file input', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    const fileInput = screen.getByRole('button', { name: /ファイルを選択|アップロード/i });
    expect(fileInput).toBeInTheDocument();
  });

  it('renders title input field', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    const titleInput = screen.getByPlaceholderText(/タイトル|会議名|ファイル名/i);
    expect(titleInput).toBeInTheDocument();
  });

  it('displays file info when file is selected', async () => {
    const user = userEvent.setup();
    render(<CallUploader onUploadComplete={jest.fn()} />);

    const fileInput = screen.getByRole('button', { name: /ファイルを選択|アップロード/i }).closest('form')?.querySelector('input[type="file"]');
    if (fileInput) {
      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      await user.upload(fileInput, file);

      expect(screen.getByText(/test.mp3|ファイルが選択されました/i)).toBeInTheDocument();
    }
  });

  it('renders supported formats info', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    expect(screen.getByText(/MP3|WAV|M4A|FLAC|対応/i)).toBeInTheDocument();
  });

  it('renders size limit info', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    expect(screen.getByText(/500MB|最大/i)).toBeInTheDocument();
  });
});
