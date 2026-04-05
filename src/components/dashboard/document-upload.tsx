'use client';

export default function DocumentUpload({ onUpload }: { onUpload: (file: File, category: string) => void }) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0], 'other');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0], 'other');
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
    >
      <div className="text-4xl mb-4">📁</div>
      <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
      <p className="text-gray-600 mb-4">Drag and drop files here or click to select</p>
      <input
        type="file"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
        multiple
      />
      <label
        htmlFor="file-upload"
        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
      >
        Select Files
      </label>
    </div>
  );
}
