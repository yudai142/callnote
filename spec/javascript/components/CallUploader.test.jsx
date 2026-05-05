import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallUploader from '../../../app/javascript/components/CallUploader';

describe('CallUploader', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  it('renders upload form', () => {
    render(<CallUploader onUploadComplete={jest.fn()} />);

    expect(screen.getByText(/通話をアップロード/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /通話タイトル/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ファイルを選択/i })).toBeInTheDocument();
  });

  it('allows user to select an audio file', async () => {
    const user = userEvent.setup();
    render(<CallUploader onUploadComplete={jest.fn()} />);

    const file = new File(['audio content'], 'call.wav', { type: 'audio/wav' });
    const input = screen.getByRole('button', { name: /ファイルを選択/i }).closest('input[type="file"]');

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('call.wav')).toBeInTheDocument();
    });
  });

  it('submits form with file and title', async () => {
    const onUploadComplete = jest.fn();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Test Call', status: 'pending' })
    });

    render(<CallUploader onUploadComplete={onUploadComplete} />);

    // Fill in title
    const titleInput = screen.getByRole('textbox', { name: /通話タイトル/i });
    fireEvent.change(titleInput, { target: { value: 'Test Call' } });

    // Select file
    const file = new File(['audio content'], 'call.wav', { type: 'audio/wav' });
    const fileInput = screen.getByLabelText(/音声ファイル/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /アップロード/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/calls',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(onUploadComplete).toHaveBeenCalled();
    });
  });

  it('shows loading state during upload', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => ({ id: 1, status: 'pending' })
        });
      }, 100);
    }));

    render(<CallUploader onUploadComplete={jest.fn()} />);

    const titleInput = screen.getByRole('textbox', { name: /通話タイトル/i });
    fireEvent.change(titleInput, { target: { value: 'Test Call' } });

    const file = new File(['audio content'], 'call.wav', { type: 'audio/wav' });
    const fileInput = screen.getByLabelText(/音声ファイル/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitButton = screen.getByRole('button', { name: /アップロード/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/アップロード中/i)).toBeInTheDocument();
    });
  });

  it('displays error message on upload failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ errors: ['ファイルが必要です'] })
    });

    render(<CallUploader onUploadComplete={jest.fn()} />);

    const titleInput = screen.getByRole('textbox', { name: /通話タイトル/i });
    fireEvent.change(titleInput, { target: { value: 'Test Call' } });

    const submitButton = screen.getByRole('button', { name: /アップロード/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ファイルが必要です/i)).toBeInTheDocument();
    });
  });
});
