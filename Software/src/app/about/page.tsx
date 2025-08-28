import fs from 'fs';
import path from 'path';

export default function AboutPage() {
  const imagesDirectory = path.join(process.cwd(), 'public/image_reported');
  const imageFiles = fs.readdirSync(imagesDirectory);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Reported Images</h1>
      <div className="prose max-w-none">
        <p>
          format of the images name: "Timestamp"__"Latitude"__"Longitude"__"Date".png
        </p>
      </div>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Information</th>
          </tr>
        </thead>
        <tbody>
          {imageFiles.map((file) => (
            <tr key={file}>
              <td className="border px-4 py-2">
                <img src={`/image_reported/${file}`} alt={file} className="w-32 h-32 object-cover" />
              </td>
              <td className="border px-4 py-2">{file}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}