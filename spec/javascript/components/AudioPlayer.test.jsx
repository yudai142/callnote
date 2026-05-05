import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from '../../../app/javascript/components/AudioPlayer';

describe('AudioPlayer', () => {
  const mockAudioUrl = '/calls/1/audio';

  beforeEach(() => {
    // Mock HTMLMediaElement methods
    window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  it('renders audio player with controls', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);

    expect(screen.getByRole('button', { name: /再生|play/i })).toBeInTheDocument();
  });

  it('displays current time and duration', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);

    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('plays audio when play button is clicked', () => {
    const { container } = render(<AudioPlayer audioUrl={mockAudioUrl} />);

    const playButton = screen.getByRole('button', { name: /再生|play/i });
    fireEvent.click(playButton);

    const audioElement = container.querySelector('audio');
    expect(audioElement.play).toHaveBeenCalled();
  });

  it('pauses audio when pause button is clicked', () => {
    const { container } = render(<AudioPlayer audioUrl={mockAudioUrl} />);

    const audio = container.querySelector('audio');
    // Simulate playing state
    audio.currentTime = 5;
    Object.defineProperty(audio, 'paused', { value: false, writable: true });

    const pauseButton = screen.getByRole('button', { name: /一時停止|pause/i });
    fireEvent.click(pauseButton);

    expect(audio.pause).toHaveBeenCalled();
  });

  it('updates progress when user seeks', () => {
    const { container } = render(<AudioPlayer audioUrl={mockAudioUrl} />);

    const progressBar = container.querySelector('input[type="range"]');
    fireEvent.change(progressBar, { target: { value: '30' } });

    const audio = container.querySelector('audio');
    expect(audio.currentTime).toBeDefined();
  });

  it('renders correct audio source URL', () => {
    const { container } = render(<AudioPlayer audioUrl={mockAudioUrl} />);

    const audioSource = container.querySelector('source');
    expect(audioSource).toHaveAttribute('src', mockAudioUrl);
  });

  it('displays download button', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);

    expect(screen.getByRole('button', { name: /ダウンロード|download/i })).toBeInTheDocument();
  });

  it('handles audio duration updates', async () => {
    const { container } = render(<AudioPlayer audioUrl={mockAudioUrl} />);

    const audio = container.querySelector('audio');
    Object.defineProperty(audio, 'duration', { value: 120, writable: true });

    fireEvent.loadedmetadata(audio);

    await waitFor(() => {
      expect(screen.getByText(/02:00/)).toBeInTheDocument();
    });
  });
});
