import "./App.css";
import { useEffect, useRef, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { saveAs } from "file-saver";

const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [video, setVideo] = useState("");
  const [videoName, setVideoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isType, setIsType] = useState("GIF");

  const formRef = useRef();

  useEffect(() => {
    const init = async () => {
      await ffmpeg.load();
    };
    init();
  }, []);

  const handleInput = (e) => {
    const file = e.target.files?.item(0);
    setVideo(URL.createObjectURL(file));
    setVideoName(file?.name);
  };

  const handleClose = () => {
    setVideo("");
    setVideoName("");
    formRef.current.reset();
  };

  const handleCovert = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name") || "output";
    const start = formData.get("start") || "0";
    const time = formData.get("time") || "10";

    const outname = isType === "GIF" ? `${name}.gif` : `${name}.mp3`;
    const type = isType === "GİF" ? "image/gif" : "audio/mp3";

    setLoading(true);

    ffmpeg.FS("writeFile", name, await fetchFile(video));
    await ffmpeg.run(
      "-i",
      name,
      "-t",
      time,
      "-ss",
      start,
      "-f",
      isType,
      outname
    );
    const data = ffmpeg.FS("readFile", outname);

    const url = URL.createObjectURL(new Blob([data.buffer], { type: type }));
    saveAs(url, outname);

    setLoading(false)
    handleClose()
  };

  return (
    <main>
      <div className="container">
        {video ? (
          <div className="video_container">
            <video controls src={video}></video>
            <button className="video_close" onClick={handleClose}>
              X
            </button>
          </div>
        ) : (
          <label className="video_input">
            Upload a video to Convert to GIF or MP3
            <input type="file" accept="video/*" onChange={handleInput} hidden />
          </label>
        )}
      </div>

      <h3 style={{ color: "white" }}>{videoName}</h3>

      <form onSubmit={handleCovert} ref={formRef}>
        <div className="group">
          <label>
            <input
              type="checkbox"
              name="type"
              value="GIF"
              checked={isType === "GIF"}
              onChange={(e) => setIsType(e.target.value)}
            />
            Convert to GIF
          </label>
          <label>
            <input
              type="checkbox"
              name="type"
              value="MP3"
              checked={isType === "MP3"}
              onChange={(e) => setIsType(e.target.value)}
            />
            Convert to MP3
          </label>
        </div>

        <div className="group">
          <label>
            <p>Image Name to Download</p>
            <input type="text" name="name" placeholder="Ex: output" />
          </label>
          <label>
            <p>Start</p>
            <input type="number" name="start" min={0} defaultValue={0} />
          </label>
          <label>
            <p>Time</p>
            <input type="number" name="time" min={10} defaultValue={10} />
          </label>

          <button disabled={!video || loading}>
            {loading
              ? "Downloading and Converting..."
              : `Download and Convert to ${isType}`}
          </button>
        </div>
      </form>
    </main>
  );
}

export default App;
