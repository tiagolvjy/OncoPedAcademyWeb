"use client";
import { useRef, useState, useEffect } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface PhotoUploadProps {
    currentURL?: string | null;
    onUpload: (url: string) => void;
    folder?: string;
}

export default function PhotoUpload({ currentURL, onUpload, folder = 'profile' }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewURL, setPreviewURL] = useState<string | null>(currentURL ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentURL) setPreviewURL(currentURL);
    }, [currentURL]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreviewURL(URL.createObjectURL(file));
        setUploading(true);
        setProgress(0);

        try {
            const storage = getStorage();
            const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgress(p);
                },
                (error) => {
                    console.error(error);
                    setUploading(false);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    onUpload(url);
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 mb-4">
            {/* AVATAR */}
            <div
                className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0"
                style={{ minWidth: 80, minHeight: 80 }}
            >
                {previewURL
                    ? <img src={previewURL} alt="Foto de perfil" className="w-full h-full object-cover" />
                    : <i className="ion-person text-[40px] text-gray-400" />
                }
            </div>

            {/* AÇÕES */}
            <div className="flex flex-col gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border border-[#4703D0] text-[#4703D0] rounded-full px-4 py-1 text-sm hover:bg-[#f0ebff] disabled:opacity-50 cursor-pointer"
                >
                    {previewURL ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                <p className="text-xs text-gray-400">Opcional · máx. 50MB</p>

                {uploading && (
                    <div className="w-[150px]">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-[#4703D0] h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Enviando... {progress}%</p>
                    </div>
                )}
            </div>
        </div>
    );
}