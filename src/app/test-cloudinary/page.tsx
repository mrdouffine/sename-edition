/* eslint-disable react/no-unescaped-entities */
'use client';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

export default function CloudinaryTestPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Test Cloudinary sur Antigravity</h1>

            <section className="mb-12 p-6 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">1. Affichage d&apos;une image (CldImage)</h2>
                <div className="flex flex-col items-center">
                    <CldImage
                        width="600"
                        height="400"
                        src="cld-sample-5" // Image d&apos;exemple Cloudinary
                        sizes="100vw"
                        alt="Description de mon image"
                        className="rounded-lg shadow-md"
                    />
                    <p className="mt-2 text-sm text-gray-500">Image chargée via Cloudinary avec optimisation automatique</p>
                </div>
            </section>

            <section className="p-6 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">2. Upload d&apos;image (CldUploadWidget)</h2>
                <div className="flex flex-col items-center gap-4">
                    <CldUploadWidget
                        uploadPreset="ml_default"
                        onSuccess={(result) => {
                            if (typeof result.info === 'object' && result.info.secure_url) {
                                setImageUrl(result.info.secure_url);
                                console.log('Upload réussi ! URL :', result.info.secure_url);
                            }
                        }}
                    >
                        {({ open }) => {
                            return (
                                <button
                                    onClick={() => open()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all shadow-lg"
                                >
                                    Uploader une image
                                </button>
                            );
                        }}
                    </CldUploadWidget>

                    {imageUrl && (
                        <div className="mt-6 p-4 bg-white rounded border flex flex-col items-center">
                            <p className="text-green-600 font-medium mb-2">Image uploadée avec succès !</p>
                            <img src={imageUrl} alt="Uploaded" className="max-w-full h-auto rounded shadow-sm max-h-64" />
                            <code className="text-xs bg-gray-100 p-2 mt-2 break-all rounded w-full">
                                {imageUrl}
                            </code>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
