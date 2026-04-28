import {useEffect} from "react";

interface StatusToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

export default function StatusToast({message, type, onClose}: StatusToastProps) {
    useEffect(() => {
        const timeout = setTimeout(onClose, 3500);
        return () => clearTimeout(timeout);
    }, [message, onClose]);

    return (
        <div className="fixed right-6 top-6 z-[100000]">
            <div
                className={`min-w-[280px] rounded-xl px-4 py-3 shadow-lg ${
                    type === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">{message}</p>
                    <button className="text-white/80 hover:text-white" onClick={onClose} type="button">
                        x
                    </button>
                </div>
            </div>
        </div>
    );
}
