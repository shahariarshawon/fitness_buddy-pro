import { useEffect, useState } from "react";
import { Camera, Trash2, Upload, Image } from "lucide-react";
import api from "../services/api";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const Photos = () => {
  const [photos, setPhotos] = useState([]);

  const [formData, setFormData] = useState({
    date: getTodayDate(),
    photoType: "front",
    weight: "",
    notes: "",
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/photos")
      .then((response) => {
        if (isMounted) {
          setPhotos(response.data.photos || []);
        }
      })
      .catch((error) => {
        console.error("Photo page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load progress photos.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchPhotos = async () => {
    const response = await api.get("/photos");
    setPhotos(response.data.photos || []);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      photo: file || null,
    }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      photoType: "front",
      weight: "",
      notes: "",
      photo: null,
    });

    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);
    setMessage("");
    setError("");

    try {
      if (!formData.photo) {
        throw new Error("Please select a progress photo.");
      }

      const uploadData = new FormData();

      uploadData.append("photo", formData.photo);
      uploadData.append("date", formData.date);
      uploadData.append("photoType", formData.photoType);
      uploadData.append("weight", formData.weight);
      uploadData.append("notes", formData.notes);

      await api.post("/photos", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchPhotos();

      resetForm();
      setMessage("Progress photo uploaded successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload progress photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/photos/${id}`);
      await fetchPhotos();
      setMessage("Progress photo deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete photo.");
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading progress photos...</div>;
  }

  const frontPhotos = photos.filter((photo) => photo.photoType === "front");
  const sidePhotos = photos.filter((photo) => photo.photoType === "side");
  const backPhotos = photos.filter((photo) => photo.photoType === "back");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Progress Photos</h1>
        <p className="text-slate-400">
          Upload and track your transformation photos over time.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Photos</p>
            <Image className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{photos.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Front Photos</p>
            <Camera className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{frontPhotos.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Side Photos</p>
            <Camera className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{sidePhotos.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Back Photos</p>
            <Camera className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{backPhotos.length}</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Upload Photo</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Photo Type
              </label>
              <select
                name="photoType"
                value={formData.photoType}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="front">Front</option>
                <option value="side">Side</option>
                <option value="back">Back</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Weight
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="80.5"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Select Photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-slate-300 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-white hover:file:bg-orange-600"
              />
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, WEBP. Max size depends on backend upload limit.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Example: Week 1 front photo."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          {preview && (
            <div className="mt-5">
              <p className="text-sm text-slate-300 mb-2">Preview</p>
              <img
                src={preview}
                alt="Preview"
                className="h-72 w-full rounded-2xl object-cover border border-slate-800"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Photo Tips</h2>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800 p-4">
              Take photos in similar lighting every time.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              Use the same angle: front, side, and back.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              Take weekly photos, not daily photos, for better comparison.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              Pair photos with weight and measurement logs.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Photo History</h2>

        {photos.length === 0 ? (
          <div className="text-slate-400">No progress photos uploaded yet.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.photoType}
                  className="h-72 w-full object-cover"
                />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {photo.photoType} Photo
                      </h3>

                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(photo.date).toLocaleDateString()}
                        {photo.weight ? ` • ${photo.weight} kg` : ""}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo._id)}
                      className="rounded-xl bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {photo.notes && (
                    <p className="mt-3 text-sm text-slate-400">
                      {photo.notes}
                    </p>
                  )}

                  <a
                    href={photo.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Open Image
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Photos;