import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle,
  Eye,
  Heart,
  Image as ImageIcon,
  RefreshCcw,
  Save,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const defaultFormData = {
  date: getTodayDate(),
  photoType: "front",
  checkInType: "weekly",
  weekNumber: "",
  weight: "",
  weightUnit: "kg",
  comparisonGroup: "",
  isStartPhoto: false,
  isFinalPhoto: false,
  isWeeklyCheckInPhoto: true,
  visibility: "private",
  tags: "",
  notes: "",
  image: null,
};

const getImageUrl = (photo) => {
  return (
    photo?.medium?.url ||
    photo?.thumbnail?.url ||
    photo?.original?.url ||
    photo?.imageUrl ||
    ""
  );
};

const getOriginalUrl = (photo) => {
  return photo?.original?.url || photo?.imageUrl || getImageUrl(photo);
};

const formatDate = (dateInput) => {
  if (!dateInput) return "--";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getTypeClass = (type) => {
  if (type === "front") return "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]";
  if (type === "side") return "border-[#00809d]/30 bg-[#00809d]/15 text-[#9ff7ec]";
  if (type === "back") return "border-[#00c2ad]/30 bg-[#00c2ad]/15 text-[#9ff7ec]";
  return "border-white/10 bg-white/[0.05] text-slate-300";
};

const StatCard = ({ title, value, helper, icon: Icon }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{value}</h2>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [todayPhotos, setTodayPhotos] = useState([]);
  const [comparison, setComparison] = useState({
    front: [],
    side: [],
    back: [],
    other: [],
  });

  const [formData, setFormData] = useState(defaultFormData);
  const [preview, setPreview] = useState(null);

  const [selectedType, setSelectedType] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getPhotoPageData = async () => {
    const [photosResponse, todayResponse, comparisonResponse] =
      await Promise.all([
        api.get("/photos?limit=60"),
        api.get("/photos/today"),
        api.get("/photos/comparison"),
      ]);

    return {
      photosData: photosResponse.data.photos || [],
      todayPhotosData: todayResponse.data.photos || [],
      comparisonData: comparisonResponse.data.grouped || {
        front: [],
        side: [],
        back: [],
        other: [],
      },
    };
  };

  const applyPhotoPageData = ({
    photosData,
    todayPhotosData,
    comparisonData,
  }) => {
    setPhotos(photosData);
    setTodayPhotos(todayPhotosData);
    setComparison(comparisonData);
  };

  const refreshPhotos = async () => {
    const data = await getPhotoPageData();
    applyPhotoPageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPhotos = async () => {
      try {
        const data = await getPhotoPageData();

        if (!isMounted) return;

        applyPhotoPageData(data);
      } catch (error) {
        console.error("Photo page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError(error.response?.data?.message || "Failed to load progress photos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPhotos();

    return () => {
      isMounted = false;

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  const photoStats = useMemo(() => {
    const front = photos.filter((photo) => photo.photoType === "front");
    const side = photos.filter((photo) => photo.photoType === "side");
    const back = photos.filter((photo) => photo.photoType === "back");
    const favorites = photos.filter((photo) => photo.isFavorite);

    return {
      total: photos.length,
      front: front.length,
      side: side.length,
      back: back.length,
      favorites: favorites.length,
    };
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedType === "all") return photos;
    if (selectedType === "favorite") return photos.filter((photo) => photo.isFavorite);
    return photos.filter((photo) => photo.photoType === selectedType);
  }, [photos, selectedType]);

  const newestPhoto = photos[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setFormData((prev) => ({
      ...prev,
      image: file || null,
    }));

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
  };

  const buildUploadPayload = () => {
    const uploadData = new FormData();

    /**
     * Important:
     * Backend route uses upload.single("image"),
     * so the file field must be named "image", not "photo".
     */
    uploadData.append("image", formData.image);

    uploadData.append("date", formData.date);
    uploadData.append("photoType", formData.photoType);
    uploadData.append("checkInType", formData.checkInType);
    uploadData.append("weightUnit", formData.weightUnit);
    uploadData.append("visibility", formData.visibility);
    uploadData.append("isStartPhoto", String(formData.isStartPhoto));
    uploadData.append("isFinalPhoto", String(formData.isFinalPhoto));
    uploadData.append("isWeeklyCheckInPhoto", String(formData.isWeeklyCheckInPhoto));
    uploadData.append("source", "upload");

    if (formData.weekNumber !== "") {
      uploadData.append("weekNumber", formData.weekNumber);
    }

    if (formData.weight !== "") {
      uploadData.append("weight", formData.weight);
    }

    if (formData.comparisonGroup.trim()) {
      uploadData.append("comparisonGroup", formData.comparisonGroup.trim());
    }

    if (formData.tags.trim()) {
      uploadData.append("tags", formData.tags.trim());
    }

    if (formData.notes.trim()) {
      uploadData.append("notes", formData.notes.trim());
    }

    return uploadData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);
    setMessage("");
    setError("");

    try {
      if (!formData.image) {
        throw new Error("Please select a progress photo.");
      }

      await api.post("/photos", buildUploadPayload(), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshPhotos();

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

  const handleToggleFavorite = async (photoId, currentValue) => {
    setActionLoadingId(photoId);
    setMessage("");
    setError("");

    try {
      await api.patch(`/photos/${photoId}/favorite`, {
        isFavorite: !currentValue,
      });

      await refreshPhotos();
      setMessage("Favorite status updated.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update favorite status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");

    if (!confirmDelete) return;

    setActionLoadingId(photoId);
    setMessage("");
    setError("");

    try {
      await api.delete(`/photos/${photoId}`);
      await refreshPhotos();

      if (selectedPhoto?._id === photoId) {
        setSelectedPhoto(null);
      }

      setMessage("Progress photo deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete photo.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading photos"
        message="Preparing your progress photos, comparison gallery, and today’s uploads."
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#00809d]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Progress Photo Tracker
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Track visual transformation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Upload front, side, and back photos. Connect photos with weekly
              check-ins, comparison groups, weight, and transformation phases.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshPhotos}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <a
              href="#upload-photo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Upload size={16} />
              Upload Photo
            </a>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-[#009587]/25 bg-[#009587]/10 px-4 py-3 text-sm text-[#9ff7ec]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Photos"
          value={photoStats.total}
          helper="All active uploads"
          icon={ImageIcon}
        />

        <StatCard
          title="Front"
          value={photoStats.front}
          helper="Front body photos"
          icon={Camera}
        />

        <StatCard
          title="Side"
          value={photoStats.side}
          helper="Side body photos"
          icon={Camera}
        />

        <StatCard
          title="Back"
          value={photoStats.back}
          helper="Back body photos"
          icon={Camera}
        />

        <StatCard
          title="Favorites"
          value={photoStats.favorites}
          helper="Marked for comparison"
          icon={Star}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Upload form */}
        <form
          id="upload-photo"
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Upload progress photo
              </h2>
              <p className="text-sm text-slate-400">
                Backend will create thumbnail, medium, and original Cloudinary variants.
              </p>
            </div>

            <span className="rounded-2xl border border-[#009587]/25 bg-[#009587]/10 px-3 py-1.5 text-xs font-semibold text-[#9ff7ec]">
              JPG • PNG • WEBP
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Photo type
              </label>
              <select
                name="photoType"
                value={formData.photoType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="front">Front</option>
                <option value="side">Side</option>
                <option value="back">Back</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Check-in type
              </label>
              <select
                name="checkInType"
                value={formData.checkInType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="start">Start</option>
                <option value="final">Final</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Week number
              </label>
              <input
                type="number"
                name="weekNumber"
                value={formData.weekNumber}
                onChange={handleChange}
                min="1"
                placeholder="1"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Weight</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="80.5"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Weight unit
              </label>
              <select
                name="weightUnit"
                value={formData.weightUnit}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Comparison group
              </label>
              <input
                name="comparisonGroup"
                value={formData.comparisonGroup}
                onChange={handleChange}
                placeholder="week-1"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="private">Private</option>
                <option value="progress_report">Progress report</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-2 block text-sm text-slate-300">
                Select image
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[#009587]/30 bg-[#009587]/5 p-6 text-center transition hover:bg-[#009587]/10">
                <Upload size={28} className="mb-3 text-[#9ff7ec]" />
                <p className="font-semibold text-slate-200">
                  Click to select progress photo
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  JPG, PNG, or WEBP. Field is sent as <strong>image</strong>.
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <input
                    type="checkbox"
                    name="isStartPhoto"
                    checked={formData.isStartPhoto}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#009587]"
                  />
                  <span className="text-sm text-slate-300">Start photo</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <input
                    type="checkbox"
                    name="isFinalPhoto"
                    checked={formData.isFinalPhoto}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#009587]"
                  />
                  <span className="text-sm text-slate-300">Final photo</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <input
                    type="checkbox"
                    name="isWeeklyCheckInPhoto"
                    checked={formData.isWeeklyCheckInPhoto}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#009587]"
                  />
                  <span className="text-sm text-slate-300">Weekly check-in</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-2 block text-sm text-slate-300">Tags</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="week1, fat_loss, front"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-2 block text-sm text-slate-300">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Example: Week 1 front photo, same lighting, morning check-in."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>
          </div>

          {preview && (
            <div className="mt-5">
              <p className="mb-2 text-sm text-slate-300">Preview</p>
              <img
                src={preview}
                alt="Preview"
                className="h-80 w-full rounded-3xl border border-white/10 object-cover"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
        </form>

        {/* Side panel */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Today’s photos
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Uploaded photos for today.
            </p>

            {todayPhotos.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                No photos uploaded today.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {todayPhotos.slice(0, 4).map((photo) => (
                  <button
                    key={photo._id}
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left"
                  >
                    <img
                      src={getImageUrl(photo)}
                      alt={photo.photoType}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-xs font-semibold capitalize text-slate-200">
                        {photo.photoType}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Photo tips
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              {[
                "Use similar lighting every time.",
                "Take front, side, and back photos.",
                "Use weekly photos for better comparison.",
                "Pair photos with weight and measurement logs.",
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex gap-3 rounded-2xl bg-white/[0.04] p-4"
                >
                  <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#00c2ad]" />
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {newestPhoto && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
              <h2 className="text-xl font-semibold tracking-tight">
                Latest photo
              </h2>

              <button
                type="button"
                onClick={() => setSelectedPhoto(newestPhoto)}
                className="mt-4 block w-full overflow-hidden rounded-3xl border border-white/10 bg-[#061316]/50 text-left"
              >
                <img
                  src={getImageUrl(newestPhoto)}
                  alt={newestPhoto.photoType}
                  className="h-52 w-full object-cover"
                />

                <div className="p-4">
                  <p className="font-semibold capitalize">
                    {newestPhoto.photoType} photo
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(newestPhoto.date)}
                    {newestPhoto.weight ? ` • ${newestPhoto.weight} kg` : ""}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Photo history
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Filter photos by type or favorites.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "front", "side", "back", "other", "favorite"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  selectedType === type
                    ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                    : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No progress photos found for this filter.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#061316]/50 shadow-xl shadow-black/10"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative block w-full"
                >
                  <img
                    src={getImageUrl(photo)}
                    alt={photo.photoType}
                    className="h-72 w-full object-cover"
                  />

                  <span
                    className={`absolute left-3 top-3 rounded-2xl border px-3 py-1 text-xs font-semibold capitalize ${getTypeClass(
                      photo.photoType
                    )}`}
                  >
                    {photo.photoType}
                  </span>

                  {photo.isFavorite && (
                    <span className="absolute right-3 top-3 rounded-2xl bg-[#009587]/80 p-2 text-white shadow-lg">
                      <Star size={16} fill="currentColor" />
                    </span>
                  )}
                </button>

                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {photo.photoType} photo
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(photo.date)}
                        {photo.weight ? ` • ${photo.weight} ${photo.weightUnit || "kg"}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleFavorite(photo._id, photo.isFavorite)
                      }
                      disabled={actionLoadingId === photo._id}
                      className="rounded-2xl bg-white/[0.05] p-2 text-slate-300 transition hover:bg-[#009587]/15 hover:text-[#9ff7ec] disabled:opacity-60"
                    >
                      <Heart
                        size={18}
                        fill={photo.isFavorite ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {photo.checkInType && (
                      <span className="rounded-xl bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {photo.checkInType}
                      </span>
                    )}

                    {photo.weekNumber && (
                      <span className="rounded-xl bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        Week {photo.weekNumber}
                      </span>
                    )}

                    {photo.comparisonGroup && (
                      <span className="rounded-xl bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {photo.comparisonGroup}
                      </span>
                    )}
                  </div>

                  {photo.notes && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                      {photo.notes}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <a
                      href={getOriginalUrl(photo)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      Open
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo._id)}
                      disabled={actionLoadingId === photo._id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison summary */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">
          Comparison groups
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Backend grouped photos by front, side, back, and other.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            { key: "front", label: "Front", data: comparison.front || [] },
            { key: "side", label: "Side", data: comparison.side || [] },
            { key: "back", label: "Back", data: comparison.back || [] },
            { key: "other", label: "Other", data: comparison.other || [] },
          ].map((group) => (
            <div
              key={group.key}
              className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
            >
              <p className="text-sm text-slate-400">{group.label}</p>
              <h3 className="mt-1 text-3xl font-bold">{group.data.length}</h3>

              {group.data[0] && (
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(group.data[0])}
                  className="mt-4 overflow-hidden rounded-2xl border border-white/10"
                >
                  <img
                    src={getImageUrl(group.data[0])}
                    alt={group.label}
                    className="h-28 w-full object-cover"
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#07191d] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {selectedPhoto.photoType} photo
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDate(selectedPhoto.date)}
                  {selectedPhoto.weight
                    ? ` • ${selectedPhoto.weight} ${selectedPhoto.weightUnit || "kg"}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <img
                src={getOriginalUrl(selectedPhoto)}
                alt={selectedPhoto.photoType}
                className="max-h-[70vh] w-full rounded-3xl object-contain"
              />

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">Details</p>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Type</span>
                      <span className="capitalize">{selectedPhoto.photoType}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Check-in</span>
                      <span className="capitalize">
                        {selectedPhoto.checkInType || "--"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Week</span>
                      <span>{selectedPhoto.weekNumber || "--"}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Comparison</span>
                      <span>{selectedPhoto.comparisonGroup || "--"}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Favorite</span>
                      <span>{selectedPhoto.isFavorite ? "Yes" : "No"}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">Size</span>
                      <span>
                        {selectedPhoto.width || "--"} × {selectedPhoto.height || "--"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPhoto.notes && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">Notes</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      {selectedPhoto.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleFavorite(
                        selectedPhoto._id,
                        selectedPhoto.isFavorite
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#009587]/15 px-4 py-2.5 text-sm font-semibold text-[#9ff7ec] transition hover:bg-[#009587]/20"
                  >
                    <Heart
                      size={16}
                      fill={selectedPhoto.isFavorite ? "currentColor" : "none"}
                    />
                    Favorite
                  </button>

                  <a
                    href={getOriginalUrl(selectedPhoto)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Open Original
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(selectedPhoto._id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;