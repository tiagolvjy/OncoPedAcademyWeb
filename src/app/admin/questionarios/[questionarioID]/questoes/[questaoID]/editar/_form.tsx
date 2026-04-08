"use client";
import { AppButton, AppInput } from "@/themes/components";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useState, useRef } from "react";
import QuestionnaireServices from "@/services/questionnaires";
import { Question, QuestionOption } from "@/types/questionnaire";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionEditForm({
    questionnaireID,
    questionID
}: {
    questionnaireID: string;
    questionID: string;
}) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [options, setOptions] = useState<QuestionOption[]>([]);
    const [order, setOrder] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ===========================================================================
    useEffect(() => {
        (async () => {
            const { success, questions } = await QuestionnaireServices.getQuestions(questionnaireID);
            if (success && questions) {
                const found = questions.find(q => q.id === questionID);
                if (found) {
                    setText(found.text);
                    setOptions(found.options);
                    setOrder(found.order.toString());
                    setImageURL(found.imageURL ?? null);
                } else {
                    setFlashData({ error: 'Questão não encontrada.' });
                    router.replace(`/admin/questionarios/${questionnaireID}`);
                }
            }
            setLoading(false);
        })();
    }, []);
    // ===========================================================================
    const handleOptionChange = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], text: value };
        setOptions(updated);
    }
    // -----------
    const handleCorrectChange = (index: number) => {
        const updated = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index,
        }));
        setOptions(updated);
    }
    // -----------
    const handleAddOption = () => {
        if (options.length >= 6) return;
        const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
        setOptions([...options, { id: ids[options.length], text: '', isCorrect: false }]);
    }
    // -----------
    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return;
        const updated = options.filter((_, i) => i !== index);
        const hasCorrect = updated.some(o => o.isCorrect);
        if (!hasCorrect) updated[0].isCorrect = true;
        setOptions(updated);
    }
    // -----------
    const handleImageUpload = async (file: File) => {
        setUploading(true);
        setUploadProgress(0);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `questionnaires/${questionnaireID}/images/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<string>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setUploadProgress(progress);
                    },
                    (err) => {
                        setError('Erro no upload da imagem.');
                        setUploading(false);
                        reject(err);
                    },
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        setImageURL(url);
                        setUploading(false);
                        resolve(url);
                    }
                );
            });
        } catch {
            setError('Erro no upload da imagem.');
            setUploading(false);
            throw new Error('Upload failed');
        }
    }
    // ===========================================================================
    const handleSubmit = async () => {
        setError(null);

        if (!text.trim()) { setError('Digite o enunciado.'); return; }
        if (!order || Number(order) < 1) { setError('Digite a ordem.'); return; }
        if (options.some(o => !o.text.trim())) { setError('Preencha todas as alternativas.'); return; }
        if (!options.some(o => o.isCorrect)) { setError('Selecione a alternativa correta.'); return; }

        const { success, error } = await QuestionnaireServices.updateQuestion(
            questionnaireID,
            questionID,
            { text, options, order: Number(order), imageURL: imageURL ?? undefined }
        );

        if (success) {
            setFlashData({ success: 'Questão atualizada com sucesso!' });
            router.replace(`/admin/questionarios/${questionnaireID}`);
        } else {
            setError(error ?? 'Erro ao atualizar questão.');
        }
    }
    // ===========================================================================
    if (loading) return <div className="flex justify-center mt-10"><i className="ion-load-c text-[40px] animate-spin" /></div>;

    return (
        <div className="flex flex-col gap-4">

            <AppInput
                placeholder="Digite o enunciado"
                label="Enunciado:"
                name="text"
                onChange={(e) => setText(e.target.value)}
                icon="help-circled"
                value={text}
            />

            <AppInput
                placeholder="Ordem de exibição"
                label="Ordem:"
                name="order"
                type="number"
                onChange={(e) => setOrder(e.target.value)}
                icon="ios-keypad"
                value={order}
            />

            {/* IMAGEM */}
            <div>
                <p className="text-sm font-medium mb-2">Imagem da questão: <span className="text-gray-400 font-normal">(opcional)</span></p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                    }}
                />
                {imageURL && (
                    <img src={imageURL} alt="Imagem da questão" className="max-w-[300px] rounded mb-2" />
                )}
                <AppButton
                    title={imageURL ? "Trocar imagem" : "Selecionar imagem"}
                    icon="image"
                    form="round"
                    type="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                />
                {uploading && (
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Enviando... {uploadProgress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#4703D0] h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ALTERNATIVAS */}
            <div>
                <p className="text-sm font-medium mb-3">Alternativas: <span className="text-gray-400 font-normal">(clique na letra correta)</span></p>
                <div className="flex flex-col gap-3">
                    {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleCorrectChange(index)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                                    option.isCorrect
                                        ? 'bg-[#1aab67] border-[#1aab67] text-black'
                                        : 'border-gray-300 text-gray-400 hover:border-[#1aab67]'
                                }`}
                            >
                                {OPTION_LABELS[index]}
                            </button>
                            <input
                                type="text"
                                placeholder={`Alternativa ${OPTION_LABELS[index]}`}
                                value={option.text}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#4703D0] bg-gray-50"
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOption(index)}
                                    className="text-[#ed1b2d] hover:opacity-70"
                                >
                                    <i className="ion-ios-trash text-[20px]" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-3 text-sm text-[#4703D0] hover:opacity-70 flex items-center gap-2"
                    >
                        <i className="ion-plus-round" /> Adicionar alternativa
                    </button>
                )}
            </div>

            {error && <p className="text-[tomato] text-[15px]">{error}</p>}

            <AppButton
                title="Salvar alterações"
                icon="checkmark"
                onClick={handleSubmit}
                disabled={uploading}
            />
        </div>
    )
}