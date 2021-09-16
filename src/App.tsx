import React, { useRef, useState } from 'react';
import './App.css';

const downloadFile = (filename: string, blob: Blob) => {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 100);
};

const Wrapper: React.FC = () => {
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const [completeBlob, setCompleteBlob] = useState<Blob>();

  const recorderRef = useRef<MediaRecorder>();
  const streamRef = useRef<MediaStream>();

  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream: MediaStream) => {
        streamRef.current = stream;

        recorderRef.current = new MediaRecorder(
          streamRef.current as MediaStream,
        );

        const chunks: Blob[] = [];
        recorderRef.current.ondataavailable = (e) => {
          chunks.push(e.data);
        };
        recorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: chunks[0].type });

          (videoElementRef.current as HTMLVideoElement).src =
            URL.createObjectURL(blob);

          setCompleteBlob(blob);
        };

        recorderRef.current.start();
      })
      .catch(() => {});
  }

  const onStartClick = async () => {
    setIsRecording(true);
    startRecording().catch(() => {});
  };

  const onStopClick = () => {
    (recorderRef.current as MediaRecorder).stop();
    (streamRef.current as MediaStream)
      .getTracks()
      .forEach((track) => track.stop());
    setIsRecording(false);
  };

  const downloadRecording = () => {
    downloadFile('nagranie.mkv', completeBlob as Blob);
  };

  return (
    <div className="App">
      <div className={'App-header'}>
        <div className={'App-buttons-wrapper'}>
          <button type="button" onClick={onStartClick} disabled={isRecording}>
            Start Recording
          </button>
          <button type="button" onClick={onStopClick} disabled={!isRecording}>
            Stop Recording
          </button>
        </div>

        {completeBlob && (
          <React.Fragment>
            <button type="button" onClick={downloadRecording}>
              Download the movie
            </button>

            <p>
              After you&apos;re done with recording, you can convert your movie
              to be smaller here: <br />
              <a
                className={'App-link'}
                target="_blank"
                href="https://cloudconvert.com/mkv-to-mp4"
                rel="noreferrer"
              >
                https://cloudconvert.com/mkv-to-mp4
              </a>
              <br /> or here: <br />
              <a
                className={'App-link'}
                target="_blank"
                href="https://www.freeconvert.com/mkv-to-mp4"
                rel="noreferrer"
              >
                https://www.freeconvert.com/mkv-to-mp4
              </a>
            </p>
          </React.Fragment>
        )}

        <video
          ref={videoElementRef}
          autoPlay
          controls
          className={completeBlob ? 'video-visible' : undefined}
        />
      </div>
    </div>
  );
};

export default Wrapper;
